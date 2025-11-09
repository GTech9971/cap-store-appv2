import {
    IonButton,
    IonCol,
    IonGrid,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonText,
    IonThumbnail,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import {
    Bom,
    CategoriesApi,
    ComponentsApi,
    FetchComponentRequest,
    PartsComponent,
    ProjectHistory,
    Supplier
} from "cap-store-api-def";
import { useCallback, useMemo, useState } from "react";
import useSWR from 'swr';
import { parseApiError } from "ui/utils/parseApiError";
import { BomSupplierInputAlert } from "ui/components/projects/BomSupplierInputAlert";
import { ProjectHistoryDiff } from "ui/components/projects/histories/ProjectHistoryDiff";
import ComponentSearchModal from "ui/components/projects/ComponentSearchModal";

export type ProjectBomListProps = {
    componentApi: ComponentsApi,
    categoryApi: CategoriesApi,
    bomList: Bom[];
    onAdd: () => void;
    onChange: (index: number, patch: Partial<Bom>) => void;
    onDelete: (index: number) => void;
    history: ProjectHistory | undefined,
};

export const ProjectBomList: React.FC<ProjectBomListProps> = ({
    componentApi,
    categoryApi,
    bomList,
    onAdd,
    onChange,
    onDelete,
    history
}) => {
    const totalQuantity = useMemo(() => bomList.reduce((sum, bom) => sum + (bom.quantity ?? 0), 0), [bomList]);

    // 電子部品検索モーダル表示・非表示
    const [isShowCModal, setIsShowCModal] = useState<boolean>(false);
    const [selectIndex, setSelectIndex] = useState<number | undefined>(undefined);

    const [apiError, setApiError] = useState<string | null>(null);

    /**
     * 電子部品情報取得用フェッチャ（SWRで使用）
     * - ここではcomponentIdを受けてAPIから詳細を取得する
     */
    const fetchComponentById = useCallback(async (id: string): Promise<PartsComponent | undefined> => {
        try {
            const request: FetchComponentRequest = { componentId: id };
            const response = await componentApi.fetchComponent(request);
            return response?.data;
        } catch (error) {
            const { message, status } = await parseApiError(error);
            setApiError(`電子部品情報の取得に失敗。 ${message}:${status}`);
            return undefined;
        }
    }, [componentApi]);

    /** 検索モーダルの電子部品決定時 */
    const handleOnSelectCModal = useCallback((c: PartsComponent) => {
        if (selectIndex === undefined) { throw new Error('BOM行が選択されていません.'); }
        onChange(selectIndex, { componentId: c.id });
    }, [onChange, selectIndex]);

    return (
        <IonList inset>

            {apiError &&
                <IonNote color='danger'>
                    {apiError}
                </IonNote>
            }

            <IonItem lines="full">
                <ProjectHistoryDiff history={history} field='bomList'>
                    <IonLabel>BOM</IonLabel>
                </ProjectHistoryDiff>

                <IonButton slot="end" fill="clear" onClick={onAdd}>
                    <IonIcon slot="icon-only" icon={addOutline} />
                </IonButton>
            </IonItem>

            {bomList.length === 0 &&
                <IonItem lines="none">
                    <IonNote>登録されたBOMがありません</IonNote>
                </IonItem>
            }

            {bomList.map((bom, index) => (
                <ProjectBomRow
                    key={bom.id ?? index}
                    index={index}
                    bom={bom}
                    onChange={onChange}
                    onDelete={onDelete}
                    onOpenComponentModal={(i) => { setSelectIndex(i); setIsShowCModal(true); }}
                    fetchComponentById={fetchComponentById} />
            ))}

            <IonItem lines="none">
                <IonNote>合計数量: {totalQuantity}</IonNote>
            </IonItem>

            <ComponentSearchModal
                categoryApi={categoryApi}
                isOpen={isShowCModal}
                onClose={() => { setIsShowCModal(false) }}
                onSelect={handleOnSelectCModal} />

        </IonList>
    );
};

export default ProjectBomList;

/**
 * BOMの1行を表示する行コンポーネント
 * - 各行で電子部品詳細を非同期取得し、描画に使用する
 * - 親の描画フェーズでは非同期にしないため、内部でSWRを用いる
 */
const ProjectBomRow: React.FC<{
    index: number;
    bom: Bom;
    onChange: (index: number, patch: Partial<Bom>) => void;
    onDelete: (index: number) => void;
    onOpenComponentModal: (index: number) => void;
    fetchComponentById: (id: string) => Promise<PartsComponent | undefined>;
}> = ({
    index,
    bom,
    onChange,
    onDelete,
    onOpenComponentModal,
    fetchComponentById
}) => {
        const [presentSupplierAlert] = BomSupplierInputAlert();

        // コンポーネント情報の取得（componentIdが無い場合はスキップ）
        const { data: component } = useSWR(
            bom.componentId ? ['component', bom.componentId] : null,
            async ([, id]) => fetchComponentById(id)
        );

        return (
            <IonItem lines="full">
                <IonGrid style={{ width: '100%' }}>
                    <IonRow>
                        <IonCol size="3.5">
                            <div
                                style={{ cursor: 'pointer' }}
                                onClick={() => onOpenComponentModal(index)}>
                                <IonLabel position="stacked">部品 <span style={{ color: 'red' }}>*</span></IonLabel>

                                {component ? (
                                    <IonThumbnail>
                                        <IonImg src={component?.images?.[0] ?? undefined} />
                                    </IonThumbnail>
                                ) : (
                                    <IonNote>部品を選択してください</IonNote>
                                )}
                            </div>

                            <div>
                                <IonText>
                                    {component?.name}
                                </IonText>
                                <br />
                                <IonNote>
                                    {component?.modelName}
                                </IonNote>
                            </div>
                        </IonCol>

                        <IonCol size="1">
                            <IonInput
                                type="number"
                                label="数量"
                                labelPlacement="stacked"
                                min="1"
                                value={String(bom.quantity ?? 0)}
                                onIonInput={(e) => onChange(index, { quantity: Number(e.detail.value ?? "0") })} />
                        </IonCol>
                        <IonCol size="2">
                            <IonInput
                                label="フットプリント"
                                labelPlacement="stacked"
                                value={bom.footPrintName ?? ""}
                                onIonInput={(e) => onChange(index, { footPrintName: e.detail.value ?? undefined })} />
                        </IonCol>
                        <IonCol size="2">
                            <IonInput
                                label="参照記号"
                                labelPlacement="stacked"
                                value={bom.refName ?? ""}
                                onIonInput={(e) => onChange(index, { refName: e.detail.value ?? undefined })} />
                        </IonCol>
                        <IonCol>
                            <IonInput
                                label="備考"
                                labelPlacement="stacked"
                                value={bom.remarks ?? ""}
                                onIonInput={(e) => onChange(index, { remarks: e.detail.value ?? undefined })} />
                        </IonCol>

                        <IonCol style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <IonItem
                                button
                                detail={false}
                                onClick={async () => {
                                    const input: Supplier | null = await presentSupplierAlert(bom?.supplier);
                                    if (input === null) { return; }
                                    onChange(index, { supplier: input });
                                }}>

                                <IonText color='secondary'>
                                    購入先
                                </IonText>
                            </IonItem>
                        </IonCol>

                        <IonCol size="auto" style={{ display: 'flex', justifyContent: 'center' }}>
                            <IonButton color="danger" fill="clear" onClick={() => onDelete(index)}>
                                削除
                            </IonButton>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonItem>
        );
    };

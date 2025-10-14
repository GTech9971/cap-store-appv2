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
    IonSelect,
    IonSelectOption,
    IonThumbnail
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import { Bom, ComponentsApi, FetchComponentsRequest, PartsComponent } from "cap-store-api-def";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseApiError } from "ui/utils/parseApiError";

export type ProjectBomListProps = {
    componentApi: ComponentsApi,
    bomList: Bom[];
    onAdd: () => void;
    onChange: (index: number, patch: Partial<Bom>) => void;
    onDelete: (index: number) => void;
};

export const ProjectBomList: React.FC<ProjectBomListProps> = ({
    componentApi,
    bomList,
    onAdd,
    onChange,
    onDelete }) => {
    const totalQuantity = useMemo(() => bomList.reduce((sum, bom) => sum + (bom.quantity ?? 0), 0), [bomList]);

    const [components, setComponents] = useState<PartsComponent[]>([]);
    const [componentIdList, setComponentIdList] = useState<string[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchComponents = useCallback(async () => {
        if (components.length > 0) { return; }
        try {
            const request: FetchComponentsRequest = {
                pageIndex: 1,
                pageSize: 50
            };
            const response = await componentApi.fetchComponents(request);
            if (response?.data) {
                setComponents(response.data);
                setComponentIdList(response.data.map(x => x.id));
            }
        } catch (error) {
            const { message, status } = await parseApiError(error);
            setApiError(`電子部品情報の取得に失敗。 ${message}:${status}`);
        }
    }, [componentApi, components.length]);

    useEffect(() => {
        fetchComponents();
    }, [fetchComponents]);

    const findComponentById = useCallback((id: string): PartsComponent | undefined => {
        return components.find(x => x.id === id);
    }, [components]);

    return (
        <IonList inset>

            {apiError &&
                <IonNote color='danger'>
                    {apiError}
                </IonNote>
            }

            <IonItem lines="full">
                <IonLabel>BOM</IonLabel>
                <IonButton slot="end" fill="clear" onClick={onAdd}>
                    <IonIcon slot="icon-only" icon={addOutline} />
                </IonButton>
            </IonItem>

            {bomList.length === 0 ? (
                <IonItem lines="none">
                    <IonNote>登録されたBOMがありません</IonNote>
                </IonItem>
            ) : (
                bomList.map((bom, index) => (
                    <IonItem key={bom.id ?? index} lines="full">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="2">
                                    <IonThumbnail>
                                        <IonImg src={findComponentById(bom.componentId)?.images?.[0] ?? undefined} />
                                    </IonThumbnail>
                                </IonCol>
                                <IonCol size="2">
                                    <IonLabel position="stacked">部品ID <span style={{ color: 'red' }}>*</span></IonLabel>
                                    <IonSelect
                                        required
                                        value={bom.componentId}
                                        onIonChange={(e) => onChange(index, { id: e.detail.value })}
                                        placeholder="選択してください">
                                        {componentIdList.map(id => (
                                            <IonSelectOption key={id} value={id}>
                                                {id}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>

                                </IonCol>
                                <IonCol size="1.5">
                                    <IonInput
                                        type="number"
                                        label="数量"
                                        labelPlacement="stacked"
                                        min="1"
                                        value={String(bom.quantity ?? 0)}
                                        onIonInput={(e) => onChange(index, { quantity: Number(e.detail.value ?? "0") })}
                                    />
                                </IonCol>
                                <IonCol size="2">
                                    <IonInput
                                        label="フットプリント"
                                        labelPlacement="stacked"
                                        value={bom.footPrintName ?? ""}
                                        onIonInput={(e) => onChange(index, { footPrintName: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol size="2">
                                    <IonInput
                                        label="参照記号"
                                        labelPlacement="stacked"
                                        value={bom.refName ?? ""}
                                        onIonInput={(e) => onChange(index, { refName: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        label="備考"
                                        labelPlacement="stacked"
                                        value={bom.remarks ?? ""}
                                        onIonInput={(e) => onChange(index, { remarks: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol size="auto" className="ion-align-self-end">
                                    <IonButton color="danger" fill="clear" onClick={() => onDelete(index)}>
                                        削除
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonItem>
                ))
            )}

            <IonItem lines="none">
                <IonNote>合計数量: {totalQuantity}</IonNote>
            </IonItem>
        </IonList>
    );
};

export default ProjectBomList;

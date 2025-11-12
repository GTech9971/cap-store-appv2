import { useApiClint } from "@/api/useApiClient"
import { useAuthState } from "@/hooks/useAuthState"
import {
    IonBackButton,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonPage,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
    useIonAlert
} from "@ionic/react"
import { Category, Maker, PartsComponent, UpdateComponentRequest } from "cap-store-api-def"
import { documentOutline, cubeOutline, createOutline } from "ionicons/icons"
import { useCallback, useEffect, useMemo, useState } from "react"
import ReactMarkdown from "react-markdown"
import { useParams } from "react-router-dom"
import ImageCarousel from "ui/components/image-carousels/ImageCarousel"
import ImageCarouselSelectModal from "ui/components/image-carousels/ImageCarouselSelectModal"
import { InventoryModal } from "ui/components/InventoryModal";
import { useConfirmUtils } from "ui/utils/alertUtils"
import { parseApiError } from "ui/utils/parseApiError"

export const PartDetailPage = () => {
    // URL
    const { id } = useParams<{ id: string }>();

    // 電子部品
    const [part, setPart] = useState<PartsComponent | null>(null);
    const [error, setError] = useState<string | null>(null);

    // マスター系
    const [categories, setCategories] = useState<Category[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);

    // 入力フォーム
    const [description, setDescription] = useState<string | undefined>(undefined);
    const [name, setName] = useState<string>();
    const [modelName, setModelName] = useState<string>();
    const [selectedCategoryId, setSelectedCategoryId] = useState<unknown>();
    const [selectedMakerId, setSelectedMakerId] = useState<unknown>();
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [isOpenImageModal, setIsOpenImageModal] = useState<boolean>(false);

    // API
    const { componentApi, categoryApi, makerApi, inventoryApi, updateComponentApi } = useApiClint();

    // Markdown
    const [isPreviewMD, setIsPreviewMd] = useState<boolean>(true);
    const markdownComponent = {
        a: ({ ...props }) => {
            const isExternal = props.href?.startsWith('http');
            return (
                <IonText color={`${isExternal ? 'primary' : 'light'}`}>
                    <a {...props}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined} />
                </IonText>
            );
        },
    }

    // データシート系
    const pdfLinks = useMemo(() => {
        if (!part?.description) return [];
        const matches = [...part.description.matchAll(/https?:\/\/[^\s)]+\.pdf/g)];
        return matches.map((m) => m[0]);
    }, [part?.description]);

    // 初期データ取得
    useEffect(() => {
        const fetchPart = async () => {
            try {
                const response = await componentApi.fetchComponent({ componentId: id! });
                setPart(response.data ?? null);
                setName(response.data?.name ?? "");
                setModelName(response.data?.modelName ?? "");
                setDescription(response.data?.description ?? undefined);
                setSelectedCategoryId(response.data?.category.id ?? "");
                setSelectedMakerId(response.data?.maker.id ?? "");
                setImageUrls(response.data?.images ?? []);

                const [catRes, makRes] = await Promise.all([
                    categoryApi.fetchCategories(),
                    makerApi.fetchMakers()
                ]);
                setCategories(catRes?.data ?? []);
                setMakers(makRes?.data ?? []);
            } catch (err) {
                const { message, status } = await parseApiError(err);
                setError(`部品情報の取得に失敗しました。${message}:${status}`);
            }
        };
        if (id) fetchPart();
    }, [id, componentApi, categoryApi, makerApi, inventoryApi]);

    // 在庫系
    const [isOpenIModal, setIsOpenIModal] = useState<boolean>(false);


    // ダイアログ系
    const { handleConfirm } = useConfirmUtils();
    const [presentAlert] = useIonAlert();

    const handleSave = useCallback(async () => {
        if (!part || !id) return;
        // 更新フィールドをリスト化し、確認ダイアログを表示

        const updateReq: UpdateComponentRequest = {
            images: imageUrls
        };
        const maskFields: string[] = [];

        if (name !== part.name) {
            updateReq.name = name;
            maskFields.push("name");
        }
        if (modelName !== part.modelName) {
            updateReq.modelName = modelName;
            maskFields.push("modelName");
        }
        if (description !== part.description) {
            updateReq.description = description;
            maskFields.push("description");
        }
        if (selectedCategoryId !== part.category.id) {
            updateReq.categoryId = selectedCategoryId as string;
            maskFields.push("categoryId");
        }
        if (selectedMakerId !== part.maker.id) {
            updateReq.makerId = selectedMakerId as string;
            maskFields.push("makerId");
        }
        if (imageUrls !== part.images) {
            updateReq.images = imageUrls;
            maskFields.push("images");
        }

        if (maskFields.length === 0) return;
        // 確認ダイアログ：更新する項目を全て表示
        const confirmMessage = '以下の項目を更新します：\n' +
            maskFields.map(f => `- ${f}`).join('\n') +
            '\nよろしいですか？';
        if (await handleConfirm(confirmMessage) === false) return;

        try {
            // 複数の fieldMask を繰り返しパラメータとして渡す
            const res = await updateComponentApi(updateReq, maskFields, id);
            const updated: PartsComponent | undefined = res.data;
            if (updated) {
                setPart(updated);
                // ローカル state に同期
                setName(updated.name);
                setModelName(updated.modelName);
                setDescription(updated.description);
                setSelectedCategoryId(updated.category.id);
                setSelectedMakerId(updated.maker.id);
                setImageUrls(updated.images ?? []);
                // 成功メッセージ
                await presentAlert('更新が完了しました。')
            }
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setError(`部品情報の更新に失敗しました。${message}:${status}`);
        }
    }, [part, id, name, modelName, description, selectedCategoryId, selectedMakerId, imageUrls, updateComponentApi, handleConfirm, presentAlert]);


    // 認証系
    const { isAuthenticated } = useAuthState();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
                    <IonTitle>{name} - {part?.currentStock}個</IonTitle>
                    <IonButtons slot="end">
                        <IonButton disabled={!isAuthenticated} onClick={handleSave}>更新</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen color='light'>
                {error &&
                    <IonNote color='danger'>{error}</IonNote>
                }
                <IonGrid>
                    <IonRow>
                        <IonCol size="6">
                            <IonList inset>
                                <IonItem>
                                    <IonInput
                                        labelPlacement="floating"
                                        required
                                        value={name}
                                        onIonInput={(e) => setName(e.detail.value ?? undefined)}
                                    >
                                        <div slot="label">名称 <IonText color="danger">*</IonText></div>

                                    </IonInput>

                                </IonItem>

                                <ImageCarousel
                                    images={imageUrls}
                                    onDelete={(index) => {
                                        const updated = (imageUrls || []).filter((_, i) => i !== index);
                                        setImageUrls(updated);
                                    }}
                                />
                                <IonItem>
                                    <IonButton slot="end" fill="clear" onClick={() => setIsOpenImageModal(true)}>
                                        編集
                                    </IonButton>

                                    <ImageCarouselSelectModal
                                        isOpen={isOpenImageModal}
                                        onDismiss={() => setIsOpenImageModal(false)}
                                        onChange={e => { setImageUrls(e) }}
                                        images={imageUrls} />
                                </IonItem>

                            </IonList>

                        </IonCol>


                        <IonCol>

                            <IonList inset>

                                <IonItem>
                                    <IonInput
                                        labelPlacement="floating"
                                        required
                                        value={modelName}
                                        onIonInput={(e) => setModelName(e.detail.value ?? undefined)}
                                    >
                                        <div slot="label">型番 <IonText color="danger">*</IonText></div>
                                    </IonInput>

                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked">カテゴリ <span style={{ color: 'red' }}>*</span></IonLabel>
                                    <IonSelect
                                        required
                                        value={selectedCategoryId}
                                        onIonChange={(e) => setSelectedCategoryId(e.detail.value)}
                                        placeholder="選択してください"
                                    >
                                        {categories.map(cat => (
                                            <IonSelectOption key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked">メーカー <span style={{ color: 'red' }}>*</span></IonLabel>
                                    <IonSelect
                                        value={selectedMakerId}
                                        onIonChange={(e) => setSelectedMakerId(e.detail.value)}
                                        placeholder="選択してください"
                                    >
                                        {makers.map((maker, index) => (
                                            <IonSelectOption key={index} value={maker.id}>
                                                {maker.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                </IonItem>

                            </IonList>

                        </IonCol>
                    </IonRow>



                    {/* MD */}
                    <IonRow>
                        <IonCol>
                            <IonList inset>
                                <IonListHeader>

                                    <IonLabel> 説明・仕様</IonLabel>

                                    <IonButton style={{ marginRight: '20px' }} size="small" fill="clear" onClick={() => setIsPreviewMd(!isPreviewMD)}>
                                        <IonIcon icon={createOutline} />
                                        {isPreviewMD ? '編集' : 'プレビュー'}
                                    </IonButton>

                                </IonListHeader>
                                <IonItem lines="none">
                                    {
                                        isPreviewMD ?
                                            <IonRow>
                                                <IonCol>
                                                    <ReactMarkdown components={markdownComponent}>
                                                        {description}
                                                    </ReactMarkdown>
                                                </IonCol>
                                            </IonRow>
                                            :
                                            <IonGrid>
                                                <IonRow>
                                                    <IonCol size="6">
                                                        <IonTextarea
                                                            label='説明・仕様'
                                                            labelPlacement='floating'
                                                            placeholder='出力電圧min,max など'
                                                            value={description}
                                                            onIonInput={(e) => setDescription(e.detail.value ?? undefined)}
                                                            rows={25}
                                                        />
                                                    </IonCol>
                                                    <IonCol>
                                                        <ReactMarkdown components={markdownComponent}>
                                                            {description}
                                                        </ReactMarkdown>
                                                    </IonCol>
                                                </IonRow>
                                            </IonGrid>
                                    }
                                </IonItem>
                            </IonList>
                        </IonCol>
                    </IonRow>

                    <hr />
                    {/* データシート */}
                    <IonRow>

                        <IonGrid>
                            <IonRow>
                                <IonText>データシート</IonText>
                            </IonRow>
                            <IonRow>

                                {pdfLinks.map((link, idx) => {
                                    const fileName = link.split('/').pop()?.split('?')[0] ?? `ファイル${idx + 1}`;
                                    return (
                                        <IonButton size="small" key={idx} fill="outline" target="_blank" rel="noopener noreferrer" href={link}>
                                            <IonIcon icon={documentOutline} />
                                            {fileName}
                                        </IonButton>
                                    )
                                })}

                            </IonRow>
                        </IonGrid>
                    </IonRow>


                </IonGrid>
            </IonContent>

            <IonFab horizontal="end" vertical="bottom">
                <IonFabButton onClick={() => setIsOpenIModal(true)}>
                    <IonIcon icon={cubeOutline} />
                </IonFabButton>
            </IonFab>

            <InventoryModal
                isOpen={isOpenIModal}
                componentId={id!}
                inventoryApi={inventoryApi}
                onDidDismiss={() => setIsOpenIModal(false)}
            />
        </IonPage>
    )
}
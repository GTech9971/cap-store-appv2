import {
    IonBackButton,
    IonBadge,
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonList,
    IonNote,
    IonPage,
    IonRow,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import { pricetagOutline } from "ionicons/icons"
import { Editable } from "ui/components/editable/Editable"
import { ExternalLinkCard } from "ui/components/external-link/ExternalLinkCard"
import { AddExternalLinkCard } from "ui/components/external-link/AddExternalLinkCard";
import ImageCarousel from "ui/components/ImageCarousel"
import ImageCarouselSelectModal from "ui/components/ImageCarouselSelectModal"
import { ProjectExternalLink, ProjectImg, RegistryProjectRequest } from "cap-store-api-def";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import z from "zod";
import { useConfirmUtils } from "ui/utils/alertUtils";

export const NewProjectPage = () => {

    const initialFormState: RegistryProjectRequest = useMemo(() => {
        return {
            name: '',
            summary: '',
            description: undefined,
            tag: undefined,
            imgUrls: [],
            externalLinks: []
        }
    }, []);

    const projectSchema = z.object({
        name: z.string().min(1, 'プロジェクト名は必須です'),
        summary: z.string().min(1, 'プロジェクト概要は必須です'),
        description: z.string().optional(),
        tag: z.string().optional(),
        imgUrls: z.array(z.string()).optional(),
        externalLinks: z.array(z.object<ProjectExternalLink>()).optional()
    });

    const [form, setForm] = useState<RegistryProjectRequest>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof RegistryProjectRequest, string>>>({});

    const [isOpenImageModal, setIsOpenImageModal] = useState<boolean>(false);

    const [handleConfirm] = useConfirmUtils();

    const handleFormChange = useCallback((field: keyof RegistryProjectRequest, value: unknown) => { setForm(prev => ({ ...prev, [field]: value })); }, [])

    const errorText: CSSProperties = {
        fontSize: '10px'
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>

                    <IonTitle>プロジェクト新規登録</IonTitle>

                    <IonButtons slot="end">
                        <IonButton fill="clear">
                            登録
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen color='light'>
                <IonGrid>
                    <IonRow>
                        <IonCol size="4">
                            <IonList lines="none" inset color="light">
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={form.name}
                                        onIonInput={e => handleFormChange('name', e.detail.value)}>

                                        <div slot="label">プロジェクトタイトル <IonText color='danger'>*</IonText></div>

                                        {errors.name && (
                                            <IonNote style={errorText} color="danger">
                                                {errors.name}
                                            </IonNote>
                                        )}

                                    </IonInput>
                                </IonItem>

                                <ImageCarousel images={form.imgUrls?.map(x => x.url) ?? []} />
                                <IonItem>
                                    <IonButton slot="end" fill="clear" onClick={() => setIsOpenImageModal(true)}>
                                        編集
                                    </IonButton>
                                </IonItem>
                                <ImageCarouselSelectModal
                                    isOpen={isOpenImageModal}
                                    images={form.imgUrls?.map(x => x.url) ?? []}
                                    onChange={e => handleFormChange('imgUrls', e.map((url): ProjectImg => ({
                                        title: undefined,
                                        tag: undefined,
                                        url
                                    })))}
                                    onDismiss={() => setIsOpenImageModal(false)}
                                />

                            </IonList>

                            <ImageCarouselSelectModal
                                images={[]}
                                onDismiss={() => { }}
                                onChange={e => { }}
                                isOpen={false} />
                        </IonCol>

                        <IonCol>
                            <IonList inset>
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={form.summary}
                                        onIonInput={e => handleFormChange('summary', e.detail.value)}>
                                        <div slot="label">プロジェクト概要 <IonText color='danger'>*</IonText></div>

                                        {errors.summary &&
                                            <IonNote color='danger' style={errorText}>{errors.summary}</IonNote>
                                        }

                                    </IonInput>
                                </IonItem>

                                <IonItem>
                                    <IonTextarea
                                        label="説明・備考"
                                        labelPlacement="stacked"
                                        rows={12} />
                                </IonItem>
                            </IonList>
                        </IonCol>

                        <IonCol size="3">
                            <IonList inset color="light">
                                <IonItem>
                                    <IonBadge>計画中</IonBadge>

                                    <IonBadge slot="end" color='light' style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={pricetagOutline} />
                                        <Editable text="タグなし" defaultText="タグなし" onCommit={(tag) => { handleFormChange('tag', tag) }}>
                                            <IonText />
                                        </Editable>
                                    </IonBadge>
                                </IonItem>
                            </IonList>

                        </IonCol>

                    </IonRow>

                    <IonRow>

                        <AddExternalLinkCard
                            onClick={() => {
                                const empty: ProjectExternalLink = {
                                    link: '',
                                    tag: "タグ無し",
                                    title: 'タイトルなし'
                                }
                                handleFormChange('externalLinks', [...form.externalLinks ?? [], empty])
                            }}
                        />

                        {
                            form.externalLinks &&
                            form.externalLinks.map((link, index) => {
                                return (
                                    <ExternalLinkCard
                                        key={index}
                                        {...link}
                                        onEditedLink={e => { }}
                                        onEditedTag={e => { }}
                                        onEditedTitle={e => { }}
                                    />
                                )
                            })
                        }


                    </IonRow>

                </IonGrid>

            </IonContent>

        </IonPage >
    )
}

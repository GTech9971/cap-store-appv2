import {
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
    IonToolbar,
    useIonAlert
} from "@ionic/react"
import { pricetagOutline, chevronBack } from "ionicons/icons"
import { Editable } from "ui/components/editable/Editable"
import ImageLinkCarousel from "ui/components/image-carousels/ImageLinkCarousel";
import ImageLinkCarouselSelectModal from "ui/components/image-carousels/ImageLinkCarouselSelectModal";
import { RegistryProjectRequest } from "cap-store-api-def";
import { CSSProperties, useCallback, useState } from "react";
import { useConfirmUtils } from "ui/utils/alertUtils";
import { useApiClint } from "@/api/useApiClient";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";
import { ProjectStatusBadge } from "ui/components/projects/ProjectStatusBadge";
import { ExternalLinkList } from "ui/components/external-link/ExternalLinkList";
import { parseApiError } from "ui/utils/parseApiError";
import { useCreateProjectContext } from "./CreateProjectProvider";

export const NewProjectPage = () => {

    const { state, dispatch, validateAndSubmit } = useCreateProjectContext();

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [isOpenImageModal, setIsOpenImageModal] = useState<boolean>(false);

    const { projectApi } = useApiClint();
    const navigate = useNavigate();
    const [presentAlert] = useIonAlert();
    const { handleConfirm } = useConfirmUtils();


    const handleSubmit = useCallback((async (form: RegistryProjectRequest) => {
        setSubmitError(null);

        if (await handleConfirm('この内容でプロジェクトを登録しますか？') === false) { return; }

        try {
            setIsSubmitting(true);
            const response = await projectApi.registryProject({ registryProjectRequest: form });
            await presentAlert('プロジェクトを登録しました');

            dispatch({ type: 'clearForm' });

            navigate(`/projects/${response.data?.projectId}`, { replace: true });
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの登録に失敗しました。${message}${status ? `:${status}` : ''}`);
        } finally {
            setIsSubmitting(false);
        }
    }), [dispatch, projectApi, handleConfirm, navigate, presentAlert]);

    const errorText: CSSProperties = {
        fontSize: '10px'
    };

    const { isAuthenticated } = useAuthState();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={() => navigate(-1)}>
                            <IonIcon icon={chevronBack} />
                            戻る
                        </IonButton>
                    </IonButtons>

                    <IonTitle>プロジェクト新規登録</IonTitle>

                    <IonButtons slot="end">
                        <IonButton fill="clear" onClick={() => validateAndSubmit((form) => handleSubmit(form))}
                            disabled={isSubmitting || !isAuthenticated}>
                            登録
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen color='light'>
                <IonGrid>
                    {submitError && (
                        <IonRow>
                            <IonCol>
                                <IonNote color='danger'>{submitError}</IonNote>
                            </IonCol>
                        </IonRow>
                    )}

                    <IonRow>
                        <IonCol size="3">
                            <IonList lines="none" inset color="light">
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={state.form.name}
                                        onIonInput={e =>
                                            dispatch({
                                                type: 'changeForm',
                                                field: 'name', value: e.detail.value ?? ''
                                            })}>

                                        <div slot="label">プロジェクトタイトル <IonText color='danger'>*</IonText></div>

                                        {state.errors.name && (
                                            <IonNote style={errorText} color="danger">
                                                {state.errors.name}
                                            </IonNote>
                                        )}

                                    </IonInput>
                                </IonItem>

                                <ImageLinkCarousel images={state.form.imgUrls ?? []} />
                                <IonItem>
                                    <IonButton slot="end" fill="clear" onClick={() => setIsOpenImageModal(true)}>
                                        編集
                                    </IonButton>
                                </IonItem>
                                <ImageLinkCarouselSelectModal
                                    isOpen={isOpenImageModal}
                                    images={state.form.imgUrls ?? []}
                                    onChange={e =>
                                        dispatch({
                                            type: 'changeForm',
                                            field: 'imgUrls',
                                            value: e
                                        })}
                                    onDismiss={() => setIsOpenImageModal(false)}
                                />
                                {state.errors.imgUrls && (
                                    <IonNote color='danger' style={{ ...errorText, paddingLeft: '16px' }}>
                                        {state.errors.imgUrls}
                                    </IonNote>
                                )}

                            </IonList>

                        </IonCol>

                        <IonCol>
                            <IonList inset>
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={state.form.summary}
                                        onIonInput={e =>
                                            dispatch({
                                                type: 'changeForm',
                                                field: 'summary',
                                                value: e.detail.value ?? ''
                                            })}>
                                        <div slot="label">プロジェクト概要 <IonText color='danger'>*</IonText></div>

                                        {state.errors.summary &&
                                            <IonNote color='danger' style={errorText}>{state.errors.summary}</IonNote>
                                        }

                                    </IonInput>
                                </IonItem>

                                <IonItem>
                                    <IonTextarea
                                        label="説明・備考"
                                        labelPlacement="stacked"
                                        rows={12}
                                        value={state.form.description ?? ''}
                                        onIonInput={e =>
                                            dispatch({
                                                type: 'changeForm',
                                                field: 'description',
                                                value: e.detail.value ?? undefined
                                            })} />
                                </IonItem>
                            </IonList>
                        </IonCol>

                        <IonCol size="4">
                            <IonList inset color="light">
                                <IonItem>
                                    <ProjectStatusBadge status='planning' />

                                    <IonBadge slot="end" color='light' style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={pricetagOutline} />
                                        <Editable text="タグなし" defaultText="タグなし"
                                            onCommit={(tag) => {
                                                dispatch({
                                                    type: 'changeForm',
                                                    field: 'tag',
                                                    value: tag?.trim() || undefined
                                                })
                                            }}>
                                            <IonText />
                                        </Editable>
                                    </IonBadge>
                                </IonItem>
                            </IonList>

                            <ExternalLinkList
                                links={state.form.externalLinks ?? []}
                                onEditedLink={(index, value) =>
                                    dispatch({
                                        type: 'changeExternalLink',
                                        index: index,
                                        patch: { link: value.trim() }
                                    })}
                                onEditedTitle={(index, value) =>
                                    dispatch({
                                        type: 'changeExternalLink',
                                        index: index,
                                        patch: { title: value?.trim() }
                                    })}
                                onEditedTag={(index, value) =>
                                    dispatch({
                                        type: 'changeExternalLink',
                                        index: index,
                                        patch: { tag: value?.trim() }
                                    })}
                                onAddEmptyLink={() => dispatch({ type: 'addEmptyExternalLink', })}
                                onDelete={(index) =>
                                    dispatch({
                                        type: 'deleteExternalLink',
                                        index: index
                                    })} />

                        </IonCol>

                    </IonRow>

                </IonGrid>

            </IonContent>

        </IonPage >
    )
}

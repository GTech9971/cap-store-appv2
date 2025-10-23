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
    IonToolbar,
    useIonAlert
} from "@ionic/react"
import { pricetagOutline } from "ionicons/icons"
import { Editable } from "ui/components/editable/Editable"
import { ExternalLinkCard } from "ui/components/external-link/ExternalLinkCard"
import { AddExternalLinkCard } from "ui/components/external-link/AddExternalLinkCard";
import ImageLinkCarousel from "ui/components/image-carousels/ImageLinkCarousel";
import ImageLinkCarouselSelectModal from "ui/components/image-carousels/ImageLinkCarouselSelectModal";
import { ProjectExternalLink, RegistryProjectRequest } from "cap-store-api-def";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import z from "zod";
import { useConfirmUtils } from "ui/utils/alertUtils";
import { useApiClint } from "@/api/useApiClient";
import { parseApiError } from "@/utils/parseApiError";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuthState";

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

    const projectSchema = useMemo(() => z.object({
        name: z.string().min(1, 'プロジェクト名は必須です'),
        summary: z.string().min(1, 'プロジェクト概要は必須です'),
        description: z.string().optional(),
        tag: z.string().optional(),
        imgUrls: z.array(
            z.object({
                url: z.string().min(1, '画像URLは必須です'),
                tag: z.string().optional(),
                title: z.string().optional()
            })
        ).optional(),
        externalLinks: z.array(
            z.object({
                link: z.string().min(1, 'リンクは必須です'),
                tag: z.string().optional(),
                title: z.string().optional()
            })
        ).optional()
    }), []);

    const [form, setForm] = useState<RegistryProjectRequest>(initialFormState);
    const [errors, setErrors] = useState<Partial<Record<keyof RegistryProjectRequest, string>>>({});
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [isOpenImageModal, setIsOpenImageModal] = useState<boolean>(false);

    const { projectApi } = useApiClint();
    const navigate = useNavigate();
    const [presentAlert] = useIonAlert();
    const [handleConfirm] = useConfirmUtils();

    const handleFormChange = useCallback(<K extends keyof RegistryProjectRequest>(field: K, value: RegistryProjectRequest[K]) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (!prev[field]) {
                return prev;
            }
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setSubmitError(null);
    }, []);

    const handleExternalLinkChange = useCallback((index: number, patch: Partial<ProjectExternalLink>) => {
        setForm(prev => {
            const links = prev.externalLinks ?? [];
            const nextLinks = links.map((link, idx) => idx === index ? { ...link, ...patch } : link);
            return { ...prev, externalLinks: nextLinks };
        });
        setErrors(prev => {
            if (!prev.externalLinks) {
                return prev;
            }
            const next = { ...prev };
            delete next.externalLinks;
            return next;
        });
        setSubmitError(null);
    }, []);

    const handleExternalLinkDelete = useCallback((index: number) => {
        setForm(prev => {
            const links = prev.externalLinks ?? [];
            const nextLinks = links.filter((_, idx) => idx !== index);
            return { ...prev, externalLinks: nextLinks };
        });
        setErrors(prev => {
            if (!prev.externalLinks) {
                return prev;
            }
            const next = { ...prev };
            delete next.externalLinks;
            return next;
        });
        setSubmitError(null);
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitError(null);

        const sanitizedImages = (form.imgUrls ?? [])
            .map(image => ({
                url: image.url.trim(),
                tag: image.tag?.trim() || undefined,
                title: image.title?.trim() || undefined
            }))
            .filter(image => image.url.length > 0);

        const sanitizedExternalLinks: ProjectExternalLink[] = (form.externalLinks ?? [])
            .map(link => ({
                link: (link.link ?? '').trim(),
                tag: link.tag?.trim() || undefined,
                title: link.title?.trim() || undefined
            }))
            .filter(link => link.link.length > 0);

        const sanitizedForm: RegistryProjectRequest = {
            name: form.name.trim(),
            summary: form.summary.trim(),
            description: form.description?.trim() || undefined,
            tag: form.tag?.trim() || undefined,
            imgUrls: sanitizedImages,
            externalLinks: sanitizedExternalLinks
        };

        setForm(prev => ({ ...prev, ...sanitizedForm }));

        const validation = projectSchema.safeParse(sanitizedForm);
        if (!validation.success) {
            const fieldErrors: Partial<Record<keyof RegistryProjectRequest, string>> = {};
            validation.error.issues.forEach(issue => {
                const [field] = issue.path;
                if (field) {
                    fieldErrors[field as keyof RegistryProjectRequest] = issue.message;
                }
            });
            setErrors(fieldErrors);
            return;
        }

        if (await handleConfirm('この内容でプロジェクトを登録しますか？') === false) {
            return;
        }

        try {
            setIsSubmitting(true);
            await projectApi.registryProject({ registryProjectRequest: validation.data });
            await presentAlert('プロジェクトを登録しました');
            setForm(initialFormState);
            setErrors({});
            navigate('/projects', { replace: true });
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの登録に失敗しました。${message}${status ? `:${status}` : ''}`);
        } finally {
            setIsSubmitting(false);
        }
    }, [form, handleConfirm, projectApi, presentAlert, initialFormState, navigate, projectSchema]);

    const errorText: CSSProperties = {
        fontSize: '10px'
    };

    const { isAuthenticated } = useAuthState();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>

                    <IonTitle>プロジェクト新規登録</IonTitle>

                    <IonButtons slot="end">
                        <IonButton fill="clear" onClick={handleSubmit} disabled={isSubmitting || !isAuthenticated}>
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
                        <IonCol size="4">
                            <IonList lines="none" inset color="light">
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={form.name}
                                        onIonInput={e => handleFormChange('name', e.detail.value ?? '')}>

                                        <div slot="label">プロジェクトタイトル <IonText color='danger'>*</IonText></div>

                                        {errors.name && (
                                            <IonNote style={errorText} color="danger">
                                                {errors.name}
                                            </IonNote>
                                        )}

                                    </IonInput>
                                </IonItem>

                                <ImageLinkCarousel images={form.imgUrls ?? []} />
                                <IonItem>
                                    <IonButton slot="end" fill="clear" onClick={() => setIsOpenImageModal(true)}>
                                        編集
                                    </IonButton>
                                </IonItem>
                                <ImageLinkCarouselSelectModal
                                    isOpen={isOpenImageModal}
                                    images={form.imgUrls ?? []}
                                    onChange={e => handleFormChange('imgUrls', e)}
                                    onDismiss={() => setIsOpenImageModal(false)}
                                />
                                {errors.imgUrls && (
                                    <IonNote color='danger' style={{ ...errorText, paddingLeft: '16px' }}>
                                        {errors.imgUrls}
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
                                        value={form.summary}
                                        onIonInput={e => handleFormChange('summary', e.detail.value ?? '')}>
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
                                        rows={12}
                                        value={form.description ?? ''}
                                        onIonInput={e => handleFormChange('description', e.detail.value ?? undefined)} />
                                </IonItem>
                            </IonList>
                        </IonCol>

                        <IonCol size="3">
                            <IonList inset color="light">
                                <IonItem>
                                    <IonBadge>計画中</IonBadge>

                                    <IonBadge slot="end" color='light' style={{ display: 'flex', alignItems: 'center' }}>
                                        <IonIcon icon={pricetagOutline} />
                                        <Editable text="タグなし" defaultText="タグなし" onCommit={(tag) => { handleFormChange('tag', tag?.trim() || undefined) }}>
                                            <IonText />
                                        </Editable>
                                    </IonBadge>
                                </IonItem>
                            </IonList>

                        </IonCol>

                    </IonRow>

                    <IonRow>
                        {errors.externalLinks && (
                            <IonCol size="12">
                                <IonNote color='danger' style={errorText}>{errors.externalLinks}</IonNote>
                            </IonCol>
                        )}

                        <IonCol size="auto">
                            <AddExternalLinkCard
                                onClick={() => {
                                    const empty: ProjectExternalLink = {
                                        link: 'http://localhost:1420',
                                        tag: "タグ無し",
                                        title: 'タイトルなし'
                                    };
                                    handleFormChange('externalLinks', [...form.externalLinks ?? [], empty]);
                                }}
                            />
                        </IonCol>

                        {(form.externalLinks ?? []).map((link, index) => (
                            <IonCol size="auto" key={`${link.link}-${index}`}>
                                <ExternalLinkCard
                                    {...link}
                                    onEditedLink={value => handleExternalLinkChange(index, { link: value.trim() })}
                                    onEditedTag={value => handleExternalLinkChange(index, { tag: value.trim() || undefined })}
                                    onEditedTitle={value => handleExternalLinkChange(index, { title: value.trim() || undefined })}
                                    onDelete={() => handleExternalLinkDelete(index)}
                                />
                            </IonCol>
                        ))}
                    </IonRow>

                </IonGrid>

            </IonContent>

        </IonPage >
    )
}

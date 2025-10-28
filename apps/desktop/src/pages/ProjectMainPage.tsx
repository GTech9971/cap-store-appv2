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
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonText,
    IonTextarea,
    IonTitle,
    IonToolbar,
    useIonAlert,
    useIonToast
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiClint } from "@/api/useApiClient";
import { parseApiError } from "@/utils/parseApiError";
import { useConfirmUtils } from "ui/utils/alertUtils";
import ImageLinkCarousel from "ui/components/image-carousels/ImageLinkCarousel";
import ImageLinkCarouselSelectModal from "ui/components/image-carousels/ImageLinkCarouselSelectModal";
import { Editable } from "ui/components/editable/Editable";
import { ExternalLinkCard } from "ui/components/external-link/ExternalLinkCard";
import { AddExternalLinkCard } from "ui/components/external-link/AddExternalLinkCard";
import { Bom, Project, ProjectExternalLink, ProjectImg, UpdateProjectRequest } from "cap-store-api-def";
import { createOutline, pricetagOutline, timeOutline, downloadOutline } from "ionicons/icons";

import ProjectBomList from "./projects/ProjectBomList";
import { useAuthState } from "@/hooks/useAuthState";

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
    { value: "planning", label: "計画中" },
    { value: "processing", label: "進行中" },
    { value: "pause", label: "一時停止" },
    { value: "cancel", label: "中止" },
    { value: "complete", label: "完了" }
];

type ProjectFormState = {
    name: string;
    summary: string;
    status: string;
    description?: string;
    tag?: string;
    imgUrls: ProjectImg[];
    externalLinks: ProjectExternalLink[];
    bomList: Bom[];
};

const normalizeProject = (project: Project): Project => ({
    ...project,
    createdAt: project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt),
    lastModified: project.lastModified instanceof Date ? project.lastModified : new Date(project.lastModified),
    imgUrls: project.imgUrls ?? [],
    externalLinks: project.externalLinks ?? [],
    bomList: project.bomList ?? []
});

const mapProjectToForm = (project: Project): ProjectFormState => ({
    name: project.name,
    summary: project.summary,
    status: project.status,
    description: project.description ?? undefined,
    tag: project.tag ?? undefined,
    imgUrls: project.imgUrls ?? [],
    externalLinks: project.externalLinks ?? [],
    bomList: project.bomList ?? []
});

export const ProjectMainPage = () => {
    const { projectApi, componentApi, updateProjectApi, downloadProjectPdf } = useApiClint();
    const [handleConfirm] = useConfirmUtils();
    const [presentAlert] = useIonAlert();
    const [presentToast] = useIonToast();
    const navigate = useNavigate();

    const { projectId } = useParams<{ projectId: string }>();

    const [project, setProject] = useState<Project | null>(null);
    const [form, setForm] = useState<ProjectFormState | null>(null);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);

    const normalizeImages = useCallback((images: ProjectImg[] | undefined) => {
        return (images ?? []).map((img) => ({
            url: img.url.trim(),
            title: img.title?.trim() || undefined,
            tag: img.tag?.trim() || undefined
        }));
    }, []);

    const normalizeLinks = useCallback((links: ProjectExternalLink[] | undefined) => {
        return (links ?? []).map((link) => ({
            link: link.link.trim(),
            title: link.title?.trim() || undefined,
            tag: link.tag?.trim() || undefined
        })).filter((link) => link.link.length > 0);
    }, []);

    const normalizeBoms = useCallback((bomList: Bom[] | undefined) => {
        return (bomList ?? [])
            .map((bom) => {
                const trimmedComponentId = bom.componentId.trim();
                return {
                    id: (bom.id ?? "").trim() || undefined,
                    componentId: trimmedComponentId,
                    quantity: Number(bom.quantity) || 0,
                    footPrintName: bom.footPrintName?.trim() || undefined,
                    remarks: bom.remarks?.trim() || undefined,
                    refName: bom.refName?.trim() || undefined,
                    supplier: bom.supplier || undefined
                };
            })
            .filter((bom) => bom.componentId.length > 0 && bom.quantity > 0);
    }, []);

    // プロジェクト取得
    const fetchProject = useCallback(async () => {
        if (!projectId) { return; }

        setIsLoading(true);
        setLoadError(null);

        try {
            const response = await projectApi.fetchProject({ projectId: projectId });
            const fetched: Project | undefined = response.data ? normalizeProject(response.data) : undefined;

            if (!fetched) {
                setProject(null);
                setForm(null);
                setLoadError("表示できるプロジェクトがありません。");
                return;
            }

            setProject(fetched);
            setForm(mapProjectToForm(fetched));
            setSubmitError(null);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setLoadError(`プロジェクトの取得に失敗しました。${message}${status ? `:${status}` : ""}`);
            setProject(null);
            setForm(null);
            setSubmitError(null);
        } finally {
            setIsLoading(false);
        }
    }, [projectApi, projectId]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject, projectId]);

    // Form変更
    const handleFormChange = useCallback(<K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
        setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
        setSubmitError(null);
    }, []);

    //外部リンク変更
    const handleExternalLinkChange = useCallback((index: number, patch: Partial<ProjectExternalLink>) => {
        setForm((prev) => {
            if (!prev) return prev;
            const next = [...prev.externalLinks];
            next[index] = { ...next[index], ...patch };
            return { ...prev, externalLinks: next };
        });
        setSubmitError(null);
    }, []);

    // 外部リンク削除
    const handleExternalLinkDelete = useCallback((index: number) => {
        setForm((prev) => {
            if (!prev) return prev;
            const next = prev.externalLinks.filter((_, idx) => idx !== index);
            return { ...prev, externalLinks: next };
        });
        setSubmitError(null);
    }, []);

    //外部リンク追加
    const handleExternalLinkAdd = useCallback(() => {
        setForm((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                externalLinks: [
                    ...prev.externalLinks,
                    {
                        link: "http://example.com",
                        title: "タイトルなし",
                        tag: "タグ無し"
                    }
                ]
            };
        });
        setSubmitError(null);
    }, []);

    // BOM変更
    const handleBomChange = useCallback((index: number, patch: Partial<Bom>) => {
        setForm((prev) => {
            if (!prev) return prev;
            const next = [...prev.bomList];
            next[index] = { ...next[index], ...patch };
            return { ...prev, bomList: next };
        });
        setSubmitError(null);
    }, []);

    // BOM削除
    const handleBomDelete = useCallback((index: number) => {
        setForm((prev) => {
            if (!prev) return prev;
            const next = prev.bomList.filter((_, idx) => idx !== index);
            return { ...prev, bomList: next };
        });
        setSubmitError(null);
    }, []);

    // BOM追加
    const handleBomAdd = useCallback(() => {
        setForm((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                bomList: [
                    ...prev.bomList,
                    {
                        id: null!,
                        componentId: "",
                        quantity: 1,
                        footPrintName: undefined,
                        remarks: undefined,
                        refName: undefined
                    }
                ]
            };
        });
        setSubmitError(null);
    }, []);

    // 更新処理
    const handleUpdate = useCallback(async () => {
        if (!project || !form || !projectId) return;

        const trimmedName = form.name.trim();
        const trimmedSummary = form.summary.trim();
        const trimmedDescription = form.description?.trim() || undefined;
        const trimmedTag = form.tag?.trim() || undefined;
        const trimmedStatus = form.status;

        const sanitizedImages = normalizeImages(form.imgUrls);
        const sanitizedLinks = normalizeLinks(form.externalLinks);
        const sanitizedBoms = normalizeBoms(form.bomList);

        const updateRequest: UpdateProjectRequest = {};
        const fieldMask: string[] = [];

        if (trimmedName !== project.name) {
            updateRequest.name = trimmedName;
            fieldMask.push("name");
        }
        if (trimmedSummary !== project.summary) {
            updateRequest.summary = trimmedSummary;
            fieldMask.push("summary");
        }
        if (trimmedStatus !== project.status) {
            updateRequest.status = trimmedStatus;
            fieldMask.push("status");
        }
        if (trimmedDescription !== (project.description ?? undefined)) {
            updateRequest.description = trimmedDescription;
            fieldMask.push("description");
        }
        if (trimmedTag !== (project.tag ?? undefined)) {
            updateRequest.tag = trimmedTag;
            fieldMask.push("tag");
        }

        const currentImages = normalizeImages(project.imgUrls);
        const currentLinks = normalizeLinks(project.externalLinks);
        const currentBoms = normalizeBoms(project.bomList);

        if (JSON.stringify(sanitizedImages) !== JSON.stringify(currentImages)) {
            updateRequest.imgUrls = sanitizedImages;
            fieldMask.push("imgUrls");
        }

        if (JSON.stringify(sanitizedLinks) !== JSON.stringify(currentLinks)) {
            updateRequest.externalLinks = sanitizedLinks;
            fieldMask.push("externalLinks");
        }

        if (JSON.stringify(sanitizedBoms) !== JSON.stringify(currentBoms)) {
            updateRequest.bomList = sanitizedBoms;
            fieldMask.push("bomList");
        }

        if (fieldMask.length === 0) {
            setSubmitError("更新対象がありません。");
            return;
        }

        if (await handleConfirm("この内容でプロジェクトを更新しますか？") === false) { return; }

        try {
            setIsUpdating(true);
            setSubmitError(null);

            // OpenAPIのバグで配列をnullにできないため、更新対象でない場合でも[]を必ず設定
            if (updateRequest.bomList === undefined) { updateRequest.bomList = []; }
            if (updateRequest.imgUrls === undefined) { updateRequest.imgUrls = []; }
            if (updateRequest.externalLinks === undefined) { updateRequest.externalLinks = []; }

            const response = await updateProjectApi(projectId, updateRequest, fieldMask);
            const updated = response.data ? normalizeProject(response.data) : null;
            if (updated) {
                setProject(updated);
                setForm(mapProjectToForm(updated));
                await presentAlert("プロジェクトを更新しました");
            }
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの更新に失敗しました。${message}${status ? `:${status}` : ""}`);
        } finally {
            setIsUpdating(false);
        }
    }, [project, form, projectId, normalizeImages, normalizeLinks, normalizeBoms, handleConfirm, updateProjectApi, presentAlert]);


    //削除処理
    const handleDelete = useCallback(async () => {
        if (!projectId) return;

        if (await handleConfirm("このプロジェクトを削除しますか？") === false) { return; }

        try {
            setIsDeleting(true);
            await projectApi.deleteProject({ projectId });
            await presentAlert("プロジェクトを削除しました");
            navigate("/", { replace: true });
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの削除に失敗しました。${message}${status ? `:${status}` : ""}`);
        } finally {
            setIsDeleting(false);
        }
    }, [projectId, handleConfirm, projectApi, presentAlert, navigate]);

    //pdfダウンロード
    const handleDownloadPdf = useCallback(async () => {
        if (!projectId || !project) return;

        try {
            setIsPdfDownloading(true);
            const downloadedFileName = await downloadProjectPdf(projectId, project.name);
            await presentToast({
                message: `${downloadedFileName} をダウンロードしました`,
                duration: 2000,
                position: 'bottom',
                color: 'primary'
            });
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`PDFのダウンロードに失敗しました。${message}${status ? `:${status}` : ""}`);
        } finally {
            setIsPdfDownloading(false);
        }
    }, [projectId, project, downloadProjectPdf, presentToast]);

    const statusLabel = useMemo(() => {
        if (!form) return "";
        return STATUS_OPTIONS.find((opt) => opt.value === form.status)?.label ?? form.status;
    }, [form]);

    const headerTitle = useMemo(() => {
        if (project && form) return `${form.name} ${project.id}`;
        return "プロジェクト詳細";
    }, [project, form]);

    const { isAuthenticated } = useAuthState();

    return (
        <>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>
                    <IonTitle>{headerTitle}</IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            fill="clear"
                            onClick={async () => { await handleDownloadPdf(); }}
                            disabled={isPdfDownloading || isLoading || !project}
                        >
                            {isPdfDownloading ? <IonSpinner name="dots" /> : <IonIcon icon={downloadOutline} />}
                        </IonButton>
                        <IonButton
                            fill="clear"
                            color="danger"
                            onClick={async () => { await handleDelete(); }}
                            disabled={isDeleting || isUpdating || isLoading || !project || !isAuthenticated}
                        >
                            削除
                        </IonButton>
                        <IonButton
                            fill="clear"
                            onClick={async () => { await handleUpdate(); }}
                            disabled={isUpdating || isDeleting || isLoading || !form || !isAuthenticated}
                        >
                            更新
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent fullscreen color="light">
                {isLoading && (
                    <IonGrid>
                        <IonRow>
                            <IonCol className="ion-text-center" style={{ paddingTop: "40px" }}>
                                <IonSpinner />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}

                {!isLoading && loadError && (
                    <IonGrid>
                        <IonRow>
                            <IonCol>
                                <IonNote color="danger">{loadError}</IonNote>
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}

                {!isLoading && !loadError && form && project && (
                    <IonGrid>
                        {submitError && (
                            <IonRow>
                                <IonCol>
                                    <IonNote color="danger">{submitError}</IonNote>
                                </IonCol>
                            </IonRow>
                        )}

                        <IonRow>
                            <IonCol size="4">
                                <IonList inset lines="none" color="light">
                                    <IonItem>
                                        <IonLabel position="stacked">プロジェクト名</IonLabel>
                                        <Editable text={form.name} defaultText="タイトル" onCommit={(value) => handleFormChange("name", value)}>
                                            <h2 />
                                        </Editable>
                                    </IonItem>

                                    <ImageLinkCarousel
                                        images={form.imgUrls}
                                        onDelete={(index) => {
                                            const next = form.imgUrls.filter((_, idx) => idx !== index);
                                            handleFormChange("imgUrls", next);
                                        }}
                                    />

                                    <IonItem>
                                        <IonButton slot="end" fill="clear" onClick={() => setIsImageModalOpen(true)}>
                                            画像編集
                                        </IonButton>
                                    </IonItem>
                                </IonList>

                                <ImageLinkCarouselSelectModal
                                    images={form.imgUrls}
                                    isOpen={isImageModalOpen}
                                    onChange={(images) => handleFormChange("imgUrls", images)}
                                    onDismiss={() => setIsImageModalOpen(false)}
                                />
                            </IonCol>

                            <IonCol>
                                <IonList inset>
                                    <IonItem>
                                        <IonLabel position="stacked">概要</IonLabel>
                                        <Editable text={form.summary} defaultText="サマリー" onCommit={(value) => handleFormChange("summary", value)}>
                                            <h3 />
                                        </Editable>
                                    </IonItem>

                                    <IonItem>
                                        <IonTextarea
                                            label="説明・備考"
                                            labelPlacement="stacked"
                                            rows={12}
                                            value={form.description ?? ""}
                                            onIonInput={(e) => handleFormChange("description", e.detail.value ?? undefined)}
                                        />
                                    </IonItem>
                                </IonList>
                            </IonCol>

                            <IonCol size="3">
                                <IonList inset color="light">
                                    <IonItem lines="none">
                                        <IonNote style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <IonIcon icon={createOutline} />
                                            {project.createdAt.toLocaleString("ja-JP")}
                                        </IonNote>
                                    </IonItem>
                                    <IonItem lines="none">
                                        <IonNote style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                            <IonIcon icon={timeOutline} />
                                            {project.lastModified.toLocaleString("ja-JP")}
                                        </IonNote>
                                    </IonItem>

                                    <IonItem>
                                        <IonLabel>ステータス</IonLabel>
                                        <IonSelect
                                            interface="popover"
                                            value={form.status}
                                            onIonChange={(e) => handleFormChange("status", e.detail.value as string)}
                                        >
                                            {STATUS_OPTIONS.map((option) => (
                                                <IonSelectOption key={option.value} value={option.value}>
                                                    {option.label}
                                                </IonSelectOption>
                                            ))}
                                        </IonSelect>
                                    </IonItem>

                                    <IonItem>
                                        <IonBadge>{statusLabel}</IonBadge>

                                        <IonBadge slot="end" color="light" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                            <IonIcon icon={pricetagOutline} />
                                            <Editable text={form.tag ?? "タグなし"} defaultText="タグなし" onCommit={(value) => handleFormChange("tag", value.trim() || undefined)}>
                                                <IonText />
                                            </Editable>
                                        </IonBadge>
                                    </IonItem>

                                </IonList>
                            </IonCol>
                        </IonRow>

                        <IonRow>
                            <IonCol size="auto">
                                <AddExternalLinkCard onClick={handleExternalLinkAdd} />
                            </IonCol>

                            {(form.externalLinks ?? []).map((link, index) => (
                                <IonCol size="auto" key={`${link.link}-${index}`}>
                                    <ExternalLinkCard
                                        {...link}
                                        onEditedLink={(value) => handleExternalLinkChange(index, { link: value.trim() })}
                                        onEditedTitle={(value) => handleExternalLinkChange(index, { title: value.trim() || undefined })}
                                        onEditedTag={(value) => handleExternalLinkChange(index, { tag: value.trim() || undefined })}
                                        onDelete={() => handleExternalLinkDelete(index)}
                                    />
                                </IonCol>
                            ))}
                        </IonRow>

                        <IonRow>
                            <IonCol>
                                <ProjectBomList
                                    componentApi={componentApi}
                                    bomList={form.bomList}
                                    onAdd={handleBomAdd}
                                    onChange={handleBomChange}
                                    onDelete={handleBomDelete}
                                />
                            </IonCol>
                        </IonRow>
                    </IonGrid>
                )}
            </IonContent>
        </>
    );
};

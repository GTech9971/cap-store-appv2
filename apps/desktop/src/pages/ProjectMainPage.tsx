import {
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
    IonMenu,
    IonNote,
    IonRow,
    IonSpinner,
    IonSplitPane,
    IonTextarea,
    IonTitle,
    IonToolbar,
    useIonAlert,
    useIonToast
} from "@ionic/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiClint } from "@/api/useApiClient";
import { useConfirmUtils } from "ui/utils/alertUtils";
import ImageLinkCarousel from "ui/components/image-carousels/ImageLinkCarousel";
import ImageLinkCarouselSelectModal from "ui/components/image-carousels/ImageLinkCarouselSelectModal";
import { Editable } from "ui/components/editable/Editable";
import { ProjectHistoryList } from "ui/components/projects/histories/ProjectHistoryList"
import { ProjectHistoryDiff } from "ui/components/projects/histories/ProjectHistoryDiff";
import {
    Bom,
    Project,
    ProjectExternalLink,
    ProjectHistory,
    ProjectImg,
    RevertProjectResponse,
    RevertProjectToHistoryRequest,
    UndeleteProjectRequest,
    UpdateProjectRequest
} from "cap-store-api-def";
import { gitBranchOutline, downloadOutline, chevronBack } from "ionicons/icons";

import ProjectBomList from "./projects/ProjectBomList";
import { useAuthState } from "@/hooks/useAuthState";
import { AuthFooter } from "@/components/AuthFooter";
import { ProjectMetaDataPanel } from "./projects/ProjectMetaDataPanel";
import { EmptyExternalLink } from "ui/types/EmptyExternalLink";
import { EmptyBom } from 'ui/types/EmptyBom'
import { useProjectMainPageUtils } from "./useProjectMainPageUtils";
import './ProjectMainPage.css';
import { ExternalLinkList } from "ui/components/external-link/ExternalLinkList";
import { parseApiError } from "ui/utils/parseApiError";


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

    // メニュー
    const [hiddenMenu, setHiddenMenu] = useState<boolean>(true);

    const { projectApi, projectHistoryApi, componentApi, categoryApi, updateProjectApi, downloadProjectPdf } = useApiClint();
    const { handleConfirm, handleConfirmWithInput } = useConfirmUtils();
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
    const [isUnDeleting, setIsUnDeleting] = useState(false);
    const [isPdfDownloading, setIsPdfDownloading] = useState(false);

    // 選択した履歴
    const [history, setHistory] = useState<ProjectHistory | undefined>(undefined);

    const { normalizeProject, normalizeImages, normalizeLinks, normalizeBoms, keysToCamelCase } = useProjectMainPageUtils();


    // プロジェクトの内容をFormに適用
    const applyProjectToForm = useCallback((project: Project | undefined | null) => {
        if (!project) {
            setProject(null);
            setForm(null);
            setLoadError("表示できるプロジェクトがありません。");
            return;
        }
        setProject(project);
        setForm(mapProjectToForm(project));
        setSubmitError(null);
    }, []);

    // プロジェクト取得
    const fetchProject = useCallback(async () => {
        if (!projectId) { return; }

        setIsLoading(true);
        setLoadError(null);

        try {
            const response = await projectApi.fetchProject({ projectId: projectId });
            const fetched: Project | undefined = response.data ? normalizeProject(response.data) : undefined;
            applyProjectToForm(fetched);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setLoadError(`プロジェクトの取得に失敗しました。${message}${status ? `:${status}` : ""}`);
            setProject(null);
            setForm(null);
            setSubmitError(null);
        } finally {
            setIsLoading(false);
        }
    }, [normalizeProject, projectApi, projectId, applyProjectToForm]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    /**
     * 履歴表示中は操作不可
     */
    const isDisabledByHistoryView = useCallback(async (): Promise<boolean> => {
        if (history) {
            await presentAlert({ header: '警告', message: '現在履歴内容が表示されています。現在のプロジェクト内容を確認した上で再度操作してください。' });
            return true;
        }
        return false;
    }, [history, presentAlert]);

    // Form変更
    const handleFormChange = useCallback(async <K extends keyof ProjectFormState>(field: K, value: ProjectFormState[K]) => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    //外部リンク変更
    const handleExternalLinkChange = useCallback(async (index: number, patch: Partial<ProjectExternalLink>) => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            const next = [...prev.externalLinks];
            next[index] = { ...next[index], ...patch };
            return { ...prev, externalLinks: next };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    // 外部リンク削除
    const handleExternalLinkDelete = useCallback(async (index: number) => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            const next = prev.externalLinks.filter((_, idx) => idx !== index);
            return { ...prev, externalLinks: next };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    //外部リンク追加
    const handleExternalLinkAdd = useCallback(async () => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                externalLinks: [
                    ...prev.externalLinks,
                    EmptyExternalLink,
                ]
            };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    // BOM変更
    const handleBomChange = useCallback(async (index: number, patch: Partial<Bom>) => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            const next = [...prev.bomList];
            next[index] = { ...next[index], ...patch };
            return { ...prev, bomList: next };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    // BOM削除
    const handleBomDelete = useCallback(async (index: number) => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            const next = prev.bomList.filter((_, idx) => idx !== index);
            return { ...prev, bomList: next };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    // BOM追加
    const handleBomAdd = useCallback(async () => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        setForm((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                bomList: [
                    ...prev.bomList,
                    EmptyBom,
                ]
            };
        });
        setSubmitError(null);
    }, [isDisabledByHistoryView]);

    // 履歴再取得
    const [refreshKey, setRefreshKey] = useState<number>(0);
    // 更新処理
    const handleUpdate = useCallback(async () => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

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

        const confirmResult = await handleConfirmWithInput("この内容でプロジェクトを更新しますか？", '更新メッセージ');
        if (confirmResult.result === false) { return; }
        updateRequest.updateMessage = confirmResult.input;

        try {
            setIsUpdating(true);
            setSubmitError(null);

            // OpenAPIのバグで配列をnullにできないため、更新対象でない場合でも[]を必ず設定
            if (updateRequest.bomList === undefined) { updateRequest.bomList = []; }
            if (updateRequest.imgUrls === undefined) { updateRequest.imgUrls = []; }
            if (updateRequest.externalLinks === undefined) { updateRequest.externalLinks = []; }

            const response = await updateProjectApi(projectId, updateRequest, fieldMask);
            const updated: Project | null = response.data ? normalizeProject(response.data) : null;
            if (updated) {
                applyProjectToForm(updated);
                await presentAlert("プロジェクトを更新しました");
                setRefreshKey(prev => prev + 1);
            }
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの更新に失敗しました。${message}${status ? `:${status}` : ""}`);
        } finally {
            setIsUpdating(false);
        }
    }, [normalizeProject, project, form, projectId, normalizeImages, normalizeLinks,
        normalizeBoms, updateProjectApi, presentAlert,
        applyProjectToForm, isDisabledByHistoryView, handleConfirmWithInput]);


    //削除処理
    const handleDelete = useCallback(async () => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

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
    }, [projectId, handleConfirm, projectApi, presentAlert, navigate, isDisabledByHistoryView]);

    // 削除取消
    const handleUnDelete = useCallback(async () => {
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

        if (!projectId) return;

        if (await handleConfirm("このプロジェクトを削除取消しますか？") === false) { return; }

        try {
            setIsUnDeleting(true);

            const request: UndeleteProjectRequest = { projectId: projectId };
            const response = await projectApi.undeleteProject(request);
            const undeletedProject = response.data ?? null;

            applyProjectToForm(undeletedProject);
            await presentAlert("プロジェクトを削除取消しました");
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setSubmitError(`プロジェクトの削除取消に失敗しました。${message}${status ? `:${status}` : ""}`);
        } finally {
            setIsUnDeleting(false);
        }
    }, [isDisabledByHistoryView, projectId, handleConfirm, projectApi,
        presentAlert, applyProjectToForm,]);

    //pdfダウンロード
    const handleDownloadPdf = useCallback(async () => {
        if (!projectId || !project) return;
        // 履歴表示中は操作不可
        if (await isDisabledByHistoryView()) { return; }

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
    }, [projectId, project, downloadProjectPdf, presentToast, isDisabledByHistoryView]);


    /** 画面タイトル */
    const headerTitle = useMemo(() => {
        if (!project) { return "プロジェクト詳細"; }

        if (history) { return `[履歴] ${form?.name ?? 'プロジェクト名未定'} : ${history.historyId}`; }
        if (project && form) return `${form.name} ${project.id}`;
        return "プロジェクト詳細";
    }, [project, form, history]);

    const { isAuthenticated } = useAuthState();


    // 履歴系
    // 選択履歴変更イベント
    const handleChangeSelectHistory = useCallback((history: ProjectHistory | undefined) => {
        setHistory(history);
        // 選択解除時は最新の内容に戻す
        if (!history) {
            applyProjectToForm(project);
            return;
        }
        if (!history.snapshotJson) { throw new Error("スナップショットjsonが存在しません"); }

        const restoreProject: Project = keysToCamelCase<Project>(JSON.parse(history.snapshotJson));
        applyProjectToForm(restoreProject);
    }, [project, keysToCamelCase, applyProjectToForm]);

    // 履歴から復元
    const handleRevertProjectHistory = useCallback(async (historyId: string) => {
        if (!projectId) { return; }
        if (history?.historyId !== historyId) {
            await presentAlert({ header: '警告', message: '復元する履歴を選択し、復元内容を確認してから復元操作を実行してください。' });
            return;
        }

        if (await handleConfirm('現在選択している内容で復元して本当によろしいですか') === false) { return; }

        const request: RevertProjectToHistoryRequest = { projectId: projectId, historyId: historyId };
        try {
            const response: RevertProjectResponse = await projectHistoryApi.revertProjectToHistory(request);
            const revert: Project | null = response.data ? normalizeProject(response.data) : null;
            if (revert) {
                applyProjectToForm(revert);
                await presentAlert({ header: '復元成功', message: 'プロジェクトを復元しました' });
                setRefreshKey(prev => prev + 1);
            }
        } catch (error) {
            const { message, status } = await parseApiError(error);
            await presentAlert({ header: 'エラー', subHeader: status?.toString(), message: `履歴復元操作失敗。${message}` });
        }
    }, [normalizeProject, history, presentAlert, projectHistoryApi,
        projectId, applyProjectToForm, handleConfirm]);


    return (
        <IonSplitPane className="history-pane" when="xs" contentId="main" disabled={hiddenMenu}>
            <IonMenu contentId="main">

                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonButton fill="clear" onClick={() => navigate(-1)}>
                                <IonIcon icon={chevronBack} />
                                戻る
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding" color='light'>

                    <ProjectHistoryList
                        projectId={projectId ?? ''}
                        historyApi={projectHistoryApi}
                        onClick={handleChangeSelectHistory}
                        onClickRestore={handleRevertProjectHistory}
                        refreshKey={refreshKey}
                    />

                </IonContent>

                <AuthFooter />

            </IonMenu>

            <div className="ion-page" id="main">

                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">

                            {hiddenMenu
                                &&
                                <IonButtons slot="start">
                                    <IonButton fill="clear" onClick={() => navigate(-1)}>
                                        <IonIcon icon={chevronBack} />
                                        戻る
                                    </IonButton>
                                </IonButtons>
                            }

                            <IonButton slot="icon" onClick={() => setHiddenMenu(!hiddenMenu)}>
                                <IonIcon icon={gitBranchOutline} />
                            </IonButton>
                        </IonButtons>

                        <IonTitle>{headerTitle}</IonTitle>

                        {/* 操作ボタン */}
                        <IonButtons slot="end">
                            {/* PDF */}
                            <IonButton
                                fill="clear"
                                onClick={async () => { await handleDownloadPdf(); }}
                                disabled={isPdfDownloading || isLoading || !project} >
                                {isPdfDownloading ? <IonSpinner name="dots" /> : <IonIcon icon={downloadOutline} />}
                            </IonButton>

                            {
                                project?.isDeleted
                                    ?
                                    <IonButton
                                        fill="clear"
                                        color='success'
                                        onClick={async () => { await handleUnDelete(); }}
                                        disabled={isDeleting || isUnDeleting || isUpdating || isLoading || !project || !isAuthenticated}>
                                        削除取消
                                    </IonButton>
                                    :
                                    <IonButton
                                        fill="clear"
                                        color="danger"
                                        onClick={async () => { await handleDelete(); }}
                                        disabled={isDeleting || isUnDeleting || isUpdating || isLoading || !project || !isAuthenticated}>
                                        削除
                                    </IonButton>
                            }


                            <IonButton
                                fill="clear"
                                onClick={async () => { await handleUpdate(); }}
                                disabled={isUpdating || isDeleting || isUnDeleting || isLoading || !form || !isAuthenticated}>
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
                                {/* １列 */}
                                <IonCol size="3">
                                    <IonList inset lines="none" color="light">
                                        <IonItem>
                                            <IonLabel position="stacked">プロジェクト名</IonLabel>

                                            <ProjectHistoryDiff history={history} field="name">
                                                <Editable text={form.name} defaultText="タイトル" onCommit={(value) => handleFormChange("name", value)}>
                                                    <h2 />
                                                </Editable>
                                            </ProjectHistoryDiff>
                                        </IonItem>

                                        <ProjectHistoryDiff history={history} field="imgUrls">
                                            <ImageLinkCarousel
                                                images={form.imgUrls}
                                                onDelete={(index) => {
                                                    const next = form.imgUrls.filter((_, idx) => idx !== index);
                                                    handleFormChange("imgUrls", next);
                                                }} />
                                        </ProjectHistoryDiff>

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
                                        onDismiss={() => setIsImageModalOpen(false)} />
                                </IonCol>

                                {/* 中列 */}
                                <IonCol>
                                    <IonList inset>
                                        <IonItem>
                                            <IonLabel position="stacked">概要</IonLabel>

                                            <ProjectHistoryDiff history={history} field="summary">
                                                <Editable text={form.summary} defaultText="サマリー" onCommit={(value) => handleFormChange("summary", value)}>
                                                    <h3 />
                                                </Editable>
                                            </ProjectHistoryDiff>
                                        </IonItem>

                                        <IonItem>

                                            <ProjectHistoryDiff history={history} field="description">
                                                <IonTextarea
                                                    label="説明・備考"
                                                    labelPlacement="stacked"
                                                    rows={12}
                                                    value={form.description ?? ""}
                                                    onIonInput={(e) => handleFormChange("description", e.detail.value ?? undefined)} />
                                            </ProjectHistoryDiff>

                                        </IonItem>
                                    </IonList>
                                </IonCol>

                                {/* 3列 */}
                                <IonCol size="4">
                                    <ProjectMetaDataPanel
                                        project={project}
                                        status={form.status}
                                        onChangeStatus={value => handleFormChange('status', value)}
                                        tag={form.tag}
                                        onChangeTag={value => handleFormChange('tag', value)}
                                        history={history} />

                                    <ExternalLinkList
                                        links={form.externalLinks}
                                        onEditedLink={(index, value) => handleExternalLinkChange(index, { link: value.trim() })}
                                        onEditedTitle={(index, value) => handleExternalLinkChange(index, { title: value?.trim() })}
                                        onEditedTag={(index, value) => handleExternalLinkChange(index, { tag: value?.trim() })}
                                        onAddEmptyLink={handleExternalLinkAdd}
                                        onDelete={handleExternalLinkDelete} />

                                </IonCol>
                            </IonRow>

                            <IonRow>
                                <IonCol>
                                    <ProjectBomList
                                        componentApi={componentApi}
                                        categoryApi={categoryApi}
                                        bomList={form.bomList}
                                        onAdd={handleBomAdd}
                                        onChange={handleBomChange}
                                        onDelete={handleBomDelete}
                                        history={history} />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    )}
                </IonContent>

            </div>

        </IonSplitPane>
    );
};

import { IonBadge, IonButton, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonText } from "@ionic/react";
import { ProjectsApi, type Project } from "cap-store-api-def"
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"
import { parseApiError } from "../../utils/parseApiError";

export interface Prop {
    projectApi: ProjectsApi,
}

export const ProjectList: React.FC<Prop> = ({
    projectApi
}) => {

    const navigate = useNavigate();

    const [projects, setProjects] = useState<Project[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        setApiError(null);
        try {
            const res = await projectApi.fetchProjects({ pageIndex: 1, pageSize: 20 });
            setProjects(res?.data ?? []);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setApiError(`プロジェクト一覧の取得に失敗しました。${message}${status ? `:${status}` : ''}`);
            setProjects([]);
        }
    }, [projectApi]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const getProjectStatusLabel = useCallback((status: string) => {
        switch (status) {
            case "planning":
                return "計画中";
            case "processing":
                return "進行中";
            case "pause":
                return "一時停止";
            case "cancel":
                return "中止";
            case "complete":
                return "完了";
            default:
                return status;
        }
    }, []);


    return (
        <IonList inset>
            <IonListHeader>
                <IonLabel>プロジェクト</IonLabel>
                <IonButton onClick={() => navigate('/projects/new')}>追加</IonButton>
            </IonListHeader>
            {apiError ? (
                <IonItem>
                    <IonNote color="danger">{apiError}</IonNote>
                </IonItem>
            ) : projects.length === 0 ? (
                <IonItem>
                    <IonNote>プロジェクト登録なし</IonNote>
                </IonItem>
            ) : (
                projects.map((project) => (
                    <IonItem
                        key={project.id}
                        button
                        detail={false}
                        onClick={() => navigate(`/projects?projectId=${project.id}`)}
                    >
                        <IonLabel>
                            <IonText>{project.name}</IonText>
                            <IonNote style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{project.summary ?? '-'}</IonNote>
                        </IonLabel>
                        <IonBadge slot="end">{getProjectStatusLabel(project.status)}</IonBadge>
                    </IonItem>
                ))
            )}
        </IonList>

    )
}
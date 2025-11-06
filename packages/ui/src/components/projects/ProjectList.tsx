import { IonButton, IonIcon, IonItem, IonLabel, IonList, IonListHeader, IonNote, IonText, IonToggle } from "@ionic/react";
import { ProjectsApi, type Project } from "cap-store-api-def"
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { parseApiError } from "../../utils/parseApiError";
import { ProjectStatusBadge } from "./ProjectStatusBadge";
import { trashOutline } from "ionicons/icons";

export interface Prop {
    projectApi: ProjectsApi,
    onClickAdd?: () => void,
    onClickProject?: (projectId: string) => void,
    pageSize?: number | undefined
}

export const ProjectList: React.FC<Prop> = ({
    projectApi,
    onClickAdd,
    onClickProject,
    pageSize = 50
}) => {

    const [projects, setProjects] = useState<Project[]>([]);
    const [includeDeleted, setIncludeDeleted] = useState<boolean>(false);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchProject = useCallback(async () => {
        setApiError(null);
        try {
            const res = await projectApi.fetchProjects({ pageIndex: 1, pageSize: pageSize, includeDeleted: includeDeleted });
            setProjects(res?.data ?? []);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setApiError(`プロジェクト一覧の取得に失敗しました。${message}${status ? `:${status}` : ''}`);
            setProjects([]);
        }
    }, [projectApi, pageSize, includeDeleted]);

    useEffect(() => {
        fetchProject();
    }, [fetchProject]);

    const deletedProject: CSSProperties = {
        textDecoration: 'line-through'
    };

    return (
        <IonList inset>
            <IonListHeader>
                <IonLabel>プロジェクト</IonLabel>
                <IonButton style={{ marginRight: '15px' }} onClick={onClickAdd}>追加</IonButton>
            </IonListHeader>

            {apiError &&
                <IonItem>
                    <IonNote color="danger">{apiError}</IonNote>
                </IonItem>
            }

            {projects.length === 0 &&
                <IonItem lines="none">
                    <IonNote>プロジェクト登録なし</IonNote>
                </IonItem>
            }

            <IonItem lines="none">
                <IonToggle
                    checked={includeDeleted}
                    onIonChange={(event) => setIncludeDeleted(event.detail.checked)}>
                    <IonNote>削除済を含む</IonNote>
                </IonToggle>
            </IonItem>

            {
                projects.map((project) => (
                    <IonItem
                        key={project.id}
                        button
                        detail={false}
                        onClick={() => onClickProject?.(project.id)}>
                        <IonLabel>
                            {project.isDeleted ?
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <IonIcon icon={trashOutline} color="danger" />
                                    <IonText color='medium' style={deletedProject}>[削除]{project.name}</IonText>
                                </div>
                                :
                                <IonText>{project.name}</IonText>
                            }
                            <p style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <span style={project.isDeleted ? deletedProject : undefined}>
                                    {project.summary ?? '-'}
                                </span>
                            </p>
                        </IonLabel>

                        <ProjectStatusBadge slot="end" status={project.status} />
                    </IonItem>
                ))
            }
        </IonList>

    )
}
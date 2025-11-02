import { IonItem, IonList, IonListHeader, IonNote } from "@ionic/react"
import type { FetchProjectHistoriesRequest, ProjectHistory, ProjectsHistoryApi } from "cap-store-api-def"
import { useCallback, useEffect, useState } from "react";
import { parseApiError } from "../../../utils/parseApiError";
import { ProjectHistoryItem } from "./ProjectHistoryItem";


export interface Prop {
    projectId: string,
    historyApi: ProjectsHistoryApi,
    onClickRestore?: (historyId: string) => void
}

export const ProjectHistoryList: React.FC<Prop> = ({
    projectId,
    historyApi,
    onClickRestore,
}) => {

    const [histories, setHistories] = useState<ProjectHistory[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchProjectHistories = useCallback(async () => {
        setApiError(null);
        try {
            const request: FetchProjectHistoriesRequest = { projectId: projectId };
            const res = await historyApi.fetchProjectHistories(request);
            setHistories(res?.data?.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) ?? []);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setApiError(`プロジェクト履歴一覧の取得に失敗しました。${message}${status ? `:${status}` : ''}`);
            setHistories([]);
        }
    }, [historyApi, projectId]);

    useEffect(() => {
        fetchProjectHistories();
    }, [fetchProjectHistories]);

    return (
        <IonList inset>
            <IonListHeader>
                プロジェクト履歴
            </IonListHeader>

            {apiError &&
                <IonItem>
                    <IonNote color="danger">{apiError}</IonNote>
                </IonItem>
            }

            {
                histories.map((history, index) => (
                    <ProjectHistoryItem
                        key={index}
                        history={history}
                        onClickRestore={onClickRestore} />
                ))
            }

            {
                histories.length === 0 &&
                <IonItem lines="none">
                    <IonNote>履歴なし</IonNote>
                </IonItem>
            }

        </IonList>
    )
}
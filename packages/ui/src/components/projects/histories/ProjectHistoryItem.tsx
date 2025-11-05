import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react"
import type { ProjectHistory } from "cap-store-api-def"
import "./ProjectHistoryItem.css";
import { ProjectHistoryChangeTypeLabel } from "./ProjectHistoryChangeTypeLabel";

export interface Prop {
    history: ProjectHistory,
    isSelect?: boolean,
    onClick?: (history: ProjectHistory) => void,
    onClickRestore?: (historyId: string) => void
}

export const ProjectHistoryItem: React.FC<Prop> = ({
    history,
    isSelect,
    onClick,
    onClickRestore,
}) => {

    const showRestoreButton: boolean = history.changeType === 'created' || history.changeType === 'updated';

    return (
        <IonItem
            button
            detail={false}
            onClick={() => onClick?.(history)}
            className={isSelect ? 'selected' : undefined}>

            <IonLabel>
                <span>
                    <ProjectHistoryChangeTypeLabel
                        changeType={history.changeType}
                        restoredHistoryId={history.restoredHistoryId} />

                    <strong style={{ marginLeft: '5px' }}>{history.createdAt.toLocaleString()}</strong>
                </span>

                <IonNote color="medium" className="change-message">
                    {history.message}
                </IonNote>

                <IonNote color='medium' className="change-fields">
                    {history.changedFields?.join(',')}
                </IonNote>

                <IonNote color='medium' className="ion-text-wrap">
                    {history.historyId}
                </IonNote>

            </IonLabel>


            {showRestoreButton
                &&
                <IonButton color='secondary' fill="outline" slot="end" onClick={(e) => {
                    e.stopPropagation(); //ion-itemの履歴選択イベントが発生してしまい、選択解除になってしまうのを防ぐ
                    onClickRestore?.(history.historyId)
                }}>
                    復元
                </IonButton>
            }

        </IonItem>
    )
}
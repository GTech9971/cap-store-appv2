import { IonButton, IonItem, IonLabel, IonNote, IonText } from "@ionic/react"
import type { ProjectHistory, ProjectHistoryChangeType } from "cap-store-api-def"
import "./ProjectHistoryItem.css";
import { useMemo } from "react";
import type { Color } from "@ionic/core";

export const ProjectHistoryItem = (history: ProjectHistory) => {

    const labels: Array<{ value: ProjectHistoryChangeType, label: string, color: Color }> = useMemo(() => {
        return [
            { value: 'created', label: '新規登録', color: 'primary' },
            { value: 'deleted', label: '削除', color: 'danger' },
            { value: 'restored', label: '復元', color: 'secondary' },
            { value: 'updated', label: '更新', color: 'success' }
        ];
    }, []);

    const label = useMemo(() => labels.find(x => x.value === history.changeType), [labels, history.changeType]);

    const showRestoreButton: boolean = history.changeType === 'created' || history.changeType === 'updated';

    return (
        <IonItem>
            <IonLabel>
                <strong>{history.createdAt.toLocaleString()}</strong>

                <IonText>

                    <IonText color={label?.color}>
                        [{label?.label ?? ''}]
                    </IonText>

                    {history.changedFields && history.changedFields.length > 0 &&
                        <> - </>
                    }
                    {history.changedFields?.join(',')}
                </IonText>

                <br />

                <IonNote color='medium' className="ion-text-wrap">
                    {history.historyId}
                </IonNote>

            </IonLabel>

            <div className="metadata-end-wrapper" slot="end">
                <IonNote color="medium">
                    {history.message}
                </IonNote>
            </div>

            {showRestoreButton
                &&
                <IonButton color='secondary' fill="outline" slot="end">
                    復元
                </IonButton>
            }

        </IonItem>
    )
}
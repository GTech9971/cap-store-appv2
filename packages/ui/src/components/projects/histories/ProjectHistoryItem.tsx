import { IonButton, IonItem, IonLabel, IonNote, IonText } from "@ionic/react"
import type { ProjectHistory, ProjectHistoryChangeType } from "cap-store-api-def"
import "./ProjectHistoryItem.css";
import { useMemo } from "react";
import type { Color } from "@ionic/core";

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
        <IonItem
            button
            detail={false}
            onClick={() => onClick?.(history)}
            className={isSelect ? 'selected' : undefined}>

            <IonLabel>
                <span>
                    <IonText color={label?.color}>
                        [{label?.label ?? ''}]
                    </IonText>

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
                <IonButton color='secondary' fill="outline" slot="end" onClick={() => onClickRestore?.(history.historyId)}>
                    復元
                </IonButton>
            }

        </IonItem>
    )
}
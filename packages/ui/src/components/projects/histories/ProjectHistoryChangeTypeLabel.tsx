import type { Color } from "@ionic/core";
import { IonText } from "@ionic/react";
import type { ProjectHistoryChangeType } from "cap-store-api-def";
import { useMemo } from "react";

export interface Prop {
    changeType: ProjectHistoryChangeType,
    restoredHistoryId: string | undefined,
}

/**
 * プロジェクト履歴変更種類のラベル
 * @param param0 
 * @returns 
 */
export const ProjectHistoryChangeTypeLabel: React.FC<Prop> = ({
    changeType,
    restoredHistoryId
}) => {

    const labels: Array<{ value: ProjectHistoryChangeType, label: string, color: Color }> = useMemo(() => {
        return [
            { value: 'created', label: '新規登録', color: 'primary' },
            { value: 'deleted', label: '削除', color: 'danger' },
            { value: 'undeleted', label: '削除取消', color: 'success' },
            { value: 'restored', label: '復元', color: 'secondary' },
            { value: 'updated', label: '更新', color: 'success' }
        ];
    }, []);

    const label = useMemo(() => labels.find(x => x.value === changeType), [labels, changeType]);

    return (
        <IonText color={label?.color}>
            [{label?.label ?? ''}] {label?.value === 'restored' && restoredHistoryId}
        </IonText>
    )
}
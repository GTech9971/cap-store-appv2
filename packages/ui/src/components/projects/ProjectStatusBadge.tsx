import { IonBadge } from "@ionic/react"
import { useMemo } from "react";
import { STATUS_OPTIONS, type ProjectStatus } from "../../types/ProjectStatus";

export interface Prop {
    status: ProjectStatus,
    slot?: string | undefined,
}

/**
 * プロジェクトステータスのバッチ
 * @param param0 
 * @returns 
 */
export const ProjectStatusBadge: React.FC<Prop> = ({
    status,
    slot
}) => {

    const statusLabel = useMemo(() => STATUS_OPTIONS.find((opt) => opt.value === status), [status]);

    return (
        <IonBadge
            slot={slot ?? ''}
            color={statusLabel?.color}>
            {statusLabel?.label}
        </IonBadge>
    )
}
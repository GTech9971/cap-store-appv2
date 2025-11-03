import type { Project, ProjectHistory } from "cap-store-api-def";
import type React from "react";
import { type DOMAttributes, type ReactElement } from "react";
import { Diff } from "../../diff/Diff";

export interface Prop {
    children: ReactElement<DOMAttributes<HTMLElement>>,
    field: keyof Project,
    history: ProjectHistory | undefined,
}

export const ProjectHistoryDiff: React.FC<Prop> = ({
    children,
    field,
    history,
}) => {

    return (
        <Diff showDiff={history !== undefined && (history.changedFields?.includes(field) ?? false)}>
            {children}
        </Diff>
    )
}


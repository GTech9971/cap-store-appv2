import type { Project, ProjectHistory } from "cap-store-api-def";
import type React from "react";
import { useMemo, type DOMAttributes, type ReactElement } from "react";
import { Diff } from "../../diff/Diff";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * PascalCase -> camelCaseに変換
 * @param obj 
 * @returns 
 */
function keysToCamelCase<T>(obj: any): T {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToCamelCase(v)) as unknown as T;
    } else if (obj !== null && obj.constructor === Object) {
        return Object.entries(obj).reduce((acc, [key, value]) => {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            (acc as any)[camelKey] = keysToCamelCase(value);
            return acc;
        }, {} as any) as T;
    }
    return obj;
}

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

    const diff: string | undefined = useMemo(() => {
        if (!history || !history.snapshotJson) { return undefined; }

        const project: Project = keysToCamelCase<Project>(JSON.parse(history.snapshotJson));

        if (field === 'name') { return project.name; }
        if (field === 'summary') { return project.summary; }
        if (field === 'description') { return project.description; }
        if (field === 'status') { return project.status; }
        if (field === 'tag') { return project.tag; }

        return undefined;
    }, [field, history]);

    return (
        <Diff
            showDiff={history !== undefined}
            diffContext={diff}>
            {children}
        </Diff>
    )
}


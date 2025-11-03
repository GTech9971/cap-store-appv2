import { IonList, IonItem, IonNote, IonIcon, IonLabel, IonSelect, IonSelectOption, IonBadge, IonText } from "@ionic/react"
import type { Project, ProjectHistory } from "cap-store-api-def"
import { createOutline, pricetagOutline, timeOutline } from "ionicons/icons"
import { useMemo } from "react"
import { Editable } from "ui/components/editable/Editable"
import { ProjectHistoryDiff } from "ui/components/projects/histories/ProjectHistoryDiff"

export interface Prop {
    project: Project,
    status: string,
    onChangeStatus: (value: string) => void,
    tag: string | undefined,
    onChangeTag: (value: string | undefined) => void,

    history: ProjectHistory | undefined,
}

export const ProjectMetaDataPanel: React.FC<Prop> = ({
    project,
    status,
    onChangeStatus,
    tag,
    onChangeTag,
    history,
}) => {

    const STATUS_OPTIONS: Array<{ value: string; label: string }> = useMemo(() => {
        return [
            { value: "planning", label: "計画中" },
            { value: "processing", label: "進行中" },
            { value: "pause", label: "一時停止" },
            { value: "cancel", label: "中止" },
            { value: "complete", label: "完了" }
        ];
    }, []);

    const statusLabel = useMemo(() => {
        return STATUS_OPTIONS.find((opt) => opt.value === status)?.label ?? status;
    }, [STATUS_OPTIONS, status]);

    return (
        <IonList inset color="light">
            {/* 作成日時 */}
            <IonItem lines="none">
                <IonNote style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <IonIcon icon={createOutline} />
                    {project.createdAt.toLocaleString("ja-JP")}
                </IonNote>
            </IonItem>
            {/* 更新日時 */}
            <IonItem lines="none">
                <IonNote style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <IonIcon icon={timeOutline} />
                    {project.lastModified.toLocaleString("ja-JP")}
                </IonNote>
            </IonItem>

            <IonItem>
                <IonLabel>ステータス</IonLabel>
                <IonSelect
                    interface="popover"
                    value={status}
                    onIonChange={(e) => onChangeStatus(e.detail.value as string)}>

                    {STATUS_OPTIONS.map((option) => (
                        <IonSelectOption key={option.value} value={option.value}>
                            {option.label}
                        </IonSelectOption>
                    ))}
                </IonSelect>
            </IonItem>

            <IonItem>
                <ProjectHistoryDiff history={history} field="status">
                    <IonBadge>{statusLabel}</IonBadge>
                </ProjectHistoryDiff>

                <ProjectHistoryDiff history={history} field="tag">
                    <IonBadge slot="end" color="light" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <IonIcon icon={pricetagOutline} />
                        <Editable
                            text={tag ?? "タグなし"}
                            defaultText="タグなし"
                            onCommit={(value) => onChangeTag(value.trim() || undefined)}>
                            <IonText />
                        </Editable>
                    </IonBadge>
                </ProjectHistoryDiff>
            </IonItem>

        </IonList>
    )
}
import {
    IonButton,
    IonCol,
    IonGrid,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRow
} from "@ionic/react";
import { addOutline, trashOutline } from "ionicons/icons";
import { Bom } from "cap-store-api-def";
import { useMemo } from "react";

export type ProjectBomListProps = {
    bomList: Bom[];
    onAdd: () => void;
    onChange: (index: number, patch: Partial<Bom>) => void;
    onDelete: (index: number) => void;
};

export const ProjectBomList: React.FC<ProjectBomListProps> = ({ bomList, onAdd, onChange, onDelete }) => {
    const totalQuantity = useMemo(() => bomList.reduce((sum, bom) => sum + (bom.quantity ?? 0), 0), [bomList]);

    return (
        <IonList inset>
            <IonItem lines="full">
                <IonLabel>BOM</IonLabel>
                <IonButton slot="end" fill="clear" onClick={onAdd}>
                    <IonIcon slot="icon-only" icon={addOutline} />
                </IonButton>
            </IonItem>

            {bomList.length === 0 ? (
                <IonItem lines="none">
                    <IonNote>登録されたBOMがありません</IonNote>
                </IonItem>
            ) : (
                bomList.map((bom, index) => (
                    <IonItem key={bom.id ?? index} lines="full">
                        <IonGrid>
                            <IonRow>
                                <IonCol size="2">
                                    <IonInput
                                        label="部品ID"
                                        labelPlacement="stacked"
                                        value={bom.componentId}
                                        onIonInput={(e) => onChange(index, { componentId: e.detail.value ?? "" })}
                                    />
                                </IonCol>
                                <IonCol size="1.5">
                                    <IonInput
                                        type="number"
                                        label="数量"
                                        labelPlacement="stacked"
                                        min="1"
                                        value={String(bom.quantity ?? 0)}
                                        onIonInput={(e) => onChange(index, { quantity: Number(e.detail.value ?? "0") })}
                                    />
                                </IonCol>
                                <IonCol size="2">
                                    <IonInput
                                        label="フットプリント"
                                        labelPlacement="stacked"
                                        value={bom.footPrintName ?? ""}
                                        onIonInput={(e) => onChange(index, { footPrintName: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol size="2">
                                    <IonInput
                                        label="参照記号"
                                        labelPlacement="stacked"
                                        value={bom.refName ?? ""}
                                        onIonInput={(e) => onChange(index, { refName: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol>
                                    <IonInput
                                        label="備考"
                                        labelPlacement="stacked"
                                        value={bom.remarks ?? ""}
                                        onIonInput={(e) => onChange(index, { remarks: e.detail.value ?? undefined })}
                                    />
                                </IonCol>
                                <IonCol size="auto" className="ion-align-self-end">
                                    <IonButton color="danger" fill="clear" onClick={() => onDelete(index)}>
                                        <IonIcon slot="icon-only" icon={trashOutline} />
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </IonItem>
                ))
            )}

            <IonItem lines="none">
                <IonNote>合計数量: {totalQuantity}</IonNote>
            </IonItem>
        </IonList>
    );
};

export default ProjectBomList;

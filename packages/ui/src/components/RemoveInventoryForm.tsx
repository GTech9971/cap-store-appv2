import React, { useState } from 'react';
import { 
    IonButton, 
    IonInput, 
    IonSelect, 
    IonSelectOption, 
    IonItem, 
    IonText,
    IonList,
    IonAlert
} from '@ionic/react';

type RemoveInventoryFormProps = {
    onSubmit?: (data: { quantity: string; remarks: string; type: 'use' | 'lost' | 'scrap'; executeAt: string }) => void;
};

export const RemoveInventoryForm: React.FC<RemoveInventoryFormProps> = ({ onSubmit }) => {
    const [removeQuantity, setRemoveQuantity] = useState<string>('');
    const [removeRemarks, setRemoveRemarks] = useState<string>('特になし');
    const [removeType, setRemoveType] = useState<'use' | 'lost' | 'scrap'>('use');
    const [removeExecuteAt, setRemoveExecuteAt] = useState<string>('');
    const [removeError] = useState<string | null>(null);
    const [showRemoveAlert, setShowRemoveAlert] = useState(false);

    const handleSubmit = () => {
        onSubmit?.({ quantity: removeQuantity, remarks: removeRemarks, type: removeType, executeAt: removeExecuteAt });
        setShowRemoveAlert(false);
    };

    return (
        <>
            <div style={{ padding: '16px' }}>
                <IonText color="danger">
                    <h4 style={{ margin: '0 0 12px 0' }}>削除登録</h4>
                </IonText>

                {removeError && (
                    <IonText color="danger">
                        <p style={{ fontSize: '12px', margin: '4px 0' }}>{removeError}</p>
                    </IonText>
                )}

                <IonList style={{ margin: '0' }}>
                    <IonItem>
                        <IonInput
                            labelPlacement='stacked'
                            type="number"
                            required
                            placeholder="1"
                            value={removeQuantity}
                            onIonInput={e => setRemoveQuantity(e.detail.value!)}>
                            <div slot="label">
                                個数 <IonText color="danger">*</IonText>
                            </div>
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            placeholder="理由など"
                            required
                            labelPlacement='stacked'
                            value={removeRemarks}
                            onIonInput={e => setRemoveRemarks(e.detail.value!)}>
                            <div slot="label">
                                備考 <IonText color="danger">*</IonText>
                            </div>
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonSelect
                            required
                            label="種類"
                            labelPlacement="stacked"
                            value={removeType}
                            onIonChange={e => setRemoveType(e.detail.value)}
                        >
                            <IonSelectOption value="use">使用</IonSelectOption>
                            <IonSelectOption value="lost">紛失</IonSelectOption>
                            <IonSelectOption value="scrap">破棄</IonSelectOption>
                        </IonSelect>
                        <div slot="label">
                            種類 <IonText color="danger">*</IonText>
                        </div>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label='実施日時'
                            labelPlacement='stacked'
                            type="datetime-local"
                            value={removeExecuteAt}
                            onIonInput={e => setRemoveExecuteAt(e.detail.value!)}
                        />
                    </IonItem>
                </IonList>

                <IonButton
                    expand="block"
                    color="danger"
                    onClick={() => setShowRemoveAlert(true)}
                >
                    削除
                </IonButton>
            </div>

            <IonAlert
                isOpen={showRemoveAlert}
                onDidDismiss={() => setShowRemoveAlert(false)}
                header="確認"
                message="削除登録を実行してもよろしいですか？"
                buttons={[
                    {
                        text: 'キャンセル',
                        role: 'cancel'
                    },
                    {
                        text: '実行',
                        handler: handleSubmit
                    }
                ]}
            />
        </>
    );
};
import React, { useState } from 'react';
import { 
    IonButton, 
    IonInput, 
    IonItem, 
    IonText,
    IonList,
    IonAlert
} from '@ionic/react';

type AddInventoryFormProps = {
    onSubmit?: (data: { quantity: string; remarks: string; executeAt: string }) => void;
};

export const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onSubmit }) => {
    const [addQuantity, setAddQuantity] = useState<string>('');
    const [addRemarks, setAddRemarks] = useState<string>('特になし');
    const [addExecuteAt, setAddExecuteAt] = useState<string>('');
    const [formError] = useState<string | null>(null);
    const [showAddAlert, setShowAddAlert] = useState(false);

    const handleSubmit = () => {
        onSubmit?.({ quantity: addQuantity, remarks: addRemarks, executeAt: addExecuteAt });
        setShowAddAlert(false);
    };

    return (
        <>
            <div style={{ padding: '16px' }}>
                <IonText color="primary">
                    <h4 style={{ margin: '0 0 12px 0' }}>追加登録</h4>
                </IonText>

                {formError && (
                    <IonText color="danger">
                        <p style={{ fontSize: '12px', margin: '4px 0' }}>{formError}</p>
                    </IonText>
                )}

                <IonList style={{ margin: '0' }}>
                    <IonItem>
                        <IonInput
                            labelPlacement='stacked'
                            type="number"
                            required
                            placeholder="1"
                            value={addQuantity}
                            onIonInput={e => setAddQuantity(e.detail.value!)}>
                            <div slot="label">
                                個数 <IonText color="danger">*</IonText>
                            </div>
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            required
                            labelPlacement='stacked'
                            placeholder="理由など"
                            value={addRemarks}
                            onIonInput={e => setAddRemarks(e.detail.value!)}>
                            <div slot="label">
                                備考 <IonText color="danger">*</IonText>
                            </div>
                        </IonInput>
                    </IonItem>
                    <IonItem>
                        <IonInput
                            label='実施日時'
                            labelPlacement='stacked'
                            type="datetime-local"
                            value={addExecuteAt}
                            onIonInput={e => setAddExecuteAt(e.detail.value!)}
                        />
                    </IonItem>
                    {/* 削除フォームとボタン位置を合わせるためのスペーサー */}
                    <IonItem style={{ opacity: 0, height: '56px' }}>
                        <div></div>
                    </IonItem>
                </IonList>

                <IonButton
                    expand="block"
                    color="primary"
                    onClick={() => setShowAddAlert(true)}
                >
                    追加
                </IonButton>
            </div>

            <IonAlert
                isOpen={showAddAlert}
                onDidDismiss={() => setShowAddAlert(false)}
                header="確認"
                message="追加登録を実行してもよろしいですか？"
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
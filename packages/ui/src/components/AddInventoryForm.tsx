import React, { useState } from 'react';
import {
    IonButton,
    IonInput,
    IonItem,
    IonText,
    IonList,
    IonNote
} from '@ionic/react';
import { z } from 'zod';
import type { RegistryComponentInventoryRequest } from 'cap-store-api-def';
import './AddInventoryForm.css';

const addSchema = z.object({
    quantity: z.coerce.number({ error: '個数は数値で入力してください' })
        .min(1, '個数は1以上を入力してください'),
    remarks: z.string().min(1, '備考は必須です'),
    executeAt: z.string().optional(),
});

type AddInventoryFormProps = {
    onSubmit: (data: { quantity: number; remarks: string; executeAt: string }) => void;
};

export const AddInventoryForm: React.FC<AddInventoryFormProps> = ({ onSubmit }) => {
    const [addQuantity, setAddQuantity] = useState<number>(0);
    const [addRemarks, setAddRemarks] = useState<string>('特になし');
    const [addExecuteAt, setAddExecuteAt] = useState<string>('');
    const [errors, setErrors] = useState<Partial<Record<keyof RegistryComponentInventoryRequest, string>>>({});

    const handleSubmit = () => {
        const result = addSchema.safeParse({
            quantity: addQuantity,
            remarks: addRemarks,
            executeAt: addExecuteAt,
        });

        if (result.error) {
            const fieldErrors = result.error?.flatten().fieldErrors;
            setErrors({
                quantity: fieldErrors.quantity?.[0],
                remarks: fieldErrors.remarks?.[0],
                executeAt: fieldErrors.executeAt?.[0]
            });
            return;
        }
        onSubmit({ quantity: addQuantity, remarks: addRemarks, executeAt: addExecuteAt });
    };

    return (
        <div style={{ padding: '16px' }}>
            <IonText color="primary">
                <h4 style={{ margin: '0 0 12px 0' }}>追加登録</h4>
            </IonText>

            <IonList style={{ margin: '0' }}>
                <IonItem>
                    <IonInput
                        labelPlacement='stacked'
                        type="number"
                        required
                        min={0}
                        placeholder="1"
                        value={addQuantity}
                        onIonInput={e => setAddQuantity(Number.parseInt(e.detail.value ?? '0'))}>
                        <div slot="label">
                            個数 <IonText color="danger">*</IonText>
                        </div>

                        {errors.quantity && (
                            <IonNote color="danger" className='error-text'>
                                {errors.quantity}
                            </IonNote>
                        )}

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

                        {errors.remarks && (
                            <IonNote color="danger" className='error-text'>
                                {errors.remarks}
                            </IonNote>
                        )}

                    </IonInput>
                </IonItem>
                <IonItem>
                    <IonInput
                        label='実施日時'
                        labelPlacement='stacked'
                        type="datetime-local"
                        value={addExecuteAt}
                        onIonInput={e => setAddExecuteAt(e.detail.value!)}
                    >

                        <IonNote color="danger" className='error-text'>
                            {errors.executeAt}
                        </IonNote>

                    </IonInput>
                </IonItem>
                {/* 削除フォームとボタン位置を合わせるためのスペーサー */}
                <IonItem style={{ opacity: 0, height: '56px' }}>
                    <div></div>
                </IonItem>
            </IonList>

            <IonButton
                expand="block"
                color="primary"
                onClick={handleSubmit}
            >
                追加
            </IonButton>
        </div>
    );
};
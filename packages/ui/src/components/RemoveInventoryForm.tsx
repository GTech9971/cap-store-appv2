import React, { useState } from 'react';
import {
    IonButton,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonItem,
    IonText,
    IonList,
    IonNote
} from '@ionic/react';
import { RemoveType, type RemoveComponentInventoryRequest } from 'cap-store-api-def';
import { z } from 'zod';
import './RemoveInventoryForm.css';

const removeSchema = z.object({
    quantity: z.coerce.number({ error: '個数は数値で入力してください' })
        .min(1, '個数は1以上を入力してください'),
    remarks: z.string().min(1, '備考は必須です'),
    type: z.enum(RemoveType, { error: '種類を選択してください' }),
    executeAt: z.string().optional()
});

type RemoveInventoryFormProps = {
    onSubmit: (data: { quantity: number; remarks: string; type: RemoveType; executeAt: string }) => void;
};

export const RemoveInventoryForm: React.FC<RemoveInventoryFormProps> = ({ onSubmit }) => {
    const [removeQuantity, setRemoveQuantity] = useState<number>(0);
    const [removeRemarks, setRemoveRemarks] = useState<string>('特になし');
    const [removeType, setRemoveType] = useState<RemoveType>('use');
    const [removeExecuteAt, setRemoveExecuteAt] = useState<string>('');
    const [errors, setErrors] = useState<Partial<Record<keyof RemoveComponentInventoryRequest, string>>>({});

    const handleSubmit = () => {
        const result = removeSchema.safeParse({
            quantity: removeQuantity,
            remarks: removeRemarks,
            type: removeType,
            executeAt: removeExecuteAt
        });

        if (result.error) {
            const fieldErrors = result.error?.flatten().fieldErrors;
            setErrors({
                quantity: fieldErrors.quantity?.[0],
                remarks: fieldErrors.remarks?.[0],
                type: fieldErrors.type?.[0],
                executeAt: fieldErrors.executeAt?.[0]
            });
            return;
        }
        onSubmit({ quantity: removeQuantity, remarks: removeRemarks, type: removeType, executeAt: removeExecuteAt });
    };

    return (
        <div style={{ padding: '16px' }}>
            <IonText color="danger">
                <h4 style={{ margin: '0 0 12px 0' }}>削除登録</h4>
            </IonText>

            <IonList style={{ margin: '0' }}>
                <IonItem>
                    <IonInput
                        labelPlacement='stacked'
                        type="number"
                        required
                        placeholder="1"
                        min={0}
                        value={removeQuantity}
                        onIonInput={e => setRemoveQuantity(Number.parseInt(e.detail.value ?? '0'))}>
                        <div slot="label"> 個数 <IonText color="danger">*</IonText></div>

                        {errors.quantity && (
                            <IonNote color="danger" className='error-text'>
                                {errors.quantity}
                            </IonNote>
                        )}
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

                        {errors.remarks && (
                            <IonNote color="danger" className='error-text'>
                                {errors.remarks}
                            </IonNote>
                        )}

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
                        <IonSelectOption value="unknown">不明</IonSelectOption>
                    </IonSelect>
                    <div slot="label">
                        種類 <IonText color="danger">*</IonText>
                    </div>

                    {errors.type && (
                        <IonText color="danger" className='error-text'>
                            {errors.type}
                        </IonText>
                    )}
                </IonItem>
                <IonItem>
                    <IonInput
                        label='実施日時'
                        labelPlacement='stacked'
                        type="datetime-local"
                        value={removeExecuteAt}
                        onIonInput={e => setRemoveExecuteAt(e.detail.value!)}
                    >
                        {errors.executeAt && (
                            <IonText color='danger' className='error-text'>
                                {errors.executeAt}
                            </IonText>
                        )}
                    </IonInput>
                </IonItem>
            </IonList>

            <IonButton
                expand="block"
                color="danger"
                onClick={handleSubmit}
            >
                削除
            </IonButton>
        </div>


    );
};
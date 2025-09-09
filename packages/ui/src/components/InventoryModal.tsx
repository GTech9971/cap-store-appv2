import React, { useState } from 'react';
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonItem,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonBadge,
    IonButtons
} from '@ionic/react';
import { close } from 'ionicons/icons';
import { AddInventoryForm } from './AddInventoryForm';
import { RemoveInventoryForm } from './RemoveInventoryForm';

type InventoryModalProps = {
    isOpen: boolean;
    onDidDismiss: () => void;
    componentId?: string;
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    onDidDismiss,
    componentId = 'C-000001',
}) => {
    const [currentStock] = useState<number>(100);

    const mockHistory = [
        { id: 1, changeType: 'add', quantity: 50, remarks: '初期在庫', executeAt: new Date('2024-01-01') },
        { id: 2, changeType: 'remove', quantity: 10, remarks: '製品A使用', executeAt: new Date('2024-01-05') },
        { id: 3, changeType: 'add', quantity: 30, remarks: '追加発注', executeAt: new Date('2024-01-10') },
    ];

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>在庫管理</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={onDidDismiss}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent>
                    {/* 在庫履歴部分 */}
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <IonBadge color="primary" style={{ fontSize: '24px', padding: '12px 20px' }}>
                            {currentStock} 個
                        </IonBadge>
                    </div>

                    {/* テーブルヘッダー */}
                    <IonItem lines="full">
                        <div style={{ display: 'flex', width: '100%', fontSize: '14px', fontWeight: 'bold' }}>
                            <span style={{ width: '60px', textAlign: 'right' }}>個数</span>
                            <span style={{ flex: 1, paddingLeft: '16px' }}>備考</span>
                            <span style={{ width: '140px', textAlign: 'right' }}>実施日時</span>
                        </div>
                    </IonItem>

                    <IonList>
                        {mockHistory.map(entry => (
                            <IonItem key={entry.id}>
                                <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '8px 0' }}>
                                    <span
                                        style={{
                                            width: '60px',
                                            textAlign: 'right',
                                            color: entry.changeType === 'add' ? '#22c55e' : '#ef4444',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {entry.changeType === 'add' ? '+' : '-'}{entry.quantity}
                                    </span>
                                    <span style={{ flex: 1, paddingLeft: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {entry.remarks}
                                    </span>
                                    <span style={{ width: '140px', textAlign: 'right', fontSize: '12px', color: '#666' }}>
                                        {entry.executeAt?.toLocaleString()}
                                    </span>
                                </div>
                            </IonItem>
                        ))}
                    </IonList>

                    {/* 操作フォーム */}
                    <div style={{ borderTop: '1px solid #e0e0e0', marginTop: '20px' }}>
                        <IonGrid>
                            <IonRow>
                                <IonCol size="6" style={{ borderRight: '1px solid #e0e0e0' }}>
                                    <AddInventoryForm onSubmit={(data) => console.log('Add:', data)} />
                                </IonCol>
                                <IonCol size="6">
                                    <RemoveInventoryForm onSubmit={(data) => console.log('Remove:', data)} />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                </IonContent>
            </IonModal>
        </>
    );
};
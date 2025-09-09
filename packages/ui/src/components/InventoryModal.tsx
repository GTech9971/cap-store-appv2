import React, { useState, type CSSProperties } from 'react';
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
    IonButtons
} from '@ionic/react';
import { close, createOutline, listOutline } from 'ionicons/icons';
import { AddInventoryForm } from './AddInventoryForm';
import { RemoveInventoryForm } from './RemoveInventoryForm';

type InventoryHistoryItem = {
    id: number;
    changeType: 'add' | 'remove';
    quantity: number;
    remarks: string;
    executeAt: Date;
};

type InventoryModalProps = {
    isOpen: boolean;
    onDidDismiss: () => void;
    componentId?: string;
    currentStock?: number;
    historyData?: InventoryHistoryItem[];
    onAddSubmit?: (data: { quantity: string; remarks: string; executeAt: string }) => void;
    onRemoveSubmit?: (data: { quantity: string; remarks: string; type: 'use' | 'lost' | 'scrap'; executeAt: string }) => void;
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    onDidDismiss,
    componentId = 'C-000001',
    currentStock = 100,
    historyData = [
        { id: 1, changeType: 'add', quantity: 50, remarks: '初期在庫', executeAt: new Date('2024-01-01') },
        { id: 2, changeType: 'remove', quantity: 10, remarks: '製品A使用', executeAt: new Date('2024-01-05') },
        { id: 3, changeType: 'add', quantity: 30, remarks: '追加発注', executeAt: new Date('2024-01-10') },
    ],
    onAddSubmit,
    onRemoveSubmit
}) => {
    const [showOperationPanel, setShowOperationPanel] = useState(false);

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={onDidDismiss}>

                <IonHeader>
                    <IonToolbar>
                        <IonTitle>在庫管理</IonTitle>
                        <IonButtons slot="end">
                            <IonButton slot='icon' onClick={() => setShowOperationPanel(!showOperationPanel)}>
                                <IonIcon icon={showOperationPanel ? listOutline : createOutline} />
                            </IonButton>
                            <IonButton onClick={onDidDismiss}>
                                <IonIcon icon={close} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>

                <IonContent className="ion-padding" style={{ '--overflow-y': 'hidden' } as CSSProperties}>
                    {/* 在庫数表示 */}
                    <div style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        margin: '12px 16px'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                                    現在在庫数
                                </div>
                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#495057' }}>
                                    {currentStock} 個
                                </div>
                            </div>
                            <div style={{
                                fontSize: '24px',
                                opacity: 0.4
                            }}>
                                📦
                            </div>
                        </div>
                    </div>

                    {!showOperationPanel && (
                        <div>
                            {/* 履歴部分 */}
                            <div style={{
                                height: 'calc(100vh - 200px)',
                                minHeight: '400px',
                                overflow: 'auto'
                            }}>
                                {/* テーブルヘッダー */}
                                <IonItem lines="full" style={{ position: 'sticky', top: 0, backgroundColor: 'white', zIndex: 10 }}>
                                    <div style={{ display: 'flex', width: '100%', fontSize: '14px', fontWeight: 'bold' }}>
                                        <span style={{ width: '60px', textAlign: 'right' }}>個数</span>
                                        <span style={{ flex: 1, paddingLeft: '16px' }}>備考</span>
                                        <span style={{ width: '140px', textAlign: 'right' }}>実施日時</span>
                                    </div>
                                </IonItem>

                                <IonList>
                                    {historyData.map(entry => (
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
                            </div>
                        </div>
                    )}

                    {showOperationPanel && (
                        <div style={{ padding: '20px' }}>
                            {/* 操作フォーム */}
                            <IonGrid>
                                <IonRow>
                                    <IonCol size="6" style={{ borderRight: '1px solid #e0e0e0' }}>
                                        <AddInventoryForm onSubmit={(data) => {
                                            onAddSubmit?.(data);
                                            setShowOperationPanel(false);
                                        }} />
                                    </IonCol>
                                    <IonCol size="6">
                                        <RemoveInventoryForm onSubmit={(data) => {
                                            onRemoveSubmit?.(data);
                                            setShowOperationPanel(false);
                                        }} />
                                    </IonCol>
                                </IonRow>
                            </IonGrid>
                        </div>
                    )}
                </IonContent>

            </IonModal>
        </>
    );
};
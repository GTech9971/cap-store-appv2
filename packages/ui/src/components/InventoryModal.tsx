import React, { useCallback, useEffect, useState, type CSSProperties } from 'react';
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
import type { FetchComponentInventoryResponse, InventoriesApi, InventoryChangeEvent, RegistryComponentInventoryRequest, RemoveComponentInventoryRequest, RemoveType } from 'cap-store-api-def';
import { parseApiError } from '../utils/parseApiError';
import { useConfirmUtils } from '../utils/alertUtils';


type InventoryModalProps = {
    isOpen: boolean;
    componentId: string;
    inventoryApi: InventoriesApi,
    onDidDismiss: () => void;
};

export const InventoryModal: React.FC<InventoryModalProps> = ({
    isOpen,
    componentId = null!,
    inventoryApi,
    onDidDismiss,
}) => {

    const [showOperationPanel, setShowOperationPanel] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentStock, setCurrentStock] = useState<number>(0);
    const [historyData, setHistoryData] = useState<InventoryChangeEvent[]>([]);


    const fetchInventoryData = useCallback(async () => {
        try {
            const response: FetchComponentInventoryResponse = await inventoryApi.fetchComponentInventory({ componentId: componentId });
            const events = response.data ?? [];
            setHistoryData(events);

            const total = events.reduce((sum, ev) => (ev.changeType === 'add' ? sum + ev.quantity : sum - ev.quantity), 0);
            setCurrentStock(total);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setError(`在庫情報の取得に失敗しました。${message}:${status}`);
        }
    }, [inventoryApi, componentId]);

    useEffect(() => {
        fetchInventoryData();
    }, [fetchInventoryData])

    // 確認ダイアログ
    const [handleConfirm] = useConfirmUtils();


    /**
     * 在庫追加処理
     */
    const handleAddInventory = useCallback(async (data: { quantity: number; remarks: string; executeAt: string }) => {
        if (await handleConfirm('追加登録を実行してもよろしいですか？') === false) { return; }

        try {
            const request: RegistryComponentInventoryRequest = {
                quantity: data.quantity,
                remarks: data.remarks,
                // executeAt: data.executeAt
                //     ? parseISO(data.executeAt)
                //     : undefined
                executeAt: null!
            }
            await inventoryApi.registryComponentInventory({ componentId: componentId, registryComponentInventoryRequest: request });
            // 履歴を再取得
            await fetchInventoryData();

            setShowOperationPanel(false);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setError(`在庫の削除に失敗しました.${message}:${status}`);
        }

        setShowOperationPanel(false);
    }, [handleConfirm, inventoryApi, setShowOperationPanel, fetchInventoryData, componentId]);

    /**
     * 在庫削除処理
     */
    const handleRemoveInventory = useCallback(async (data: { quantity: number; remarks: string; type: RemoveType; executeAt: string }) => {
        if (await handleConfirm('削除登録を実行してもよろしいですか？') === false) { return; }

        try {
            const request: RemoveComponentInventoryRequest = {
                quantity: data.quantity,
                remarks: data.remarks,
                type: data.type,
                // executeAt: data.executeAt
                //     ? parseISO(data.executeAt)
                //     : undefined
                executeAt: null!
            }
            await inventoryApi.removeComponentInventory({ componentId: componentId, removeComponentInventoryRequest: request });
            // 履歴を再取得
            await fetchInventoryData();

            setShowOperationPanel(false);
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setError(`在庫の削除に失敗しました.${message}:${status}`);
        }
    }, [handleConfirm, componentId, inventoryApi, fetchInventoryData]);

    return (

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
                                    <AddInventoryForm onSubmit={handleAddInventory} />
                                </IonCol>
                                <IonCol size="6">
                                    <RemoveInventoryForm onSubmit={handleRemoveInventory} />
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </div>
                )}
            </IonContent>

        </IonModal>

    );
};
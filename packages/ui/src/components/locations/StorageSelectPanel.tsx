import { useCallback, useEffect, useState, type FC } from "react";
import type { Selected, SlotKind } from "./types";
import type { Location, Storage } from 'cap-store-api-def'
import { IonButton, IonItem, IonLabel, IonList, IonNote, IonText, } from "@ionic/react";

type Props = {
    selected: Selected | null,
    selectedStorages: Storage[],
    cabinetSlots: number,
    deskSlots: number,
    cabinet: Location,
    desk: Location,
    onSelect: (selectedStorages: Storage[]) => void,
}

// 選択中ストレージを表示する右上パネル
export const StorageSelectPanel: FC<Props> = ({
    selected,
    selectedStorages,
    cabinet,
    desk,
    onSelect,
}) => {

    const [kind, setKind] = useState<SlotKind>('cabinet');
    const [storages, setStorages] = useState<Storage[]>(selectedStorages);

    useEffect(() => {
        if (!selected) { return; }
        setKind(selected.kind);
    }, [selected]);


    // 決定ボタンで編集結果を親へ通知
    const handleSelect = useCallback(() => {
        onSelect(selectedStorages);
    }, [onSelect, selectedStorages]);


    return (
        <div className="control-panel">

            <IonText color='light'>
                選択中のストレージ
            </IonText>

            {!selected ? (
                <>
                    <br />
                    <IonNote color='light' style={{ fontSize: 'small' }}>
                        棚/引き出しをクリックしてストレージを選択して登録してください
                    </IonNote>
                </>
            ) : (
                <>
                    <div>
                        <div>
                            <>
                                <IonLabel color='light'>
                                    現在: {selected.storage?.name || '(名称未登録)'}
                                </IonLabel>

                                {selected.storage?.id &&
                                    <IonNote>
                                        [{selected.storage?.id}]
                                    </IonNote>
                                }
                            </>

                        </div>
                        <div>
                            <IonNote>
                                ロケーション: {selected.kind === 'cabinet' ? cabinet.name : desk.name} /{' '}
                                {selected.positionIndex ?? selected.storage?.positionIndex ?? '-'}段
                            </IonNote>
                        </div>

                    </div>

                    <IonList>
                        {selectedStorages.map((storage, index) =>
                            <IonItem key={index} color='dark'>
                                {storage.name}
                            </IonItem>
                        )}

                    </IonList>


                    <div className="control-panel__actions">
                        <IonButton size='small'
                            onClick={handleSelect}>
                            決定
                        </IonButton>
                    </div>
                </>
            )}
        </div>
    )
}

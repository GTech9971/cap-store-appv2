import { useEffect, useMemo, useState, type FC } from 'react'
import type { Location } from 'cap-store-api-def'
import type { Selected, SlotKind } from './types'
import {
    IonButton,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonText
} from '@ionic/react'
import './StorageControlPanel.css';

type Props = {
    selected: Selected | null,
    cabinetSlots: number,
    deskSlots: number,
    cabinet: Location,
    desk: Location,
    onSave: (locationId: string, name: string, kind: SlotKind, positionIndex: number) => void,
    onClear: () => void,
}

// 選択中ストレージを表示し、名前と配置を編集する右上パネル
export const StorageControlPanel: FC<Props> = ({
    selected,
    cabinetSlots,
    deskSlots,
    cabinet,
    desk,
    onSave,
    onClear,
}) => {
    const [name, setName] = useState<string>('');
    const [kind, setKind] = useState<SlotKind>('cabinet');
    const [position, setPosition] = useState<number>(1);

    // 選択変更時にフォームを同期
    useEffect(() => {
        if (!selected) return;

        setName(selected.storage?.name ?? '');
        setKind(selected.kind);
        setPosition(selected.positionIndex ?? selected.storage?.positionIndex ?? 1);
    }, [selected]);

    // ロケーションごとの段数を計算
    const positionOptions: number[] = useMemo(() => {

        const length: number = kind === 'cabinet'
            ? cabinetSlots
            : deskSlots;

        return Array.from({ length }, (_, idx) => idx + 1).sort((a, b) => b - a);
    }, [cabinetSlots, deskSlots, kind]);

    // 保存ボタンで編集結果を親へ通知
    const handleSave = () => {
        const trimmed = name.trim();
        if (!selected || !trimmed) return;

        onSave(selected.locationId, trimmed, kind, position);
    }

    // ロケーション変更時に段をリセット
    const handleKindChange = (nextKind: SlotKind) => {
        setKind(nextKind);
        setPosition(1);
    }

    return (
        <div className="control-panel">

            <IonText color='light'>
                選択中のストレージ
            </IonText>

            {!selected ? (
                <>
                    <br />
                    <IonNote color='light' style={{ fontSize: 'small' }}>
                        棚/引き出しをクリックしてストレージを選択、または空き位置を選択して登録してください
                    </IonNote>
                </>
            ) : (
                <>
                    <div>
                        <div>
                            <IonLabel color='light'>
                                現在: {selected.storage?.name || '(名称未登録)'}
                            </IonLabel>
                        </div>
                        <div>
                            <IonNote>
                                ロケーション: {selected.kind === 'cabinet' ? cabinet.name : desk.name} /{' '}
                                {selected.positionIndex ?? selected.storage?.positionIndex ?? '-'}段
                            </IonNote>
                        </div>

                    </div>

                    <IonList>
                        <IonItem color='dark'>
                            <IonInput
                                label='名前'
                                labelPlacement='stacked'
                                type='text'
                                value={name}
                                onIonChange={(e) => setName(e.target.value as string)}
                                placeholder="表面実装保管庫"
                            />
                        </IonItem>

                        <IonItem color='dark'>
                            <IonSelect
                                label='ロケーション'
                                labelPlacement='stacked'
                                value={kind}
                                onIonChange={(e) => handleKindChange(e.target.value as SlotKind)}>
                                <IonSelectOption value='cabinet'>
                                    {cabinet.name || 'キャビネット'}
                                </IonSelectOption>

                                <IonSelectOption value='desk'>
                                    {desk.name || 'デスク'}
                                </IonSelectOption>
                            </IonSelect>
                        </IonItem>

                        <IonItem color='dark'>
                            <IonSelect
                                label='段数'
                                labelPlacement='stacked'
                                value={position}
                                onIonChange={(e) => setPosition(Number(e.target.value))}>
                                {positionOptions.map((pos) => (
                                    <IonSelectOption key={pos} value={pos}>
                                        {pos} 段
                                    </IonSelectOption>
                                ))}
                            </IonSelect>
                        </IonItem>

                    </IonList>

                    {(selected.hasStorage && !selected.storage) &&
                        <IonText color='warning' style={{ fontSize: '10px' }}>
                            既存データがあります。編集はラベルクリックで行ってください。
                        </IonText>
                    }


                    <div className="control-panel__actions">
                        <IonButton size='small'
                            onClick={handleSave}
                            disabled={
                                !name.trim() ||
                                (selected?.storage == null && selected?.hasStorage)}>
                            保存
                        </IonButton>

                        <IonButton
                            color='medium'
                            size='small'
                            onClick={onClear}>
                            クリア
                        </IonButton>

                    </div>
                </>
            )}
        </div>
    )
}

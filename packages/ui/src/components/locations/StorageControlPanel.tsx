import { useEffect, useMemo, useState, type FC } from 'react'
import type { Storage } from 'cap-store-api-def'
import type { SlotKind } from './types'

type Props = {
    selected: { kind: SlotKind; positionIndex: number; storage: Storage | null; hasStorage: boolean } | null
    cabinetSlots: number
    deskSlots: number
    cabinetName: string
    deskName: string
    onSave: (name: string, kind: SlotKind, positionIndex: number) => void
    onClear: () => void
}

// 選択中ストレージを表示し、名前と配置を編集する右上パネル
export const StorageControlPanel: FC<Props> = ({
    selected,
    cabinetSlots,
    deskSlots,
    cabinetName,
    deskName,
    onSave,
    onClear,
}) => {
    const [name, setName] = useState('')
    const [kind, setKind] = useState<SlotKind>('cabinet')
    const [position, setPosition] = useState(1)

    // 選択変更時にフォームを同期
    useEffect(() => {
        if (!selected) return
        setName(selected.storage?.name ?? '')
        setKind(selected.kind)
        setPosition(selected.positionIndex ?? selected.storage?.positionIndex ?? 1)
    }, [selected])

    // ロケーションごとの段数を計算
    const positionOptions = useMemo(() => {
        const length = kind === 'cabinet' ? cabinetSlots : deskSlots
        return Array.from({ length }, (_, idx) => idx + 1)
    }, [cabinetSlots, deskSlots, kind])

    // 保存ボタンで編集結果を親へ通知
    const handleSave = () => {
        const trimmed = name.trim()
        if (!selected || !trimmed) return
        onSave(trimmed, kind, position)
    }

    // ロケーション変更時に段をリセット
    const handleKindChange = (nextKind: SlotKind) => {
        setKind(nextKind)
        setPosition(1)
    }

    return (
        <div className="control-panel">
            <div className="control-panel__header">選択中のストレージ</div>
            {!selected ? (
                <div className="control-panel__empty">棚/引き出しをクリックしてストレージを選択、または空き位置を選択して登録してください</div>
            ) : (
                <>
                    <div className="control-panel__meta">
                        <div>現在: {selected.storage?.name || '(名称未登録)'}</div>
                        <div>
                            ロケーション: {selected.kind === 'cabinet' ? cabinetName : deskName} /{' '}
                            {selected.positionIndex ?? selected.storage?.positionIndex ?? '-'}段
                        </div>
                        {selected.hasStorage && !selected.storage ? (
                            <div style={{ color: '#ffae42', fontSize: 12 }}>
                                既存があります。編集はラベルクリックで行ってください。
                            </div>
                        ) : null}
                    </div>
                    <div className="control-panel__field">
                        <label className="control-panel__label">名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="control-panel__input"
                            placeholder="Storage name"
                        />
                    </div>
                    <div className="control-panel__field">
                        <label className="control-panel__label">ロケーション</label>
                        <select
                            value={kind}
                            onChange={(e) => handleKindChange(e.target.value as SlotKind)}
                            className="control-panel__select"
                        >
                            <option value="cabinet">{cabinetName || 'キャビネット'}</option>
                            <option value="desk">{deskName || 'デスク'}</option>
                        </select>
                    </div>
                    <div className="control-panel__field">
                        <label className="control-panel__label">段</label>
                        <select
                            value={position}
                            onChange={(e) => setPosition(Number(e.target.value))}
                            className="control-panel__select"
                        >
                            {positionOptions.map((pos) => (
                                <option key={pos} value={pos}>
                                    {pos} 段
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="control-panel__actions">
                        <button
                            type="button"
                            className="control-panel__button control-panel__button--primary"
                            onClick={handleSave}
                            disabled={
                                !name.trim() ||
                                (selected?.storage == null && selected?.hasStorage)
                            }
                        >
                            保存
                        </button>
                        <button
                            type="button"
                            className="control-panel__button"
                            onClick={onClear}
                        >
                            クリア
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

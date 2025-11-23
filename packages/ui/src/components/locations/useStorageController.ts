import { useEffect, useMemo, useState } from 'react'
import type { Location } from 'cap-store-api-def'
import type { UiStorage } from './types'

export type SlotKind = 'cabinet' | 'desk'

export type MoveEndpoint = {
    kind: SlotKind
    positionIndex: number
    location: Location | null
    storage?: UiStorage
}

type Args = {
    cabinetLocation?: Location | null
    deskLocation?: Location | null
    cabinetStorages?: UiStorage[]
    deskStorages?: UiStorage[]
    onCabinetDrawerSelect?: (args: MoveEndpoint) => void
    onDeskShelfSelect?: (args: MoveEndpoint) => void
    onEmptyCabinetSlotDoubleClick?: (args: { positionIndex: number; location: Location | null }) => void
    onEmptyDeskSlotDoubleClick?: (args: { positionIndex: number; location: Location | null }) => void
    onStorageMove?: (args: { from: MoveEndpoint; to: MoveEndpoint }) => void
}

// ストレージ配列＋移動状態を管理する最小限のフック
export const useStorageController = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
    onCabinetDrawerSelect,
    onDeskShelfSelect,
    onEmptyCabinetSlotDoubleClick,
    onEmptyDeskSlotDoubleClick,
    onStorageMove,
}: Args) => {
    const [movingFrom, setMovingFrom] = useState<MoveEndpoint | null>(null)
    const [blinkPhase, setBlinkPhase] = useState(false)

    // 表示用のローカル配列（移動後もラベルが追従するように内部で更新）
    const [cabinetList, setCabinetList] = useState<UiStorage[]>(() => cabinetStorages ?? [])
    const [deskList, setDeskList] = useState<UiStorage[]>(() => deskStorages ?? [])

    useEffect(() => {
        setCabinetList(cabinetStorages ?? [])
    }, [cabinetStorages])

    useEffect(() => {
        setDeskList(deskStorages ?? [])
    }, [deskStorages])

    // 選択中インデックス（UIでハイライトに使用）
    const [cabinetHighlight, setCabinetHighlight] = useState<number | null>(null)
    const [deskHighlight, setDeskHighlight] = useState<number | null>(null)

    const findStorage = (kind: SlotKind, index: number) =>
        (kind === 'cabinet' ? cabinetList : deskList).find((s) => s.positionIndex === index)

    const dropMove = (to: MoveEndpoint) => {
        if (!movingFrom) return
        const movingStorage = movingFrom.storage
        if (movingStorage) {
            const updated: UiStorage = {
                ...movingStorage,
                positionIndex: to.positionIndex,
                locationId: to.location?.id ?? movingStorage.locationId,
            }
            setCabinetList((prev) => {
                const filtered = prev.filter((s) => s.id !== movingStorage.id)
                return to.kind === 'cabinet' ? [...filtered, updated] : filtered
            })
            setDeskList((prev) => {
                const filtered = prev.filter((s) => s.id !== movingStorage.id)
                return to.kind === 'desk' ? [...filtered, updated] : filtered
            })
        }
        onStorageMove?.({ from: movingFrom, to })
        setMovingFrom(null)
        setCabinetHighlight(to.kind === 'cabinet' ? to.positionIndex : null)
        setDeskHighlight(to.kind === 'desk' ? to.positionIndex : null)
    }

    // スロット単位のクリック: 移動中ならドロップ、通常は選択イベント
    const handleSelect = (kind: SlotKind, index: number) => {
        const location = kind === 'cabinet' ? cabinetLocation ?? null : deskLocation ?? null
        const matchedStorage = findStorage(kind, index)

        if (movingFrom) {
            dropMove({ kind, positionIndex: index, location, storage: matchedStorage })
            return
        }

        if (kind === 'cabinet') {
            setCabinetHighlight(index)
            setDeskHighlight(null)
            onCabinetDrawerSelect?.({ kind, positionIndex: index, location, storage: matchedStorage })
        } else {
            setDeskHighlight(index)
            setCabinetHighlight(null)
            onDeskShelfSelect?.({ kind, positionIndex: index, location, storage: matchedStorage })
        }
    }

    // スロット単位のダブルクリック: 既存なら移動開始、空きなら新規登録イベント
    const handleDoubleClick = (kind: SlotKind, index: number) => {
        const location = kind === 'cabinet' ? cabinetLocation ?? null : deskLocation ?? null
        const matchedStorage = findStorage(kind, index)
        if (matchedStorage) {
            setMovingFrom({ kind, positionIndex: index, location, storage: matchedStorage })
            if (kind === 'cabinet') {
                setCabinetHighlight(index)
                setDeskHighlight(null)
            } else {
                setDeskHighlight(index)
                setCabinetHighlight(null)
            }
            return
        }

        if (kind === 'cabinet') {
            onEmptyCabinetSlotDoubleClick?.({ positionIndex: index, location })
        } else {
            onEmptyDeskSlotDoubleClick?.({ positionIndex: index, location })
        }
    }

    // 移動中のみ点滅フェーズをトグル
    useEffect(() => {
        if (!movingFrom) {
            setBlinkPhase(false)
            return
        }
        const id = window.setInterval(() => {
            setBlinkPhase((prev) => !prev)
        }, 500)
        return () => window.clearInterval(id)
    }, [movingFrom])

    return {
        cabinetHighlight,
        deskHighlight,
        cabinetStorages: cabinetList,
        deskStorages: deskList,
        movingFrom,
        blinkPhase,
        handleSelect,
        handleDoubleClick,
    }
}

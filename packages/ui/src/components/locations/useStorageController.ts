import { useEffect, useMemo, useState } from 'react'
import type { Location } from 'cap-store-api-def'
import type { UiStorage } from './types'

export type SlotKind = 'cabinet' | 'desk'

export type MoveEndpoint = {
    kind: SlotKind
    positionIndex: number
    location: Location
    storage?: UiStorage
}

type Args = {
    cabinetLocation: Location
    deskLocation: Location
    cabinetStorages?: UiStorage[]
    deskStorages?: UiStorage[]
    onStoragesChange?: (cabinet: UiStorage[], desk: UiStorage[]) => void
}

// ストレージ配列＋移動状態を管理する最小限のフック
export const useStorageController = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
    onStoragesChange,
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

    const updateStorages = (nextCab: UiStorage[], nextDesk: UiStorage[]) => {
        setCabinetList(nextCab)
        setDeskList(nextDesk)
        onStoragesChange?.(nextCab, nextDesk)
    }

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
            const nextCabinet = to.kind === 'cabinet'
                ? [...cabinetList.filter((s) => s.id !== movingStorage.id), updated]
                : cabinetList.filter((s) => s.id !== movingStorage.id)
            const nextDesk = to.kind === 'desk'
                ? [...deskList.filter((s) => s.id !== movingStorage.id), updated]
                : deskList.filter((s) => s.id !== movingStorage.id)
            updateStorages(nextCabinet, nextDesk)
        }
        setMovingFrom(null)
        setCabinetHighlight(to.kind === 'cabinet' ? to.positionIndex : null)
        setDeskHighlight(to.kind === 'desk' ? to.positionIndex : null)
    }

    // スロット単位のクリック: 移動中ならドロップ、通常は選択イベント
    const handleSelect = (kind: SlotKind, index: number) => {
        const location = kind === 'cabinet' ? cabinetLocation : deskLocation
        const matchedStorage = findStorage(kind, index)

        if (movingFrom) {
            dropMove({ kind, positionIndex: index, location, storage: matchedStorage })
            return
        }

        if (kind === 'cabinet') {
            setCabinetHighlight(index)
            setDeskHighlight(null)
        } else {
            setDeskHighlight(index)
            setCabinetHighlight(null)
        }
    }

    // スロット単位のダブルクリック: 既存なら移動開始、空きなら新規登録イベント
    const handleDoubleClick = (kind: SlotKind, index: number) => {
        const location = kind === 'cabinet' ? cabinetLocation : deskLocation
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

        // 空スロットの登録は呼び出し側でハンドリング
    }

    const addStorage = (kind: SlotKind, index: number, name: string, location?: Location) => {
        const targetLocation = location ?? (kind === 'cabinet' ? cabinetLocation : deskLocation)
        const newStorage: UiStorage = {
            id: null!,
            name,
            positionIndex: index,
            locationId: targetLocation?.id,
        }
        if (kind === 'cabinet') {
            updateStorages([...cabinetList.filter((s) => s.positionIndex !== index), newStorage], deskList)
            setCabinetHighlight(index)
            setDeskHighlight(null)
        } else {
            updateStorages(cabinetList, [...deskList.filter((s) => s.positionIndex !== index), newStorage])
            setDeskHighlight(index)
            setCabinetHighlight(null)
        }
    }

    const updateStorageName = (kind: SlotKind, id: string, name: string) => {
        const updater = (list: UiStorage[]) => list.map((s) => (s.id === id ? { ...s, name } : s))
        if (kind === 'cabinet') {
            updateStorages(updater(cabinetList), deskList)
        } else {
            updateStorages(cabinetList, updater(deskList))
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
        addStorage,
        updateStorageName,
    }
}

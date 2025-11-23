import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { useEffect, useState, type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { StorageControlPanel } from './StorageControlPanel'
import type { SlotKind, UiStorage } from './types'
import './NorthRoom.css'

const CABINET_SLOTS = 5
const DESK_SLOTS = 2

/**
 * NorthRoom コンポーネント仕様
 * - ロケーションとストレージ配列を受け取り、Cabinet/Deskを描画
 * - onStoragesChangeでストレージ配列の更新を親へ通知（移動・追加・編集）
 * - スロットクリック: 空スロットは右上パネルで名前を入力し保存すると新規追加
 * - ラベルクリック: 右上パネルで名前変更＋移動先（ロケーション/段）を編集
 * - カメラ操作はOrbitControlsで常時可能
 */
type Props = {
    cabinetLocation: Location
    deskLocation: Location
    cabinetStorages?: Storage[]
    deskStorages?: Storage[]
    onStoragesChange?: (cabinet: Storage[], desk: Storage[]) => void
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
    onStoragesChange,
}) => {
    // キャビネット/デスクの表示用リスト
    const [cabinetList, setCabinetList] = useState<UiStorage[]>(() => cabinetStorages ?? [])
    const [deskList, setDeskList] = useState<UiStorage[]>(() => deskStorages ?? [])
    // スロットのハイライト状態
    const [cabinetHighlight, setCabinetHighlight] = useState<number | null>(null)
    const [deskHighlight, setDeskHighlight] = useState<number | null>(null)
    const [selected, setSelected] = useState<{ kind: 'cabinet' | 'desk'; positionIndex: number; storage: Storage | null; hasStorage: boolean } | null>(null)

    useEffect(() => {
        setCabinetList(cabinetStorages ?? [])
    }, [cabinetStorages])

    useEffect(() => {
        setDeskList(deskStorages ?? [])
    }, [deskStorages])

    // 親へ通知しつつローカル配列を更新
    const updateStorages = (nextCab: UiStorage[], nextDesk: UiStorage[]) => {
        setCabinetList(nextCab)
        setDeskList(nextDesk)
        onStoragesChange?.(nextCab, nextDesk)
    }

    // スロット選択時にハイライトを切り替える
    const handleSelect = (kind: SlotKind, index: number) => {
        if (kind === 'cabinet') {
            setCabinetHighlight(index)
            setDeskHighlight(null)
        } else {
            setDeskHighlight(index)
            setCabinetHighlight(null)
        }
    }

    // 指定したストレージを任意のロケーション・位置へ移動
    const moveStorage = (storage: UiStorage, toKind: SlotKind, positionIndex: number) => {
        const allStorages = [...cabinetList, ...deskList]
        const target = allStorages.find((s) => s.id === storage.id) ?? allStorages.find((s) => s === storage)
        if (!target) return

        const targetLocationId = toKind === 'cabinet' ? cabinetLocation.id : deskLocation.id
        const updated: UiStorage = {
            ...target,
            ...storage,
            positionIndex,
            locationId: targetLocationId ?? target.locationId,
        }

        const removeFromList = (list: UiStorage[]) => list.filter((s) => s.id !== target.id && s !== target)
        const nextCabinet = toKind === 'cabinet'
            ? [...removeFromList(cabinetList), updated]
            : removeFromList(cabinetList)
        const nextDesk = toKind === 'desk'
            ? [...removeFromList(deskList), updated]
            : removeFromList(deskList)

        updateStorages(nextCabinet, nextDesk)
        setCabinetHighlight(toKind === 'cabinet' ? positionIndex : null)
        setDeskHighlight(toKind === 'desk' ? positionIndex : null)
    }

    // 選択ハイライトをクリア
    const clearSelection = () => {
        setCabinetHighlight(null)
        setDeskHighlight(null)
    }

    // 新規ストレージを空スロットへ追加
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

    // 空スロット/既存問わずクリックでパネル選択。ラベルクリックは名称変更用に温存。
    const handleSlotAction = (kind: 'cabinet' | 'desk', index: number, slotStorages: Storage[]) => {
        const isSameEmpty =
            selected &&
            selected.kind === kind &&
            selected.storage == null &&
            selected.positionIndex === index

        if (isSameEmpty) {
            setSelected(null)
            clearSelection()
            return
        }

        handleSelect(kind, index)
        setSelected({ kind, positionIndex: index, storage: null, hasStorage: slotStorages.length > 0 })
    }

    // ラベルクリックで選択を確定し、フォームへ反映（名称編集用途）
    const handleSelectStorage = (kind: 'cabinet' | 'desk', storage: Storage) => {
        const isSame =
            selected?.kind === kind &&
            selected.storage != null &&
            ((selected.storage.id && selected.storage.id === storage.id) ||
                (!selected.storage.id &&
                    !storage.id &&
                    selected.storage.positionIndex === storage.positionIndex &&
                    selected.storage.name === storage.name))

        if (isSame) {
            setSelected(null)
            clearSelection()
            return
        }

        setSelected({ kind, storage, positionIndex: storage.positionIndex ?? 1, hasStorage: true })
        handleSelect(kind, storage.positionIndex ?? 1)
    }

    // パネルからの保存で移動と名称変更を反映
    const handleSaveStorage = (name: string, kind: 'cabinet' | 'desk', positionIndex: number) => {
        if (!selected) return
        if (selected.storage) {
            const nextStorage = { ...selected.storage, name }
            moveStorage(nextStorage, kind, positionIndex)
            setSelected({ kind, positionIndex, storage: { ...nextStorage, positionIndex }, hasStorage: true })
            return
        }
        if (selected.hasStorage) {
            return
        }
        const location = kind === 'cabinet' ? cabinetLocation : deskLocation
        addStorage(kind, positionIndex, name, location)
        setSelected({ kind, positionIndex, storage: { id: null!, name, positionIndex, locationId: location?.id }, hasStorage: true })
    }

    // 選択解除
    const handleClearSelection = () => {
        setSelected(null)
    }

    return (
        <div className="app">
            <StorageControlPanel
                selected={selected}
                cabinetSlots={CABINET_SLOTS}
                deskSlots={DESK_SLOTS}
                cabinetName={cabinetLocation?.name ?? 'キャビネット'}
                deskName={deskLocation?.name ?? 'デスク'}
                onSave={handleSaveStorage}
                onClear={handleClearSelection}
            />
            <Canvas
                className="canvas-container"
                camera={{ fov: 60, position: [6, 4, 12] }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#111111']} />
                <ambientLight intensity={0.2} />
                <directionalLight position={[5, 10, 7]} intensity={1} />
                <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
                <Desk
                    highlight={deskHighlight}
                    onSelectShelf={(index, slotStorages) => handleSlotAction('desk', index, slotStorages)}
                    locationName={deskLocation?.name}
                    storages={deskList}
                    onEditStorage={(storage) => handleSelectStorage('desk', storage)}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={(index, slotStorages) => handleSlotAction('cabinet', index, slotStorages)}
                    locationName={cabinetLocation?.name}
                    storages={cabinetList}
                    onEditStorage={(storage) => handleSelectStorage('cabinet', storage)}
                />
            </Canvas>
        </div>
    )
}

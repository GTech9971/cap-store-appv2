import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { useCallback, useState, type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { StorageControlPanel } from './StorageControlPanel'
import type { Selected, SlotKind, UiStorage } from './types'
import './NorthRoom.css'

const CABINET_SLOTS = 5;
const DESK_SLOTS = 2;

/**
 * NorthRoom コンポーネント仕様
 * - ロケーションとストレージ配列を受け取り、Cabinet/Deskを描画
 * - onStoragesChangeでストレージ配列の更新を親へ通知（移動・追加・編集）
 * - スロットクリック: 空スロットは右上パネルで名前を入力し保存すると新規追加
 * - ラベルクリック: 右上パネルで名前変更＋移動先（ロケーション/段）を編集
 * - カメラ操作はOrbitControlsで常時可能
 */
type Props = {
    cabinetLocation: Location,
    deskLocation: Location,
    /**
     * 
     * @param mode 
     * @param storage 
     * @returns storageId
     */
    onSave: (mode: 'new' | 'update', storage: Storage) => Promise<string>;
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    onSave,
}) => {
    // キャビネット/デスクの表示用リスト
    const [cabinetList, setCabinetList] = useState<UiStorage[]>(() => cabinetLocation.storages ?? []);
    const [deskList, setDeskList] = useState<UiStorage[]>(() => deskLocation.storages ?? []);
    // スロットのハイライト状態
    const [cabinetHighlight, setCabinetHighlight] = useState<number | null>(null);
    const [deskHighlight, setDeskHighlight] = useState<number | null>(null);
    const [selected, setSelected] = useState<Selected | null>(null);;

    // 親へ通知しつつローカル配列を更新
    const updateStorages = useCallback((nextCab: UiStorage[], nextDesk: UiStorage[]) => {
        setCabinetList(nextCab);
        setDeskList(nextDesk);
    }, []);

    // スロット選択時にハイライトを切り替える
    const handleSelect = useCallback((kind: SlotKind, index: number) => {
        if (kind === 'cabinet') {
            setCabinetHighlight(index);
            setDeskHighlight(null);
        } else {
            setDeskHighlight(index);
            setCabinetHighlight(null);
        }
    }, []);

    // 指定したストレージを任意のロケーション・位置へ移動
    const moveStorage = useCallback((storage: UiStorage, toKind: SlotKind, positionIndex: number) => {
        const allStorages: Storage[] = [...cabinetList, ...deskList];
        const target: Storage | undefined = allStorages.find((s) => s.id === storage.id) ?? allStorages.find((s) => s === storage);
        if (!target) return;

        const targetLocationId = toKind === 'cabinet' ? cabinetLocation.id : deskLocation.id;
        const updated: UiStorage = {
            ...target,
            ...storage,
            positionIndex,
            locationId: targetLocationId ?? target.locationId,
        }

        const removeFromList = (list: UiStorage[]) => list.filter((s) => s.id !== target.id && s !== target);
        const nextCabinet = toKind === 'cabinet'
            ? [...removeFromList(cabinetList), updated]
            : removeFromList(cabinetList);

        const nextDesk = toKind === 'desk'
            ? [...removeFromList(deskList), updated]
            : removeFromList(deskList);

        updateStorages(nextCabinet, nextDesk);
        setCabinetHighlight(toKind === 'cabinet' ? positionIndex : null);
        setDeskHighlight(toKind === 'desk' ? positionIndex : null);
    }, [cabinetList, cabinetLocation.id, deskList, deskLocation.id, updateStorages]);

    // 選択ハイライトをクリア
    const clearSelection = useCallback(() => {
        setCabinetHighlight(null);
        setDeskHighlight(null);
    }, []);

    // 新規ストレージを空スロットへ追加
    const addStorage = useCallback((kind: SlotKind, index: number, name: string, location?: Location) => {
        const targetLocation = location ?? (kind === 'cabinet' ? cabinetLocation : deskLocation);

        const newStorage: UiStorage = {
            id: null!,
            name,
            positionIndex: index,
            locationId: targetLocation?.id,
        };

        if (kind === 'cabinet') {
            updateStorages([...cabinetList.filter((s) => s.positionIndex !== index), newStorage], deskList);
            setCabinetHighlight(index);
            setDeskHighlight(null);
        } else {
            updateStorages(cabinetList, [...deskList.filter((s) => s.positionIndex !== index), newStorage]);
            setDeskHighlight(index);
            setCabinetHighlight(null);
        }
    }, [cabinetList, cabinetLocation, deskList, deskLocation, updateStorages]);

    // 空スロット/既存問わずクリックでパネル選択。ラベルクリックは名称変更用に温存。
    const handleSlotAction = useCallback((kind: SlotKind, locationId: string, index: number, slotStorages: Storage[]) => {
        const isSameEmpty =
            selected &&
            selected.kind === kind &&
            selected.storage == null &&
            selected.positionIndex === index;

        if (isSameEmpty) {
            setSelected(null);
            clearSelection();
            return;
        }

        handleSelect(kind, index);
        setSelected({ kind, locationId, positionIndex: index, storage: null, hasStorage: slotStorages.length > 0 })
    }, [selected, clearSelection, handleSelect,]);

    // ラベルクリックで選択を確定し、フォームへ反映（名称編集用途）
    const handleSelectStorage = useCallback((kind: SlotKind, locationId: string, storage: Storage) => {
        const isSame: boolean =
            selected?.kind === kind &&
            selected.storage != null &&
            ((selected.storage.id && selected.storage.id === storage.id) ||
                (!selected.storage.id &&
                    !storage.id &&
                    selected.storage.positionIndex === storage.positionIndex &&
                    selected.storage.name === storage.name));

        if (isSame) {
            setSelected(null);
            clearSelection();
            return
        }

        setSelected({ kind, locationId: locationId, storage, positionIndex: storage.positionIndex ?? 1, hasStorage: true });
        handleSelect(kind, storage.positionIndex ?? 1);
    }, [selected, clearSelection, handleSelect]);

    // パネルからの保存で移動と名称変更を反映
    const handleSaveStorage = useCallback(async (locationId: string, name: string, kind: SlotKind, positionIndex: number, useableFreeSpace: number) => {
        if (!selected) return;

        // 更新
        if (selected.storage) {
            const nextStorage = { ...selected.storage, name, positionIndex: positionIndex, useableFreeSpace: useableFreeSpace };
            moveStorage(nextStorage, kind, positionIndex);
            setSelected({ kind, locationId, positionIndex, storage: nextStorage, hasStorage: true });

            await onSave('update', nextStorage);
            return;
        }


        if (selected.hasStorage) { return; }
        // 新規
        const location: Location = kind === 'cabinet'
            ? cabinetLocation
            : deskLocation;

        const newStorage: Storage = { id: null!, name, positionIndex, locationId: location.id, useableFreeSpace: useableFreeSpace };

        const newStorageId: string = await onSave('new', newStorage);
        newStorage.id = newStorageId;

        addStorage(kind, positionIndex, name, location);
        setSelected({ kind, locationId, positionIndex, storage: newStorage, hasStorage: true });
    }, [addStorage, cabinetLocation, deskLocation, moveStorage, selected, onSave]);

    // 選択解除
    const handleClearSelection = useCallback(() => {
        setSelected(null);
    }, []);

    return (
        <div className="app">
            <StorageControlPanel
                selected={selected}
                cabinetSlots={CABINET_SLOTS}
                deskSlots={DESK_SLOTS}
                cabinet={cabinetLocation}
                desk={deskLocation}
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
                    onSelectShelf={(index, slotStorages) => handleSlotAction('desk', deskLocation.id, index, slotStorages)}
                    locationName={deskLocation.name}
                    storages={deskList}
                    onEditStorage={(storage) => handleSelectStorage('desk', deskLocation.id, storage)}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={(index, slotStorages) => handleSlotAction('cabinet', cabinetLocation.id, index, slotStorages)}
                    locationName={cabinetLocation.name}
                    storages={cabinetList}
                    onEditStorage={(storage) => handleSelectStorage('cabinet', cabinetLocation.id, storage)}
                />
            </Canvas>
        </div>
    )
}

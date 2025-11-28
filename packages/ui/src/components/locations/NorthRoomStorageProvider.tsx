import type { Location, Storage } from 'cap-store-api-def'
import { useCallback, useMemo, useReducer, type FC, type ReactNode } from 'react'
import type { SlotKind, UiStorage } from './types'
import { NorthRoomStorageContextProvider, useNorthRoomHighlightContext } from './NorthRoomContext'

const CABINET_SLOTS = 5;
const DESK_SLOTS = 2;

type StorageState = {
    cabinetList: UiStorage[];
    deskList: UiStorage[];
};

type StorageAction =
    | { type: 'MOVE_STORAGE'; storage: UiStorage; toKind: SlotKind; positionIndex: number; cabinetLocationId?: string; deskLocationId?: string }
    | { type: 'UPSERT_STORAGE'; storage: UiStorage; kind: SlotKind };

/**
 * storageReducerはNorthRoomのストレージ配列を更新するためのReducer。
 * 移動や新規登録時の整合性を担保する。
 */
const storageReducer = (state: StorageState, action: StorageAction): StorageState => {
    switch (action.type) {
        case 'MOVE_STORAGE': {
            const { storage, toKind, positionIndex, cabinetLocationId, deskLocationId } = action;
            const allStorages: Storage[] = [...state.cabinetList, ...state.deskList];
            const target: Storage | undefined = allStorages.find((s) => s.id === storage.id) ?? allStorages.find((s) => s === storage);
            if (!target) return state;

            const targetLocationId = toKind === 'cabinet' ? cabinetLocationId : deskLocationId;
            const updated: UiStorage = {
                ...target,
                ...storage,
                positionIndex,
                locationId: targetLocationId ?? target.locationId,
            };

            const removeFromList = (list: UiStorage[]) => list.filter((s) => s.id !== target.id && s !== target);
            const nextCabinet = toKind === 'cabinet'
                ? [...removeFromList(state.cabinetList), updated]
                : removeFromList(state.cabinetList);

            const nextDesk = toKind === 'desk'
                ? [...removeFromList(state.deskList), updated]
                : removeFromList(state.deskList);

            return {
                ...state,
                cabinetList: nextCabinet,
                deskList: nextDesk,
            };
        }

        case 'UPSERT_STORAGE': {
            const targetIndex = action.storage.positionIndex ?? 1;
            const nextCabinet = action.kind === 'cabinet'
                ? [...state.cabinetList.filter((s) => s.positionIndex !== targetIndex), action.storage]
                : state.cabinetList;

            const nextDesk = action.kind === 'desk'
                ? [...state.deskList.filter((s) => s.positionIndex !== targetIndex), action.storage]
                : state.deskList;

            return {
                ...state,
                cabinetList: nextCabinet,
                deskList: nextDesk,
            };
        }

        default:
            return state;
    }
};

type Props = {
    cabinetLocation: Location;
    deskLocation: Location;
    onSave: (mode: 'new' | 'update', storage: Storage) => Promise<string>;
    children: ReactNode;
};

/**
 * NorthRoomStorageProviderはストレージ配列の更新と保存処理を扱うProvider。
 */
export const NorthRoomStorageProvider: FC<Props> = ({ cabinetLocation, deskLocation, onSave, children }) => {
    const [storageState, storageDispatch] = useReducer(storageReducer, {
        cabinetList: cabinetLocation.storages ?? [],
        deskList: deskLocation.storages ?? [],
    });

    const { applyHighlight, selected, setSelected } = useNorthRoomHighlightContext();

    const { cabinetList, deskList } = storageState;

    /**
     * ストレージを指定ロケーションへ移動する。
     */
    const moveStorage = useCallback((storage: UiStorage, toKind: SlotKind, positionIndex: number) => {
        storageDispatch({
            type: 'MOVE_STORAGE',
            storage,
            toKind,
            positionIndex,
            cabinetLocationId: cabinetLocation.id,
            deskLocationId: deskLocation.id,
        });
    }, [cabinetLocation.id, deskLocation.id]);

    /**
     * 新規ストレージを指定位置へ追加する。
     */
    const addStorage = useCallback((kind: SlotKind, index: number, name: string, location?: Location) => {
        const targetLocation = location ?? (kind === 'cabinet' ? cabinetLocation : deskLocation);

        const newStorage: UiStorage = {
            id: null!,
            name,
            positionIndex: index,
            locationId: targetLocation?.id,
        };

        storageDispatch({
            type: 'UPSERT_STORAGE',
            storage: newStorage,
            kind,
        });
    }, [cabinetLocation, deskLocation]);

    /**
     * パネルからの保存で新規登録・更新・移動を処理する。
     */
    const handleSaveStorage = useCallback(async (locationId: string, name: string, kind: SlotKind, positionIndex: number, useableFreeSpace: number) => {
        if (!selected) return;

        // 更新
        if (selected.storage) {
            const nextStorage = { ...selected.storage, name, positionIndex: positionIndex, useableFreeSpace: useableFreeSpace };
            moveStorage(nextStorage, kind, positionIndex);
            setSelected({ kind, locationId, positionIndex, storage: nextStorage, hasStorage: true });
            applyHighlight(kind, positionIndex);

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
        const savedStorage: UiStorage = { ...newStorage, id: newStorageId };

        addStorage(kind, positionIndex, name, location);
        setSelected({ kind, locationId, positionIndex, storage: savedStorage, hasStorage: true });
        applyHighlight(kind, positionIndex);
    }, [addStorage, applyHighlight, cabinetLocation, deskLocation, moveStorage, onSave, selected, setSelected]);

    const storageContextValue = useMemo(() => ({
        cabinetLocation,
        deskLocation,
        cabinetList,
        deskList,
        cabinetSlots: CABINET_SLOTS,
        deskSlots: DESK_SLOTS,
        handleSaveStorage,
    }), [cabinetList, cabinetLocation, deskList, deskLocation, handleSaveStorage]);

    return (
        <NorthRoomStorageContextProvider value={storageContextValue}>
            {children}
        </NorthRoomStorageContextProvider>
    );
};

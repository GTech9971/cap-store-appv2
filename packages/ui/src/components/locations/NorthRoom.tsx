import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { useCallback, useMemo, useReducer, type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { StorageControlPanel } from './StorageControlPanel'
import type { Selected, SlotKind, UiStorage } from './types'
import {
    NorthRoomHighlightContextProvider,
    NorthRoomStorageContextProvider,
} from './NorthRoomContext'
import './NorthRoom.css'

const CABINET_SLOTS = 5;
const DESK_SLOTS = 2;

type StorageState = {
    cabinetList: UiStorage[];
    deskList: UiStorage[];
};

type StorageAction =
    | { type: 'MOVE_STORAGE'; storage: UiStorage; toKind: SlotKind; positionIndex: number; cabinetLocationId?: string; deskLocationId?: string }
    | { type: 'UPSERT_STORAGE'; storage: UiStorage; kind: SlotKind };

type HighlightState = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: Selected | null;
};

type HighlightAction =
    | { type: 'HIGHLIGHT_SLOT'; kind: SlotKind; index: number | null }
    | { type: 'CLEAR_HIGHLIGHT' }
    | { type: 'SET_SELECTED'; selected: Selected | null }
    | { type: 'CLEAR_ALL' };

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

/**
 * highlightReducerは選択状態とハイライトを一元管理するためのReducer。
 */
const highlightReducer = (state: HighlightState, action: HighlightAction): HighlightState => {
    switch (action.type) {
        case 'HIGHLIGHT_SLOT': {
            return {
                ...state,
                cabinetHighlight: action.kind === 'cabinet' ? action.index : null,
                deskHighlight: action.kind === 'desk' ? action.index : null,
            };
        }

        case 'CLEAR_HIGHLIGHT': {
            return { ...state, cabinetHighlight: null, deskHighlight: null };
        }

        case 'SET_SELECTED': {
            return { ...state, selected: action.selected };
        }

        case 'CLEAR_ALL': {
            return { cabinetHighlight: null, deskHighlight: null, selected: null };
        }

        default:
            return state;
    }
};

/**
 * NorthRoom コンポーネント仕様
 * - ロケーションとストレージ配列を受け取り、Cabinet/Deskを描画
 * - onSaveでストレージの新規登録と更新を親へ通知
 * - スロットクリックで選択を更新し、フォームから保存すると移動や名称変更を反映
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
    const [storageState, storageDispatch] = useReducer(storageReducer, {
        cabinetList: cabinetLocation.storages ?? [],
        deskList: deskLocation.storages ?? [],
    });

    const [highlightState, highlightDispatch] = useReducer(highlightReducer, {
        cabinetHighlight: null,
        deskHighlight: null,
        selected: null,
    });

    const { cabinetList, deskList } = storageState;
    const { cabinetHighlight, deskHighlight, selected } = highlightState;

    /**
     * 指定したスロットのハイライト状態を変更する。ハイライトだけを外部から更新したいケース用。
     */
    const applyHighlight = useCallback((kind: SlotKind, index: number | null) => {
        highlightDispatch({ type: 'HIGHLIGHT_SLOT', kind, index });
    }, []);

    /**
     * 選択情報をクリアし、ハイライトも初期化する。
     */
    const handleClearSelection = useCallback(() => {
        highlightDispatch({ type: 'CLEAR_ALL' });
    }, []);

    /**
     * スロット選択時の処理。空きスロットはトグル、選択状態を更新する。
     */
    const handleSlotAction = useCallback((kind: SlotKind, locationId: string, index: number, slotStorages: Storage[]) => {
        const isSameEmpty =
            selected &&
            selected.kind === kind &&
            selected.storage == null &&
            selected.positionIndex === index;

        if (isSameEmpty) {
            handleClearSelection();
            return;
        }

        applyHighlight(kind, index);
        highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId, positionIndex: index, storage: null, hasStorage: slotStorages.length > 0 } });
    }, [applyHighlight, handleClearSelection, selected]);

    /**
     * ラベルクリック時に既存ストレージを選択状態として設定する。
     */
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
            handleClearSelection();
            return;
        }

        highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId: locationId, storage, positionIndex: storage.positionIndex ?? 1, hasStorage: true } });
        applyHighlight(kind, storage.positionIndex ?? 1);
    }, [applyHighlight, handleClearSelection, selected]);

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
            highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId, positionIndex, storage: nextStorage, hasStorage: true } });
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
        highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId, positionIndex, storage: savedStorage, hasStorage: true } });
        applyHighlight(kind, positionIndex);
    }, [addStorage, applyHighlight, cabinetLocation, deskLocation, moveStorage, onSave, selected]);

    const storageContextValue = useMemo(() => ({
        cabinetLocation,
        deskLocation,
        cabinetList,
        deskList,
        cabinetSlots: CABINET_SLOTS,
        deskSlots: DESK_SLOTS,
        handleSaveStorage,
    }), [cabinetList, cabinetLocation, deskList, deskLocation, handleSaveStorage]);

    const highlightContextValue = useMemo(() => ({
        cabinetHighlight,
        deskHighlight,
        selected,
        handleSlotAction,
        handleSelectStorage,
        handleClearSelection,
        applyHighlight,
    }), [applyHighlight, cabinetHighlight, deskHighlight, handleClearSelection, handleSelectStorage, handleSlotAction, selected]);

    return (
        <NorthRoomStorageContextProvider value={storageContextValue}>
            <NorthRoomHighlightContextProvider value={highlightContextValue}>
                <div className="app">
                    <StorageControlPanel />
                    <Canvas
                        className="canvas-container"
                        camera={{ fov: 60, position: [6, 4, 12] }}
                        dpr={[1, 2]}
                    >
                        <color attach="background" args={['#111111']} />
                        <ambientLight intensity={0.2} />
                        <directionalLight position={[5, 10, 7]} intensity={1} />
                        <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
                        <Desk />
                        <Cabinet />
                    </Canvas>
                </div>
            </NorthRoomHighlightContextProvider>
        </NorthRoomStorageContextProvider>
    )
}

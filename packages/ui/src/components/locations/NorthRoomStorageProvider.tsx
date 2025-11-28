import type { Location, Storage } from 'cap-store-api-def'
import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type FC, type ReactNode } from 'react'
import type { HighlightAction, HighlightSelection } from './NorthRoomHighlightProvider'
import { useNorthRoomHighlightContext } from './NorthRoomHighlightProvider'
import type { SlotKind, UiStorage } from './types'

const CABINET_SLOTS = 5;
const DESK_SLOTS = 2;

type SaveRequestPayload = {
    name: string;
    kind: SlotKind;
    positionIndex: number;
    useableFreeSpace: number;
    selected: HighlightSelection | null;
    cabinetLocation: Location;
    deskLocation: Location;
};

export type NorthRoomStorageContextValue = {
    cabinetLocation: Location;
    deskLocation: Location;
    cabinetList: UiStorage[];
    deskList: UiStorage[];
    cabinetSlots: number;
    deskSlots: number;
    dispatchStorage: Dispatch<StorageAction>;
};

const NorthRoomStorageContext = createContext<NorthRoomStorageContextValue | undefined>(undefined);

type StorageAction =
    | { type: 'SAVE_REQUEST'; payload: SaveRequestPayload }
    | { type: 'APPLY_NEW_ID'; target: UiStorage; storageId: string }
    | { type: 'CLEAR_PENDING_PERSIST' }
    | { type: 'CONSUME_PENDING_HIGHLIGHT' };

type PersistState = { mode: 'new' | 'update'; storage: Storage } | null;

type StorageState = {
    cabinetList: UiStorage[];
    deskList: UiStorage[];
    pendingPersist: PersistState;
    pendingHighlight: HighlightAction | null;
};

/**
 * storageReducerはNorthRoomのストレージ配列と永続化・ハイライト要求をまとめて扱うReducer。
 * 保存リクエストを受けて整合の取れたリストを生成し、副作用のトリガーも状態として保持する。
 */
const storageReducer = (state: StorageState, action: StorageAction): StorageState => {
    switch (action.type) {
        case 'SAVE_REQUEST': {
            const { name, kind, positionIndex, useableFreeSpace, selected, cabinetLocation, deskLocation } = action.payload;

            if (!selected) return state;

            const targetLocation = kind === 'cabinet' ? cabinetLocation : deskLocation;
            const removeFromList = (list: UiStorage[], target: UiStorage) => list.filter((s) => (target.id ? s.id !== target.id : s !== target));
            const upsertToList = (list: UiStorage[], storage: UiStorage) => {
                const targetIdx = storage.positionIndex ?? 1;
                const withoutTarget = list.filter((s) => (storage.id ? s.id !== storage.id : s !== storage) && s.positionIndex !== targetIdx);
                return [...withoutTarget, storage];
            };

            // 既存ストレージの更新・移動
            if (selected.type === 'storage') {
                const updatedStorage: UiStorage = {
                    ...selected.storage,
                    name,
                    positionIndex,
                    useableFreeSpace,
                    locationId: targetLocation.id,
                };

                const nextCabinet = kind === 'cabinet'
                    ? upsertToList(state.cabinetList, updatedStorage)
                    : removeFromList(state.cabinetList, updatedStorage);

                const nextDesk = kind === 'desk'
                    ? upsertToList(state.deskList, updatedStorage)
                    : removeFromList(state.deskList, updatedStorage);

                return {
                    ...state,
                    cabinetList: nextCabinet,
                    deskList: nextDesk,
                    pendingPersist: { mode: 'update', storage: updatedStorage },
                    pendingHighlight: { type: 'LABEL_SELECTED', kind, locationId: targetLocation.id, storage: updatedStorage },
                };
            }

            // 既存データがある場合は無視
            if (selected.occupied) {
                return state;
            }

            // 新規登録
            const newStorage: UiStorage = {
                id: null!,
                name,
                positionIndex,
                locationId: targetLocation.id,
                useableFreeSpace,
            };

            const nextCabinet = kind === 'cabinet'
                ? upsertToList(state.cabinetList, newStorage)
                : state.cabinetList;

            const nextDesk = kind === 'desk'
                ? upsertToList(state.deskList, newStorage)
                : state.deskList;

            return {
                ...state,
                cabinetList: nextCabinet,
                deskList: nextDesk,
                pendingPersist: { mode: 'new', storage: newStorage },
                pendingHighlight: { type: 'LABEL_SELECTED', kind, locationId: targetLocation.id, storage: newStorage },
            };
        }

        case 'APPLY_NEW_ID': {
            const applyId = (list: UiStorage[]) => list.map((storage) => (storage === action.target ? { ...storage, id: action.storageId } : storage));
            const updatedStorage = { ...action.target, id: action.storageId };
            const isCabinetTarget = state.cabinetList.includes(action.target);
            const fallbackKind: SlotKind = isCabinetTarget ? 'cabinet' : 'desk';
            const updatedHighlight = state.pendingHighlight?.type === 'LABEL_SELECTED'
                ? { ...state.pendingHighlight, storage: updatedStorage }
                : null;

            return {
                ...state,
                cabinetList: applyId(state.cabinetList),
                deskList: applyId(state.deskList),
                pendingPersist: null,
                pendingHighlight: updatedHighlight
                    ?? { type: 'LABEL_SELECTED', kind: fallbackKind, locationId: updatedStorage.locationId ?? '', storage: updatedStorage },
            };
        }

        case 'CLEAR_PENDING_PERSIST': {
            return { ...state, pendingPersist: null };
        }

        case 'CONSUME_PENDING_HIGHLIGHT': {
            return { ...state, pendingHighlight: null };
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
        pendingPersist: null,
        pendingHighlight: null,
    });

    const { dispatchHighlight } = useNorthRoomHighlightContext();

    const { cabinetList, deskList, pendingPersist, pendingHighlight } = storageState;

    /**
     * pendingHighlightをHighlightProviderへ流す副作用ハンドラー。
     */
    useEffect(() => {
        if (!pendingHighlight) return;
        dispatchHighlight(pendingHighlight);
        storageDispatch({ type: 'CONSUME_PENDING_HIGHLIGHT' });
    }, [dispatchHighlight, pendingHighlight, storageDispatch]);

    /**
     * pendingPersistがある場合にAPI保存を実行し、ID更新や待ち状態の解消を行う副作用ハンドラー。
     */
    useEffect(() => {
        if (!pendingPersist) return;

        const persist = async () => {
            const { mode, storage } = pendingPersist;
            if (mode === 'new') {
                const newId = await onSave('new', storage);
                storageDispatch({ type: 'APPLY_NEW_ID', target: storage as UiStorage, storageId: newId });
                return;
            }

            await onSave('update', storage);
            storageDispatch({ type: 'CLEAR_PENDING_PERSIST' });
        };

        void persist();
    }, [onSave, pendingPersist, storageDispatch]);

    const storageContextValue = useMemo(() => ({
        cabinetLocation,
        deskLocation,
        cabinetList,
        deskList,
        cabinetSlots: CABINET_SLOTS,
        deskSlots: DESK_SLOTS,
        dispatchStorage: storageDispatch,
    }), [cabinetList, cabinetLocation, deskList, deskLocation, storageDispatch]);

    return (
        <NorthRoomStorageContext.Provider value={storageContextValue}>
            {children}
        </NorthRoomStorageContext.Provider>
    );
};

/**
 * useNorthRoomStorageContextはNorthRoom配下でストレージデータと保存操作を扱うカスタムフック。
 * Provider外で呼び出した場合は例外を投げる。
 */
export const useNorthRoomStorageContext = (): NorthRoomStorageContextValue => {
    const context = useContext(NorthRoomStorageContext);
    if (!context) {
        throw new Error('useNorthRoomStorageContext must be used within NorthRoom storage provider');
    }

    return context;
};

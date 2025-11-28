import type { Location, Storage } from 'cap-store-api-def'
import { createContext, useContext, type Dispatch } from 'react'
import type { Selected, SlotKind, UiStorage } from './types'

export type HighlightAction =
    | { type: 'HIGHLIGHT_SLOT'; kind: SlotKind; index: number | null }
    | { type: 'CLEAR_HIGHLIGHT' }
    | { type: 'SET_SELECTED'; selected: Selected | null }
    | { type: 'CLEAR_ALL' };

export type NorthRoomHighlightContextValue = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: Selected | null;
    handleSlotAction: (kind: SlotKind, locationId: string, index: number, slotStorages: Storage[]) => void;
    handleSelectStorage: (kind: SlotKind, locationId: string, storage: Storage) => void;
    dispatchHighlight: Dispatch<HighlightAction>;
};

export type NorthRoomStorageContextValue = {
    cabinetLocation: Location;
    deskLocation: Location;
    cabinetList: UiStorage[];
    deskList: UiStorage[];
    cabinetSlots: number;
    deskSlots: number;
    handleSaveStorage: (locationId: string, name: string, kind: SlotKind, positionIndex: number, useableFreeSpace: number) => void;
};

const NorthRoomHighlightContext = createContext<NorthRoomHighlightContextValue | undefined>(undefined);
const NorthRoomStorageContext = createContext<NorthRoomStorageContextValue | undefined>(undefined);

/**
 * useNorthRoomHighlightContextはNorthRoom配下でハイライト・選択状態を扱うカスタムフック。
 * Provider外で呼び出した場合は例外を投げる。
 */
export const useNorthRoomHighlightContext = (): NorthRoomHighlightContextValue => {
    const context = useContext(NorthRoomHighlightContext);
    if (!context) {
        throw new Error('useNorthRoomHighlightContext must be used within NorthRoom highlight provider');
    }

    return context;
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

export const NorthRoomHighlightContextProvider = NorthRoomHighlightContext.Provider;
export const NorthRoomStorageContextProvider = NorthRoomStorageContext.Provider;

import { createContext, useContext, useMemo, useReducer, type Dispatch, type FC, type ReactNode } from 'react'
import type { Storage } from 'cap-store-api-def'
import type { SlotKind } from './types'

export type SelectedSlot = {
    kind: SlotKind;
    locationId: string;
    positionIndex: number;
    storage: Storage | null;
    hasStorage: boolean;
};

export type HighlightAction =
    | { type: 'SLOT_SELECTED'; kind: SlotKind; locationId: string; positionIndex: number; slotStorages: Storage[] }
    | { type: 'LABEL_SELECTED'; kind: SlotKind; locationId: string; storage: Storage }
    | { type: 'APPLY_SELECTION'; selected: SelectedSlot | null }
    | { type: 'CLEAR_ALL' };

export type NorthRoomHighlightContextValue = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: SelectedSlot | null;
    dispatchHighlight: Dispatch<HighlightAction>;
};

const NorthRoomHighlightContext = createContext<NorthRoomHighlightContextValue | undefined>(undefined);

type HighlightState = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: SelectedSlot | null;
};

/**
 * highlightReducerは選択状態とハイライトを一元管理するためのReducer。
 */
const highlightReducer = (state: HighlightState, action: HighlightAction): HighlightState => {
    switch (action.type) {
        case 'SLOT_SELECTED': {
            const isSameEmpty = state.selected?.kind === action.kind
                && state.selected.storage == null
                && state.selected.positionIndex === action.positionIndex;

            if (isSameEmpty) {
                return { cabinetHighlight: null, deskHighlight: null, selected: null };
            }

            const hasStorage = action.slotStorages.length > 0;

            return {
                cabinetHighlight: action.kind === 'cabinet' ? action.positionIndex : null,
                deskHighlight: action.kind === 'desk' ? action.positionIndex : null,
                selected: { kind: action.kind, locationId: action.locationId, positionIndex: action.positionIndex, storage: null, hasStorage },
            };
        }

        case 'LABEL_SELECTED': {
            const currentStorage = state.selected?.storage;
            const isSame = currentStorage != null
                && state.selected?.kind === action.kind
                && ((currentStorage.id && currentStorage.id === action.storage.id)
                    || (!currentStorage.id
                        && !action.storage.id
                        && currentStorage.positionIndex === action.storage.positionIndex
                        && currentStorage.name === action.storage.name));

            if (isSame) {
                return { cabinetHighlight: null, deskHighlight: null, selected: null };
            }

            const index = action.storage.positionIndex ?? 1;

            return {
                cabinetHighlight: action.kind === 'cabinet' ? index : null,
                deskHighlight: action.kind === 'desk' ? index : null,
                selected: { kind: action.kind, locationId: action.locationId, positionIndex: index, storage: action.storage, hasStorage: true },
            };
        }

        case 'APPLY_SELECTION': {
            if (!action.selected) {
                return { cabinetHighlight: null, deskHighlight: null, selected: null };
            }

            const isCabinet = action.selected.kind === 'cabinet';
            const index = action.selected.positionIndex ?? action.selected.storage?.positionIndex ?? null;

            return {
                cabinetHighlight: isCabinet ? index : null,
                deskHighlight: !isCabinet ? index : null,
                selected: action.selected,
            };
        }

        case 'CLEAR_ALL': {
            return { cabinetHighlight: null, deskHighlight: null, selected: null };
        }

        default:
            return state;
    }
};

type Props = {
    children: ReactNode;
};

/**
 * NorthRoomHighlightProviderはハイライトと選択状態を保持して子ツリーへ配布するProvider。
 */
export const NorthRoomHighlightProvider: FC<Props> = ({ children }) => {
    const [highlightState, highlightDispatch] = useReducer(highlightReducer, {
        cabinetHighlight: null,
        deskHighlight: null,
        selected: null,
    });

    const { cabinetHighlight, deskHighlight, selected } = highlightState;

    const highlightContextValue = useMemo(() => ({
        cabinetHighlight,
        deskHighlight,
        selected,
        dispatchHighlight: highlightDispatch,
    }), [cabinetHighlight, deskHighlight, highlightDispatch, selected]);

    return (
        <NorthRoomHighlightContext.Provider value={highlightContextValue}>
            {children}
        </NorthRoomHighlightContext.Provider>
    );
};

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

import { createContext, useContext, useMemo, useReducer, type Dispatch, type FC, type ReactNode } from 'react'
import type { Storage } from 'cap-store-api-def'
import type { SlotKind } from './types'

/**
 * HighlightSelectionはNorthRoom内で選択している対象を明示的に表すための型。
 * - empty-slot: 空き枠（既存ストレージがあるかどうかはexistingStoragesで判定）
 * - storage: 既存ストレージを直接指定
 */
export type HighlightSelection =
    | { type: 'empty-slot'; kind: SlotKind; locationId: string; positionIndex: number; existingStorages: Storage[] }
    | { type: 'storage'; kind: SlotKind; locationId: string; positionIndex: number; storage: Storage };

export type HighlightAction =
    | { type: 'SLOT_SELECTED'; kind: SlotKind; locationId: string; positionIndex: number; slotStorages: Storage[] }
    | { type: 'LABEL_SELECTED'; kind: SlotKind; locationId: string; storage: Storage }
    | { type: 'APPLY_SELECTION'; selected: HighlightSelection | null }
    | { type: 'CLEAR_ALL' };

export type NorthRoomHighlightContextValue = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: HighlightSelection | null;
    dispatchHighlight: Dispatch<HighlightAction>;
};

const NorthRoomHighlightContext = createContext<NorthRoomHighlightContextValue | undefined>(undefined);

type HighlightState = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: HighlightSelection | null;
};

/**
 * highlightReducerは選択状態とハイライトを一元管理するためのReducer。
 */
const highlightReducer = (state: HighlightState, action: HighlightAction): HighlightState => {
    switch (action.type) {
        case 'SLOT_SELECTED': {
            const isSameEmpty = state.selected?.type === 'empty-slot'
                && state.selected.kind === action.kind
                && state.selected.positionIndex === action.positionIndex;

            if (isSameEmpty) {
                return { cabinetHighlight: null, deskHighlight: null, selected: null };
            }

            return {
                cabinetHighlight: action.kind === 'cabinet' ? action.positionIndex : null,
                deskHighlight: action.kind === 'desk' ? action.positionIndex : null,
                selected: {
                    type: 'empty-slot',
                    kind: action.kind,
                    locationId: action.locationId,
                    positionIndex: action.positionIndex,
                    existingStorages: action.slotStorages,
                },
            };
        }

        case 'LABEL_SELECTED': {
            const currentStorage = state.selected?.type === 'storage' ? state.selected.storage : null;
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
                selected: {
                    type: 'storage',
                    kind: action.kind,
                    locationId: action.locationId,
                    positionIndex: index,
                    storage: action.storage,
                },
            };
        }

        case 'APPLY_SELECTION': {
            if (!action.selected) {
                return { cabinetHighlight: null, deskHighlight: null, selected: null };
            }

            const isCabinet = action.selected.kind === 'cabinet';
            const index = action.selected.positionIndex ?? (action.selected.type === 'storage' ? action.selected.storage.positionIndex : null);

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

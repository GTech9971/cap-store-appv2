import { useCallback, useMemo, useReducer, type FC, type ReactNode } from 'react'
import type { Storage } from 'cap-store-api-def'
import type { Selected, SlotKind } from './types'
import { NorthRoomHighlightContextProvider, type HighlightAction } from './NorthRoomContext'

type HighlightState = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: Selected | null;
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
            highlightDispatch({ type: 'CLEAR_ALL' });
            return;
        }

        highlightDispatch({ type: 'HIGHLIGHT_SLOT', kind, index });
        highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId, positionIndex: index, storage: null, hasStorage: slotStorages.length > 0 } });
    }, [selected]);

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
            highlightDispatch({ type: 'CLEAR_ALL' });
            return;
        }

        highlightDispatch({ type: 'SET_SELECTED', selected: { kind, locationId: locationId, storage, positionIndex: storage.positionIndex ?? 1, hasStorage: true } });
        highlightDispatch({ type: 'HIGHLIGHT_SLOT', kind, index: storage.positionIndex ?? 1 });
    }, [selected]);

    const highlightContextValue = useMemo(() => ({
        cabinetHighlight,
        deskHighlight,
        selected,
        handleSlotAction,
        handleSelectStorage,
        dispatchHighlight: highlightDispatch,
    }), [cabinetHighlight, deskHighlight, handleSelectStorage, handleSlotAction, highlightDispatch, selected]);

    return (
        <NorthRoomHighlightContextProvider value={highlightContextValue}>
            {children}
        </NorthRoomHighlightContextProvider>
    );
};

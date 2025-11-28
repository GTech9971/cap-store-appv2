import { useCallback, useMemo, useReducer, type FC, type ReactNode } from 'react'
import type { Storage } from 'cap-store-api-def'
import type { Selected, SlotKind } from './types'
import { NorthRoomHighlightContextProvider } from './NorthRoomContext'

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
     * Provider外から任意の選択状態を設定するためのAPI。
     */
    const setSelected = useCallback((nextSelected: Selected | null) => {
        highlightDispatch({ type: 'SET_SELECTED', selected: nextSelected });
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

    const highlightContextValue = useMemo(() => ({
        cabinetHighlight,
        deskHighlight,
        selected,
        handleSlotAction,
        handleSelectStorage,
        handleClearSelection,
        applyHighlight,
        setSelected,
    }), [applyHighlight, cabinetHighlight, deskHighlight, handleClearSelection, handleSelectStorage, handleSlotAction, selected, setSelected]);

    return (
        <NorthRoomHighlightContextProvider value={highlightContextValue}>
            {children}
        </NorthRoomHighlightContextProvider>
    );
};

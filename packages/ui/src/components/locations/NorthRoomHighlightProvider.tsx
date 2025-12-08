import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type FC, type ReactNode } from 'react'
import type { Storage, Location } from 'cap-store-api-def'
import type { SlotKind } from './types'

/**
 * HighlightSelectionはNorthRoom内で選択している対象を明示的に表すための型。
 * - empty-slot: 空き枠（occupiedで既存ストレージの有無を判定）
 * - storage: 既存ストレージを直接指定
 */
export type HighlightSelection =
    | { type: 'empty-slot'; kind: SlotKind; locationId: string; positionIndex: number; occupied: boolean }
    | { type: 'storage'; kind: SlotKind; locationId: string; positionIndex: number; storage: Storage };


/////////アクション定義/////////

/**
 * スロット選択時
 */
type HighlightActionSlotSelected = {
    type: 'SLOT_SELECTED',
    kind: SlotKind,
    locationId: string,
    positionIndex: number,
    /** 既存ストレージの有無 */
    occupied: boolean
}

/**
 * ラベル選択時
 */
type HighlightActionLabelSelected = {
    type: 'LABEL_SELECTED',
    kind: SlotKind,
    locationId: string,
    /** ラベルに表示されているストレージの内容 */
    storage: Storage
};


/** 選択状態をクリアするハンドラー。ハイライトと選択をリセットする。 */
type HighlightClearAllAction = { type: 'CLEAR_ALL', }


/**
 * CLEAR_ALL: 選択状態をクリアするハンドラー。ハイライトと選択をリセットする。
 */
export type HighlightAction =
    | HighlightActionSlotSelected
    | HighlightActionLabelSelected
    | HighlightClearAllAction;

/////////アクション定義/////////

export type NorthRoomHighlightContextValue = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: HighlightSelection | null;
    dispatchHighlight: Dispatch<HighlightAction>;
};

const NorthRoomHighlightContext = createContext<NorthRoomHighlightContextValue | undefined>(undefined);

export type HighlightState = {
    cabinetHighlight: number | null;
    deskHighlight: number | null;
    selected: HighlightSelection | null;
};

/**
 * highlightReducerは選択状態とハイライトを一元管理するためのReducer。
 */
export const highlightReducer = (state: HighlightState, action: HighlightAction): HighlightState => {
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
                    occupied: action.occupied,
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


        case 'CLEAR_ALL': {
            return { cabinetHighlight: null, deskHighlight: null, selected: null };
        }

        default:
            return state;
    }
};

/**
 * defaultSelectedが指定された場合の初期ハイライト状態を構築するヘルパー。
 */
export const createInitialHighlightState = (
    defaultSelected: Storage | undefined,
    cabinetLocationId: string,
    deskLocationId: string
): HighlightState => {
    if (!defaultSelected) {
        return { cabinetHighlight: null, deskHighlight: null, selected: null };
    }

    if (!defaultSelected.locationId) {
        return { cabinetHighlight: null, deskHighlight: null, selected: null };
    }

    if (!defaultSelected.positionIndex) {
        return { cabinetHighlight: null, deskHighlight: null, selected: null };
    }

    const kind: SlotKind | null = defaultSelected.locationId === cabinetLocationId
        ? 'cabinet'
        : defaultSelected.locationId === deskLocationId
            ? 'desk'
            : null;

    if (!kind) {
        return { cabinetHighlight: null, deskHighlight: null, selected: null };
    }

    const cabinetHighlight = kind === 'cabinet' ? defaultSelected.positionIndex : null;
    const deskHighlight = kind === 'desk' ? defaultSelected.positionIndex : null;

    return {
        cabinetHighlight,
        deskHighlight,
        selected: {
            type: 'storage',
            kind,
            locationId: defaultSelected.locationId,
            positionIndex: defaultSelected.positionIndex,
            storage: defaultSelected
        }
    };
};

type Props = {
    cabinetLocation: Location;
    deskLocation: Location;
    defaultSelected?: Storage;
    onSelected?: (selected: Storage, selectedLocation: Location) => void,
    children: ReactNode;
};

/**
 * NorthRoomHighlightProviderはハイライトと選択状態を保持して子ツリーへ配布するProvider。
 */
export const NorthRoomHighlightProvider: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    defaultSelected,
    onSelected,
    children,
}) => {

    /** defaultSelectedから初期ハイライト状態を導出する */
    const initialHighlightState: HighlightState = useMemo(() =>
        createInitialHighlightState(defaultSelected, cabinetLocation.id, deskLocation.id),
        [defaultSelected, cabinetLocation.id, deskLocation.id]);

    const [highlightState, highlightDispatch] = useReducer(highlightReducer, initialHighlightState);

    const { cabinetHighlight, deskHighlight, selected } = highlightState;

    const highlightContextValue = useMemo(() => ({
        cabinetHighlight,
        deskHighlight,
        selected,
        dispatchHighlight: highlightDispatch,
    }), [cabinetHighlight, deskHighlight, highlightDispatch, selected]);

    /** ストレージを選択時に親イベントに渡す */
    useEffect(() => {
        if (!selected) { return; }
        if (!onSelected) { return; }
        if (selected.type === 'empty-slot') { return; }

        onSelected(selected.storage,
            selected.storage.locationId === deskLocation.id
                ? deskLocation
                : cabinetLocation);
    }, [selected, onSelected, cabinetLocation, deskLocation]);

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

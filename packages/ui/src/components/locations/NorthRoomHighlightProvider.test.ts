import type { Storage } from 'cap-store-api-def';
import { describe, expect, it } from 'vitest';
import { createInitialHighlightState, highlightReducer, type HighlightAction } from './NorthRoomHighlightProvider';

type HighlightState = Parameters<typeof highlightReducer>[0];

/** テスト用に空のハイライト状態を生成するヘルパー。 */
const createEmptyState = (): HighlightState => ({
  cabinetHighlight: null,
  deskHighlight: null,
  selected: null,
});

describe('createInitialHighlightState', () => {
  it('defaultSelectedがキャビネットの場合にハイライトと選択を初期化する', () => {
    const defaultStorage: Storage = {
      id: 'storage-1',
      name: 'キャビネット用',
      locationId: 'cabinet-1',
      positionIndex: 4,
    };

    const initialState = createInitialHighlightState(defaultStorage, 'cabinet-1', 'desk-1');

    expect(initialState.cabinetHighlight).toBe(4);
    expect(initialState.deskHighlight).toBeNull();
    expect(initialState.selected).toEqual({
      type: 'storage',
      kind: 'cabinet',
      locationId: 'cabinet-1',
      positionIndex: 4,
      storage: defaultStorage,
    });
  });

  it('defaultSelectedが不完全な場合は全てnullで初期化する', () => {
    const incomplete: Storage = { id: 'incomplete', name: '不完全なストレージ' };

    const initialState = createInitialHighlightState(incomplete, 'cabinet-1', 'desk-1');

    expect(initialState).toEqual(createEmptyState());
  });
});

describe('highlightReducer', () => {
  it('空き枠の選択で対象スロットのみハイライトし、同じ枠を再選択すると解除する', () => {
    const action: HighlightAction = {
      type: 'SLOT_SELECTED',
      kind: 'cabinet',
      locationId: 'cabinet-1',
      positionIndex: 2,
      occupied: false,
    };

    const selectedState = highlightReducer(createEmptyState(), action);
    expect(selectedState.cabinetHighlight).toBe(2);
    expect(selectedState.deskHighlight).toBeNull();
    expect(selectedState.selected).toEqual({
      type: 'empty-slot',
      kind: 'cabinet',
      locationId: 'cabinet-1',
      positionIndex: 2,
      occupied: false,
    });

    const clearedState = highlightReducer(selectedState, action);
    expect(clearedState).toEqual(createEmptyState());
  });

  it('ストレージのラベル選択でハイライトを更新し、同じストレージなら解除する', () => {
    const storage: Storage = {
      id: 'desk-1',
      name: 'テスト用ストレージ',
      locationId: 'desk-1',
      positionIndex: 1,
    };

    const action: HighlightAction = {
      type: 'LABEL_SELECTED',
      kind: 'desk',
      locationId: 'desk-1',
      storage,
    };

    const selectedState = highlightReducer(createEmptyState(), action);
    expect(selectedState.deskHighlight).toBe(1);
    expect(selectedState.cabinetHighlight).toBeNull();
    expect(selectedState.selected).toEqual({
      type: 'storage',
      kind: 'desk',
      locationId: 'desk-1',
      positionIndex: 1,
      storage,
    });

    const clearedState = highlightReducer(selectedState, action);
    expect(clearedState).toEqual(createEmptyState());
  });

  it('ID無しかつpositionIndex未指定のストレージでも位置1でハイライトし、同一判定で解除できる', () => {
    const storageWithoutId: Storage = {
      id: '',
      name: '新規ストレージ',
      locationId: 'cabinet-2',
    };

    const action: HighlightAction = {
      type: 'LABEL_SELECTED',
      kind: 'cabinet',
      locationId: 'cabinet-2',
      storage: storageWithoutId,
    };

    const selectedState = highlightReducer(createEmptyState(), action);
    expect(selectedState.cabinetHighlight).toBe(1);
    expect(selectedState.selected?.positionIndex).toBe(1);
    expect(selectedState.selected?.type).toBe('storage');

    const clearedState = highlightReducer(selectedState, action);
    expect(clearedState).toEqual(createEmptyState());
  });

  it('CLEAR_ALLで全てのハイライトと選択を解除する', () => {
    const populatedState: HighlightState = {
      cabinetHighlight: 3,
      deskHighlight: 1,
      selected: {
        type: 'empty-slot',
        kind: 'desk',
        locationId: 'desk-1',
        positionIndex: 1,
        occupied: true,
      },
    };

    const clearedState = highlightReducer(populatedState, { type: 'CLEAR_ALL' });

    expect(clearedState).toEqual(createEmptyState());
  });
});

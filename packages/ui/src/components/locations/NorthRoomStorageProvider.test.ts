import type { Location } from 'cap-store-api-def';
import { describe, expect, it } from 'vitest';
import { storageReducer, type StorageActionSaveRequest, type StorageState } from './NorthRoomStorageProvider';
import type { UiStorage } from './types';

const cabinetLocation: Location = { id: 'loc-cabinet', name: 'Cabinet' };
const deskLocation: Location = { id: 'loc-desk', name: 'Desk' };

/** テスト用の初期Stateを簡潔に組み立てるヘルパー。 */
const createState = (override?: Partial<StorageState>): StorageState => ({
  cabinetList: [],
  deskList: [],
  pendingPersist: null,
  pendingHighlight: null,
  ...override,
});

describe('storageReducer', () => {
  it('既存ストレージを更新するとリスト・ペンディング状態を同期する', () => {
    const cabinetStorage: UiStorage = {
      id: 'cab-1',
      name: '抵抗A',
      positionIndex: 1,
      locationId: cabinetLocation.id,
      useableFreeSpace: 10,
    };

    const initialState = createState({ cabinetList: [cabinetStorage] });

    const action: StorageActionSaveRequest = {
      type: 'SAVE_REQUEST',
      payload: {
        name: '抵抗B',
        kind: 'cabinet',
        positionIndex: 2,
        useableFreeSpace: 5,
        selected: {
          type: 'storage',
          kind: 'cabinet',
          locationId: cabinetLocation.id,
          positionIndex: 1,
          storage: cabinetStorage,
        },
        cabinetLocation,
        deskLocation,
      },
    };

    const nextState: StorageState = storageReducer(initialState, action);

    expect(nextState.cabinetList).toHaveLength(1);
    const updatedStorage = nextState.cabinetList[0];
    expect(updatedStorage.name).toBe('抵抗B');
    expect(updatedStorage.positionIndex).toBe(2);
    expect(updatedStorage.locationId).toBe(cabinetLocation.id);
    expect(nextState.deskList).toHaveLength(0);
    expect(nextState.pendingPersist?.mode).toBe('update');
    expect(nextState.pendingPersist?.storage).toBe(updatedStorage);
    expect(nextState.pendingHighlight?.type).toBe('LABEL_SELECTED');
    if (nextState.pendingHighlight?.type === 'LABEL_SELECTED') {
      expect(nextState.pendingHighlight.storage).toBe(updatedStorage);
      expect(nextState.pendingHighlight).toEqual({
        type: 'LABEL_SELECTED',
        kind: 'cabinet',
        locationId: cabinetLocation.id,
        storage: updatedStorage,
      });
    }
  });

  it('別の既存ストレージがあるロケーションへ移動しても既存データを保持する', () => {
    const firstStorage: UiStorage = {
      id: 'cab-1',
      name: '抵抗A',
      positionIndex: 1,
      locationId: cabinetLocation.id,
      useableFreeSpace: 10,
    };
    const secondStorage: UiStorage = {
      id: 'cab-2',
      name: 'コンデンサB',
      positionIndex: 2,
      locationId: cabinetLocation.id,
      useableFreeSpace: 7,
    };

    const initialState = createState({
      cabinetList: [firstStorage, secondStorage],
      deskList: [],
    });

    const action: StorageActionSaveRequest = {
      type: 'SAVE_REQUEST',
      payload: {
        name: '抵抗A-移動済み',
        kind: 'cabinet',
        positionIndex: 2,
        useableFreeSpace: 4,
        selected: {
          type: 'storage',
          kind: 'cabinet',
          locationId: cabinetLocation.id,
          positionIndex: 1,
          storage: firstStorage,
        },
        cabinetLocation,
        deskLocation,
      },
    };

    const nextState = storageReducer(initialState, action);

    expect(nextState.cabinetList).toHaveLength(2);
    expect(nextState.deskList).toHaveLength(0);
    const moved = nextState.deskList.find((s) => s.id === firstStorage.id);
    const untouched = nextState.deskList.find((s) => s.id === secondStorage.id);
    expect(moved).toBeDefined();
    expect(moved?.locationId).toBe(deskLocation.id);
    expect(moved?.positionIndex).toBe(2);
    expect(moved?.name).toBe('抵抗A-移動済み');
    expect(untouched).toBeDefined();
    expect(untouched?.name).toBe(secondStorage.name);
    expect(untouched?.positionIndex).toBe(secondStorage.positionIndex);
    expect(untouched?.locationId).toBe(secondStorage.locationId);
  });

  it('空き枠から新規作成するとdeskリストに追加しpendingPersistを設定する', () => {
    const action: StorageActionSaveRequest = {
      type: 'SAVE_REQUEST',
      payload: {
        name: 'コンデンサ',
        kind: 'desk',
        positionIndex: 1,
        useableFreeSpace: 3,
        selected: {
          type: 'empty-slot',
          kind: 'desk',
          locationId: deskLocation.id,
          positionIndex: 1,
          occupied: false,
        },
        cabinetLocation,
        deskLocation,
      },
    };

    const nextState = storageReducer(createState(), action);

    expect(nextState.cabinetList).toHaveLength(0);
    expect(nextState.deskList).toHaveLength(1);
    const newStorage = nextState.deskList[0];
    expect(newStorage.name).toBe('コンデンサ');
    expect(newStorage.positionIndex).toBe(1);
    expect(newStorage.locationId).toBe(deskLocation.id);
    expect(nextState.pendingPersist?.mode).toBe('new');
    expect(nextState.pendingPersist?.storage).toBe(newStorage);
    expect(nextState.pendingHighlight?.type).toBe('LABEL_SELECTED');
    if (nextState.pendingHighlight?.type === 'LABEL_SELECTED') {
      expect(nextState.pendingHighlight.storage).toBe(newStorage);
    }
  });

  it('APPLY_NEW_IDで保存済みIDがリストとpendingHighlightに反映される', () => {
    const pendingStorage: UiStorage = {
      id: null!,
      name: '仮ストレージ',
      positionIndex: 2,
      locationId: deskLocation.id,
      useableFreeSpace: 8,
    };

    const initialState = createState({
      deskList: [pendingStorage],
      pendingPersist: { mode: 'new', storage: pendingStorage },
      pendingHighlight: {
        type: 'LABEL_SELECTED',
        kind: 'desk',
        locationId: deskLocation.id,
        storage: pendingStorage,
      },
    });

    const nextState = storageReducer(initialState, {
      type: 'APPLY_NEW_ID',
      target: pendingStorage,
      storageId: 'generated-id',
    });

    expect(nextState.pendingPersist).toBeNull();
    const updated = nextState.deskList[0];
    expect(updated.id).toBe('generated-id');
    expect(nextState.pendingHighlight?.type).toBe('LABEL_SELECTED');
    if (nextState.pendingHighlight?.type === 'LABEL_SELECTED') {
      expect(nextState.pendingHighlight.storage).toEqual(updated);
      expect(nextState.pendingHighlight).toEqual({
        type: 'LABEL_SELECTED',
        kind: 'desk',
        locationId: deskLocation.id,
        storage: updated,
      });
    }
  });

  it('occupiedな空き枠はそのままstateを返す', () => {
    const initialState = createState({
      cabinetList: [{
        id: 'cab-1',
        name: 'ICケース',
        positionIndex: 1,
        locationId: cabinetLocation.id,
        useableFreeSpace: 6,
      }],
    });

    const action: StorageActionSaveRequest = {
      type: 'SAVE_REQUEST',
      payload: {
        name: '無視される',
        kind: 'cabinet',
        positionIndex: 1,
        useableFreeSpace: 1,
        selected: {
          type: 'empty-slot',
          kind: 'cabinet',
          locationId: cabinetLocation.id,
          positionIndex: 1,
          occupied: true,
        },
        cabinetLocation,
        deskLocation,
      },
    };

    const nextState = storageReducer(initialState, action);
    expect(nextState).toBe(initialState);
  });
});

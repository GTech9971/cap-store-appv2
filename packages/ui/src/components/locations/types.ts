import type { Storage } from 'cap-store-api-def'

// スロットの種類（キャビネット or デスク）
export type SlotKind = 'cabinet' | 'desk'

// 選択しているスロットの内容
export type Selected = {
    kind: SlotKind,
    locationId: string,
    positionIndex: number,
    storage: Storage | null,
    hasStorage: boolean
}

// UI用に拡張しやすいエイリアス（必要なら後から拡張する）
export type UiStorage = Storage

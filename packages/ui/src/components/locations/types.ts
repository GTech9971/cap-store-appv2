import type { Storage } from 'cap-store-api-def'

// スロットの種類（キャビネット or デスク）
export type SlotKind = 'cabinet' | 'desk'

// UI用に拡張しやすいエイリアス（必要なら後から拡張する）
export type UiStorage = Storage

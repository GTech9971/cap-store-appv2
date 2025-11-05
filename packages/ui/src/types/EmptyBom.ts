import type { Bom } from "cap-store-api-def";

/**
 * 最初に表示される未入力のBOM
 */
export const EmptyBom: Bom = {
    id: null!,
    componentId: "",
    quantity: 1,
    footPrintName: undefined,
    remarks: undefined,
    refName: undefined,
    supplier: undefined
}
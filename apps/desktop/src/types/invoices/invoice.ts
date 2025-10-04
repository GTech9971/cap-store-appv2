import { Item } from "./item";

/**
 *
 * 納品書
 */
export type Invoice = {
    /**
     * オーダーID
     *
     */
    order_id: string,
    /**
     *
     * 注文日
     */
    order_date: string,
    /**
     *
     * 出荷日
     */
    shipping_date: string,
    /**
     *
     * 購入品リスト
     */
    items: Item[],
};

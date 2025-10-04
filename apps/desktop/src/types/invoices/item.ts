export type Item = {
    /**
     *
     * カタログID
     */
    catalog_Id: string,
    /**
     *
     * 部品名
     */
    name: string,

    /**
     * 
     * 画像URL(相対パス)
     */
    img_url: string,

    /**
     *
     * 個数
     */
    quantity: number,
    /**
     *
     * 金額(1個あたり)
     */
    unit_price: number,
};

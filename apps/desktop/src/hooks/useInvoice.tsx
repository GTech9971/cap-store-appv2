import { Invoice } from "@/types/invoices/invoice";
import { invoke } from "@tauri-apps/api/core";
import { useCallback } from "react";

/**
 * 納品書の処理
 * @returns 
 */
export const useInvoice = () => {

    /**
     * 納品書を解析(rust)して返す
     * @param 納品書(html)の物理パス
     */
    const parseInvoice = useCallback(async (path: string): Promise<Invoice> => {
        try {
            const result = await invoke('parse_invoice', { path: path });
            console.debug(result);
            const invoice: Invoice = result as Invoice;
            return invoice;
        } catch (err) {
            console.error(err);
            throw new Error("納品書の解析に失敗しました。");
        }
    }, []);

    return { parseInvoice };
}
import { Invoice } from "@/types/invoices/invoice";
import { invoke } from "@tauri-apps/api/core";
import { useCallback } from "react";

/**
 * 納品書の処理
 * @returns 
 */
export const useInvoice = () => {

    const parseInvoice = useCallback(async (path: string): Promise<Invoice> => {
        const result: Invoice = JSON.parse(await invoke('parse_invoice', { path: path }));
        return result;
    }, []);


    const presentInvoice = (invoice: Invoice) => {
        const message: string =
            `
        注文番号: ${invoice.order_id}
        注文日:  ${invoice.order_date}
        出荷日:  ${invoice.shipping_date}
        `;

        return message;
    }

    return { parseInvoice, presentInvoice };
}
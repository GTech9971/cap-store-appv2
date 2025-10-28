import { useIonAlert } from "@ionic/react";
import type { Supplier } from "cap-store-api-def";

export const BomSupplierInputAlert = () => {
    const [present] = useIonAlert();

    const handlePresent = (supplier: Supplier | undefined): Promise<Supplier | null> => {
        return new Promise(resolve => {
            present({
                header: '購入先情報',
                subHeader: '購入先名・URL(必須)・製品番号',
                inputs: [
                    {
                        name: 'name',
                        type: 'text',
                        value: supplier?.name,
                        placeholder: '秋月電子',
                    },
                    {
                        name: 'url',
                        type: 'url',
                        value: supplier?.url,
                        placeholder: '(必須)https://akizuki.com/catalog/...'
                    },
                    {
                        name: 'modelId',
                        type: 'text',
                        value: supplier?.modelId,
                        placeholder: 'g1265356'
                    }
                ],
                buttons: [
                    {
                        text: 'OK',
                        handler: (input) => resolve(input)
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => resolve(null)
                    }
                ]
            });
        });
    }

    return [handlePresent];
}
import { useIonAlert } from "@ionic/react";
import type { Supplier } from "cap-store-api-def";

export const StorageInputAlert = () => {
    const [present] = useIonAlert();

    const handlePresent = (positionIndex: number, onDismiss: () => void, locationName?: string | null,): Promise<Supplier | null> => {
        return new Promise(resolve => {
            present({
                header: `保管庫:${positionIndex}`,
                subHeader: `${locationName}`,
                onDidDismiss: onDismiss,
                inputs: [
                    {
                        name: 'name',
                        type: 'text',
                        value: '',
                        placeholder: 'ストレージA',
                    },

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
import { useIonAlert } from "@ionic/react"

export const useConfirmUtils = () => {

    const [confirm] = useIonAlert();

    const handleConfirm = (message: string): Promise<boolean> => {
        return new Promise(resolve => {
            confirm(message,
                [
                    {
                        text: 'OK',
                        handler: () => resolve(true)
                    },
                    {
                        text: 'Cancel',
                        handler: () => resolve(false)
                    }
                ]
            )
        });
    }

    return [handleConfirm];
}
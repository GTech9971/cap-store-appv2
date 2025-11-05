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
                        role: 'cancel',
                        handler: () => resolve(false)
                    }
                ]
            )
        });
    }

    const handleConfirmWithInput = (message: string, placeholder: string): Promise<{ result: boolean, input: string | undefined }> => {
        return new Promise(resolve => {
            confirm({
                header: message,
                inputs: [
                    {
                        type: 'text',
                        placeholder: placeholder,
                    },
                ],
                buttons: [
                    {
                        text: 'OK',
                        handler: (input) => resolve({ result: true, input: input[0] === '' ? undefined : input[0] })
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => resolve({ result: false, input: undefined })
                    }
                ]
            });
        });
    }


    return { handleConfirm, handleConfirmWithInput };
}
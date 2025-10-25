import { IonNote } from "@ionic/react";
import type { ParsedError } from "../utils/parseApiError";

interface Prop {
    error?: ParsedError | undefined,
    message?: string | undefined
}

export const ErrorNote: React.FC<Prop> = ({ error, message }) => {
    return (
        <>
            {error && (
                <IonNote color='danger' className="ion-padding">
                    {error.message}:{error.status}
                </IonNote>
            )}

            {message && (
                <IonNote color='danger' className="ion-padding">
                    {message}
                </IonNote>
            )}
        </>
    )
}
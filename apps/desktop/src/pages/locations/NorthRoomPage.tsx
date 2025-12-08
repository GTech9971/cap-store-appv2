import { useDefaultStorage } from "@/api/useDefaultStorage";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react"
import { NorthRoom } from "ui/components/locations/NorthRoom"

export const NorthRoomPage = () => {

    // API
    const { cabinet, desk, handleSaveStorage } = useDefaultStorage();

    return (
        <IonPage>
            <IonHeader>

                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/"></IonBackButton>
                    </IonButtons>

                    <IonTitle>北の部屋</IonTitle>

                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">

                {(cabinet && desk) &&
                    <NorthRoom
                        cabinetLocation={cabinet}
                        deskLocation={desk}
                        onSave={handleSaveStorage} />
                }

            </IonContent>
        </IonPage>
    )
}
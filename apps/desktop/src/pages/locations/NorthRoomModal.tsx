import { useApiClint } from "@/api/useApiClient";
import { env } from "@/config/env";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonModal,
    IonTitle,
    IonToolbar,
    useIonAlert
} from "@ionic/react"
import { Location, FetchLocationRequest, Storage } from "cap-store-api-def";
import { useCallback, useEffect, useState } from "react";
import { NorthRoom } from "ui/components/locations/NorthRoom"
import { SlotKind } from "ui/components/locations/types";
import { parseApiError } from "ui/utils/parseApiError";
import './NorthRoomModal.css';


interface Props {
    isOpen: boolean,
    storage?: Storage,
    onSelect: (selected: Storage) => void,
    onClose: () => void
}

export const NorthRoomModal: React.FC<Props> = ({
    isOpen,
    storage,
    onSelect,
    onClose
}) => {
    const [present] = useIonAlert();

    const [cabinet, setCabinet] = useState<Location | undefined>(undefined);
    const [desk, setDesk] = useState<Location | undefined>(undefined);

    // API
    const { locationApi, storageApi, updateStorageApi, } = useApiClint();

    // location情報取得
    const fetchLocation = useCallback(async (kind: SlotKind) => {
        const request: FetchLocationRequest = {
            locationId: kind === 'cabinet'
                ? env.LOCATIONS_CABINET_ID
                : env.LOCATIONS_DESK_ID
        };

        try {
            const response = await locationApi.fetchLocation(request);
            if (!response.data) { return; }

            if (kind === 'cabinet') {
                setCabinet(response.data);
            } else {
                setDesk(response.data);
            }

        } catch (error) {
            const { message, status } = await parseApiError(error);
            await present({ header: 'エラー', subHeader: status?.toString(), message: message });
        }
    }, [locationApi, present]);

    useEffect(() => {
        fetchLocation('cabinet');
        fetchLocation('desk')
    }, [fetchLocation]);

    const handleSelectStorage = useCallback((selected: Storage) => {
        onSelect(selected);
        onClose();
    }, [onSelect, onClose]);


    return (
        <IonModal isOpen={isOpen} className="modal">
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start" >
                        <IonButton onClick={onClose}>
                            閉じる
                        </IonButton>
                    </IonButtons>

                    <IonTitle>北の部屋</IonTitle>

                    <IonButtons slot="end">
                        <IonButton onClick={() => handleSelectStorage(null!)}>
                            選択
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" color="light">

                {(desk && cabinet) &&
                    <NorthRoom
                        deskLocation={desk}
                        cabinetLocation={cabinet}
                        onSave={() => { return null! }}
                        defaultSelected={storage}
                        onSelected={handleSelectStorage} />
                }

            </IonContent>

        </IonModal>
    )
}
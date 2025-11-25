import { useApiClint } from "@/api/useApiClient";
import { env } from "@/config/env";
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    useIonAlert,
    useIonToast
} from "@ionic/react"
import {
    FetchLocationRequest,
    Location,
    RegistryStorageRequest,
    Storage,
    UpdateStorageRequest
} from "cap-store-api-def";
import { useCallback, useEffect, useState } from "react";
import { NorthRoom } from "ui/components/locations/NorthRoom"
import { SlotKind } from "ui/components/locations/types";
import { parseApiError } from "ui/utils/parseApiError";

export const NorthRoomPage = () => {
    const [present] = useIonAlert();
    const [presentToast] = useIonToast();

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


    /**
     * ストレージ新規登録
     */
    const saveNewStorage = useCallback(async (storage: Storage): Promise<string> => {
        try {
            const request: RegistryStorageRequest = {
                locationId: storage.locationId!,
                name: storage.name,
                positionIndex: storage.positionIndex,
                useableFreeSpace: storage.useableFreeSpace
            };

            const response = await storageApi.registryStorage({ registryStorageRequest: request });
            if (!response.data?.storageId) { throw new Error("ストレージの登録失敗"); }

            await presentToast({ message: `ストレージ新規登録:${response.data.storageId}`, duration: 3000 });

            return response.data.storageId;
        } catch (error) {
            const { message, status } = await parseApiError(error);
            await present({ header: 'エラー', subHeader: status?.toString(), message: message });
            throw error;
        }
    }, [present, storageApi, presentToast]);

    /**
     * ストレージ更新
     */
    const updateStorage = useCallback(async (storage: Storage): Promise<string> => {
        try {
            // TODO 不必要な更新が混じっている
            const masks: string[] = [
                'name',
                'useableFreeSpace',
                'locationId',
                'positionIndex'
            ];

            const request: UpdateStorageRequest = {
                name: storage.name,
                locationId: storage.locationId,
                useableFreeSpace: storage.useableFreeSpace,
                positionIndex: storage.positionIndex
            };

            const response = await updateStorageApi(request, masks, storage.id);
            if (!response.data?.id) { throw new Error("ストレージの更新失敗"); }

            await presentToast({ message: 'ストレージ更新', duration: 3000 });

            return response.data.id;
        } catch (error) {
            const { message, status } = await parseApiError(error);
            await present({ header: 'エラー', subHeader: status?.toString(), message: message });
            throw error;
        }
    }, [present, updateStorageApi, presentToast]);



    const handleSaveLocation = useCallback(async (mode: 'new' | 'update', storage: Storage): Promise<string> => {
        return mode === 'new'
            ? await saveNewStorage(storage)
            : await updateStorage(storage);

    }, [saveNewStorage, updateStorage]);

    useEffect(() => {
        fetchLocation('cabinet');
        fetchLocation('desk')
    }, [fetchLocation]);

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
                        onSave={handleSaveLocation} />
                }

            </IonContent>
        </IonPage>
    )
}
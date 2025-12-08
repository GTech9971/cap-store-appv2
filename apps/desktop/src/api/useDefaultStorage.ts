import { env } from "@/config/env";
import {
    FetchLocationRequest,
    Location,
    Storage,
    RegistryStorageRequest,
    UpdateStorageRequest
} from "cap-store-api-def";
import { useCallback, useEffect, useState } from "react";
import { SlotKind } from "ui/components/locations/types";
import { useApiClint } from "./useApiClient";
import { useIonAlert, useIonToast } from "@ionic/react";
import { parseApiError } from "ui/utils/parseApiError";

/**
 * デフォルトストレージの取得処理
 * @returns 
 */
export const useDefaultStorage = () => {

    const [cabinet, setCabinet] = useState<Location | undefined>(undefined);
    const [desk, setDesk] = useState<Location | undefined>(undefined);

    const { locationApi, storageApi, updateStorageApi } = useApiClint();
    const [present] = useIonAlert();
    const [presentToast] = useIonToast();

    // location情報取得
    const fetchLocation = useCallback(async (kind: SlotKind): Promise<Location> => {
        const request: FetchLocationRequest = {
            locationId: kind === 'cabinet'
                ? env.LOCATIONS_CABINET_ID
                : env.LOCATIONS_DESK_ID
        };

        const response = await locationApi.fetchLocation(request);
        if (!response.data) { throw new Error("ロケーションの取得に失敗"); }

        return response.data;

    }, [locationApi]);

    useEffect(() => {
        (async () => {
            try {
                const cabinet: Location = await fetchLocation('cabinet');
                setCabinet(cabinet);

                const desk: Location = await fetchLocation('desk');
                setDesk(desk);
            } catch (error) {
                const { message, status } = await parseApiError(error);
                await present({ header: 'エラー', subHeader: status?.toString(), message: message });
            }
        })();
    }, [fetchLocation, present]);


    /**
     * ストレージ新規登録
     * @returns ストレージID
     */
    const saveNewStorage = useCallback(async (storage: Storage): Promise<string> => {
        const request: RegistryStorageRequest = {
            locationId: storage.locationId!,
            name: storage.name,
            positionIndex: storage.positionIndex,
            useableFreeSpace: storage.useableFreeSpace
        };

        const response = await storageApi.registryStorage({ registryStorageRequest: request });
        if (!response.data?.storageId) { throw new Error("ストレージの登録失敗"); }

        return response.data.storageId;
    }, [storageApi]);

    /**
     * ストレージ更新
     */
    const updateStorage = useCallback(async (storage: Storage): Promise<string> => {

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


        return response.data.id;

    }, [updateStorageApi]);

    /**
     * 新規登録・保存処理(エラーハンドリング付き アラート表示)
     */
    const handleSaveStorage = useCallback(async (mode: 'new' | 'update', storage: Storage): Promise<string> => {
        let storageId: string;
        try {
            if (mode === 'new') {
                storageId = await saveNewStorage(storage);
                await presentToast({ message: `ストレージ新規登録:${storageId}`, duration: 3000 });
            } else {
                storageId = await updateStorage(storage);
                await presentToast({ message: 'ストレージ更新', duration: 3000 });
            }
            return storageId;
        } catch (error) {
            const { message, status } = await parseApiError(error);
            await present({ header: 'エラー', subHeader: status?.toString(), message: message });
            throw error;
        }
    }, [saveNewStorage, updateStorage, presentToast, present]);


    return { cabinet, desk, fetchLocation, handleSaveStorage };
}
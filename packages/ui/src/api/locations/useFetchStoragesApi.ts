import { StoragesApi, type Storage } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";

export type StorageByPosition = Record<number, string>;

type FetchResult = {
    storages: Storage[]
    storageByPosition: StorageByPosition
    fetchStoragesError: ParsedError | undefined
    isLoadingFetchStorages: boolean
}

export const useFetchStoragesApi = (
    storagesApi?: StoragesApi,
    locationId?: string,
): FetchResult => {
    const fetcher = useCallback(async (): Promise<Storage[]> => {
        if (!storagesApi) return []
        try {
            const response = await storagesApi.fetchStorages()
            const storages = response?.data ?? []
            if (locationId) {
                return storages.filter((storage) => storage.locationId === locationId)
            }
            return storages
        } catch (error) {
            throw await parseApiError(error)
        }
    }, [locationId, storagesApi])

    const { data, error, isLoading } = useSWR<Storage[], ParsedError>(
        storagesApi ? ['fetchStorages', locationId ?? 'all'] : null,
        fetcher,
    )

    const storages = data ?? []
    const storageByPosition: StorageByPosition = Object.fromEntries(
        storages
            .filter((storage) => storage.positionIndex != null)
            .map((storage) => [storage.positionIndex as number, storage.name]),
    )

    return {
        storages,
        storageByPosition,
        fetchStoragesError: error,
        isLoadingFetchStorages: isLoading,
    }
}

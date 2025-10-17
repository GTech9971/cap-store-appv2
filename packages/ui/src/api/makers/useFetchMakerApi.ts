import { MakersApi, type Maker } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";


/**
 * メーカー情報を返すAPI
 * @param makerApi 
 * @returns 
 */
export const useFetchMakerApi = (makerApi: MakersApi) => {

    const fetcher = useCallback(async (): Promise<Maker[]> => {
        try {
            const response = await makerApi.fetchMakers();
            return response?.data ?? [];
        } catch (error) {
            throw await parseApiError(error);
        }

    }, [makerApi]);

    const { data, error, isLoading, mutate } = useSWR<Maker[], ParsedError>('fetchMakers', fetcher);

    return {
        makers: data ?? [],
        fetchMakerError: error,
        isLoadingFetchMaker: isLoading,
        refreshMaker: mutate
    }
}
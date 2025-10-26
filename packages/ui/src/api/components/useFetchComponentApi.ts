import { ComponentsApi, type FetchComponentRequest, type PartsComponent, } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";


/**
 * 電子部品情報を返すAPI
 * @param componentApi
 * @param componentId 
 * @returns 
 */
export const useFetchComponentApi = (componentApi: ComponentsApi, componentId: string) => {

    const fetcher = useCallback(async (componentId: string): Promise<PartsComponent | undefined> => {
        try {
            const request: FetchComponentRequest = { componentId: componentId };
            const response = await componentApi.fetchComponent(request);
            return response?.data;
        } catch (error) {
            throw await parseApiError(error);
        }

    }, [componentApi]);

    const { data, error, isLoading, mutate } = useSWR<PartsComponent | undefined, ParsedError>(
        componentId ? ['fetchComponent', componentId] : null,
        () => fetcher(componentId));

    return {
        component: data,
        fetchComponentError: error,
        isLoadingFetchComponent: isLoading,
        refreshComponent: mutate
    }
}
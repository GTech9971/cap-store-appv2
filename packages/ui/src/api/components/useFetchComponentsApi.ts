import { CategoriesApi, type FetchComponentsByCategoryIdRequest, type PartsComponent, } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";


/**
 * 電子部品情報リストを返すAPI
 * @param categoryApi
 * @param categoryId
 * @returns 
 */
export const useFetchComponentsApi = (categoryApi: CategoriesApi, categoryId?: string) => {

    const fetcher = useCallback(async (categoryId: string): Promise<PartsComponent[]> => {
        try {
            const request: FetchComponentsByCategoryIdRequest = { categoryId: categoryId };
            const response = await categoryApi.fetchComponentsByCategoryId(request);
            return response?.data ?? [];
        } catch (error) {
            throw await parseApiError(error);
        }

    }, [categoryApi]);

    const { data, error, isLoading, mutate } = useSWR<PartsComponent[], ParsedError>(
        categoryId ? ['fetchComponents', categoryId] : null,
        () => fetcher(categoryId!)
    );

    return {
        components: data ?? [],
        fetchComponentsError: error,
        isLoadingFetchComponents: isLoading,
        refreshComponents: mutate
    }
}
import { CategoriesApi, type Category } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";


/**
 * カテゴリー情報を返すAPI
 * @param categoryApi 
 * @returns 
 */
export const UseFetchCategoryApiClient = (categoryApi: CategoriesApi) => {

    const fetcher = useCallback(async (): Promise<Category[]> => {
        try {
            const response = await categoryApi.fetchCategories();
            return response?.data ?? [];
        } catch (error) {
            throw await parseApiError(error);
        }

    }, [categoryApi]);

    const { data, error, isLoading, mutate } = useSWR<Category[], ParsedError>('fetchCategories', fetcher);

    return {
        categories: data ?? [],
        fetchCategoryError: error,
        isLoadingFetchCategory: isLoading,
        refreshCategory: mutate
    }
}
import { type FetchComponentRequest, type PartsComponent, type UpdateComponentRequest, type UpdateComponentResponse, } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";
import type { AxiosInstance } from "axios";


/**
 * 電子部品情報を返すAPI
 * @param componentApi
 * @param componentId 
 * @returns 
 */
export const useUpdateComponentApi = (
    axiosClient: AxiosInstance,
    request: UpdateComponentRequest,
    fieldMask: string[],
    componentId: string) => {

    const update = useCallback(async (updateRequest: UpdateComponentRequest, fieldMask: string[], componentId: string): Promise<UpdateComponentResponse> => {
        // 複数の fieldMask を繰り返しパラメータとして渡す
        const query: string = fieldMask.map(m => `fieldMask=${encodeURIComponent(m)}`).join("&");
        const url = `/components/${componentId}?${query}`;
        return (await axiosClient.patch<UpdateComponentResponse>(url, updateRequest)).data;
    }, [axiosClient]);


    const { data, error, isLoading } = useSWR<UpdateComponentResponse, ParsedError>(
        request ? ['updateComponent', request, fieldMask, componentId] : null,
        () => update(request, fieldMask, componentId));

    return {
        component: data,
        updateComponentError: error,
        isLoadingUpdateComponent: isLoading,
    }
}
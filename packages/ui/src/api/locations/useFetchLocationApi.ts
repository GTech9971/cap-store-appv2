import { LocationsApi, type Location } from "cap-store-api-def";
import { useCallback } from "react";
import useSWR from "swr";
import { parseApiError, type ParsedError } from "../../utils/parseApiError";

type FetchResult = {
    location: Location | null
    locationName: string | null
    fetchLocationError: ParsedError | undefined
    isLoadingFetchLocation: boolean
}

export const useFetchLocationApi = (
    locationsApi?: LocationsApi,
    locationId?: string,
): FetchResult => {

    const fetcher = useCallback(async (): Promise<Location | null> => {
        if (!locationsApi) return null
        const hasFetchLocation = typeof (locationsApi as Partial<LocationsApi>).fetchLocation === 'function'
        const hasFetchLocations = typeof (locationsApi as Partial<LocationsApi>).fetchLocations === 'function'

        try {
            if (locationId && hasFetchLocation) {
                const response = await locationsApi.fetchLocation({ locationId })
                return response?.data ?? null
            }
            if (hasFetchLocations) {
                const response = await locationsApi.fetchLocations()
                return response?.data?.[0] ?? null
            }
            return null
        } catch (error) {
            throw await parseApiError(error)
        }
    }, [locationId, locationsApi])

    const { data, error, isLoading } = useSWR<Location | null, ParsedError>(
        locationsApi ? ['fetchLocation', locationId ?? 'first'] : null,
        fetcher,
    )

    return {
        location: data ?? null,
        locationName: data?.name ?? null,
        fetchLocationError: error,
        isLoadingFetchLocation: isLoading,
    }
}

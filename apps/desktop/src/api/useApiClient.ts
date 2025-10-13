import axios, { AxiosInstance } from "axios";
import { AkizukiCatalogsApi, CategoriesApi, ComponentsApi, Configuration, InventoriesApi, MakersApi, ProjectsApi, UpdateComponentRequest, UpdateComponentResponse, UpdateProjectRequest, UpdateProjectResponse } from "cap-store-api-def";
import { useCallback, useMemo } from "react";
import { env } from "@/config/env";
import { useOktaAuth } from "@okta/okta-react";

export const useApiClint = () => {

    const { authState } = useOktaAuth();

    const axiosClient: AxiosInstance = axios.create({ baseURL: env.API_URL });

    axiosClient.interceptors.request.use((config) => {
        const token: string | undefined = authState?.isAuthenticated
            ? authState.accessToken?.accessToken
            : undefined;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const config: Configuration = useMemo(() => {
        const token: string | undefined = authState?.isAuthenticated
            ? authState.accessToken?.accessToken
            : undefined;
        return new Configuration({
            basePath: env.API_URL,
            headers: (token ? { Authorization: `Bearer ${token}` } : undefined)
        })
    }, [authState]);

    const componentApi: ComponentsApi = useMemo(() => { return new ComponentsApi(config) }, [config]);
    const categoryApi: CategoriesApi = useMemo(() => { return new CategoriesApi(config); }, [config]);
    const makerApi: MakersApi = useMemo(() => { return new MakersApi(config) }, [config]);
    const inventoryApi: InventoriesApi = useMemo(() => { return new InventoriesApi(config) }, [config]);
    const akizukiCatalogApi: AkizukiCatalogsApi = useMemo(() => { return new AkizukiCatalogsApi(config) }, [config]);
    const projectApi: ProjectsApi = useMemo(() => { return new ProjectsApi(config) }, [config]);

    /**
     * 電子部品更新API
     */
    const updateComponentApi = useCallback(async (updateRequest: UpdateComponentRequest, maskFields: string[], componentId: string): Promise<UpdateComponentResponse> => {
        // 複数の fieldMask を繰り返しパラメータとして渡す
        const query: string = maskFields.map(m => `fieldMask=${encodeURIComponent(m)}`).join("&");
        const url = `/components/${componentId}?${query}`;
        return (await axiosClient.patch<UpdateComponentResponse>(url, updateRequest)).data;
    }, [axiosClient]);

    /**
     * プロジェクト更新API
     */
    const updateProjectApi = useCallback(async (projectId: string, updateRequest: UpdateProjectRequest, maskFields: string[]): Promise<UpdateProjectResponse> => {
        const query: string = maskFields.map((mask) => `fieldMask=${encodeURIComponent(mask)}`).join("&");
        const url = `/projects/${projectId}?${query}`;
        return (await axiosClient.patch<UpdateProjectResponse>(url, updateRequest)).data;
    }, [axiosClient]);

    return { componentApi, updateComponentApi, categoryApi, makerApi, inventoryApi, akizukiCatalogApi, projectApi, updateProjectApi };
}

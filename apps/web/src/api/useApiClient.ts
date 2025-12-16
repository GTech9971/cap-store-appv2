import axios, { AxiosInstance } from "axios";
import { AkizukiCatalogsApi, CategoriesApi, ComponentsApi, Configuration, InventoriesApi, MakersApi, ProjectsApi, ProjectsHistoryApi, UpdateComponentRequest, UpdateComponentResponse, UpdateProjectRequest, UpdateProjectResponse } from "cap-store-api-def";
import { useCallback, useMemo } from "react";
import { env } from "@/config/env";
import { useOktaAuth } from "@okta/okta-react";
import { downloadBlob } from "@/utils/downloadBlob";

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
    const projectHistoryApi: ProjectsHistoryApi = useMemo(() => { return new ProjectsHistoryApi(config) }, [config]);

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

    /**
     * プロジェクトPDF出力
     */
    const downloadProjectPdfApi = useCallback(async (projectId: string): Promise<{ blob: Blob; fileName?: string }> => {
        const url = `/projects/${projectId}`;
        const response = await axiosClient.get<Blob>(url, {
            responseType: "blob",
            headers: {
                Accept: "application/pdf"
            }
        });

        const dispositionHeader = response.headers["content-disposition"] ?? response.headers["Content-Disposition"];

        const parseFileName = (disposition: string | undefined): string | undefined => {
            if (!disposition) return undefined;

            const segments = disposition.split(";").map((segment) => segment.trim());
            let asciiValue: string | undefined;
            let extendedValue: string | undefined;

            segments.forEach((segment) => {
                if (/^filename\*=/i.test(segment)) {
                    extendedValue = segment.substring(segment.indexOf("=") + 1).trim();
                } else if (/^filename=/i.test(segment)) {
                    asciiValue = segment.substring(segment.indexOf("=") + 1).trim();
                }
            });

            const cleanValue = (value: string | undefined): string | undefined => {
                if (!value) return undefined;
                const withoutQuotes = value.replace(/^"(.*)"$/, "$1");
                return withoutQuotes.length > 0 ? withoutQuotes : undefined;
            };

            const decodeExtendedValue = (value: string | undefined): string | undefined => {
                if (!value) return undefined;
                const match = value.match(/^(?:UTF-8'')?(.*)$/i);
                const encodedPortion = match?.[1] ?? value;
                try {
                    return decodeURIComponent(encodedPortion);
                } catch {
                    return encodedPortion;
                }
            };

            const extended = decodeExtendedValue(cleanValue(extendedValue));
            if (extended) {
                return extended;
            }

            const ascii = cleanValue(asciiValue);
            return ascii;
        };

        const fileName = parseFileName(dispositionHeader);

        return { blob: response.data, fileName };
    }, [axiosClient]);

    /**
     * プロジェクトPDFダウンロード
     */
    const downloadProjectPdf = useCallback(async (projectId: string, fallbackFileName?: string): Promise<string> => {
        const { blob, fileName: headerFileName } = await downloadProjectPdfApi(projectId);
        return downloadBlob(blob, {
            fileName: headerFileName,
            fallbackFileName,
            defaultFileName: "project",
            extension: ".pdf"
        });
    }, [downloadProjectPdfApi]);

    return {
        componentApi,
        updateComponentApi,
        categoryApi,
        makerApi,
        inventoryApi,
        akizukiCatalogApi,
        projectApi,
        projectHistoryApi,
        updateProjectApi,
        downloadProjectPdf
    };
}

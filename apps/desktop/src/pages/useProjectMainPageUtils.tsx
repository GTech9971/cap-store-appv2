import { Bom, Project, ProjectExternalLink, ProjectImg } from "cap-store-api-def";
import { useCallback } from "react";

/**
 * プロジェクトページで使用する関数群
 * @returns 
 */
export const useProjectMainPageUtils = () => {

    /**
     * プロジェクトを整形
     */
    const normalizeProject = useCallback((project: Project): Project => ({
        ...project,
        createdAt: project.createdAt instanceof Date ? project.createdAt : new Date(project.createdAt),
        lastModified: project.lastModified instanceof Date ? project.lastModified : new Date(project.lastModified),
        imgUrls: project.imgUrls ?? [],
        externalLinks: project.externalLinks ?? [],
        bomList: project.bomList ?? []
    }), []);

    /**
     * プロジェクト画像リストを整形
     */
    const normalizeImages = useCallback((images: ProjectImg[] | undefined) => {
        return (images ?? []).map((img) => ({
            url: img.url.trim(),
            title: img.title?.trim() || undefined,
            tag: img.tag?.trim() || undefined
        }));
    }, []);

    /**
     * プロジェクト外部リンクリストを整形
     */
    const normalizeLinks = useCallback((links: ProjectExternalLink[] | undefined) => {
        return (links ?? []).map((link) => ({
            link: link.link.trim(),
            title: link.title?.trim() || undefined,
            tag: link.tag?.trim() || undefined
        })).filter((link) => link.link.length > 0);
    }, []);

    /**
     * BOMリストを整形
     */
    const normalizeBoms = useCallback((bomList: Bom[] | undefined) => {
        return (bomList ?? [])
            .map((bom) => {
                const trimmedComponentId = bom.componentId.trim();
                return {
                    id: (bom.id ?? "").trim() || undefined,
                    componentId: trimmedComponentId,
                    quantity: Number(bom.quantity) || 0,
                    footPrintName: bom.footPrintName?.trim() || undefined,
                    remarks: bom.remarks?.trim() || undefined,
                    refName: bom.refName?.trim() || undefined,
                    supplier: bom.supplier || undefined
                };
            })
            .filter((bom) => bom.componentId.length > 0 && bom.quantity > 0);
    }, []);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    /**
     * PascalCase -> camelCaseに変換
     * @param obj 
     * @returns 
     */
    const keysToCamelCase = useCallback(<T,>(obj: any): T => {
        if (Array.isArray(obj)) {
            return obj.map(v => keysToCamelCase(v)) as unknown as T;
        } else if (obj !== null && obj.constructor === Object) {
            return Object.entries(obj).reduce((acc, [key, value]) => {
                const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
                (acc as any)[camelKey] = keysToCamelCase(value);
                return acc;
            }, {} as any) as T;
        }
        return obj;
    }, []);

    return { normalizeProject, normalizeImages, normalizeLinks, normalizeBoms, keysToCamelCase };
}
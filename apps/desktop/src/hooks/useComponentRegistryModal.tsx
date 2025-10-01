import { useApiClint } from "@/api/useApiClient";
import { parseApiError } from "@/utils/parseApiError";
import { useIonAlert } from "@ionic/react";
import { Category, FetchComponentByAkizukiCatalogIdResponse, Maker, RegistryComponentRequest } from "cap-store-api-def";
import { useCallback, useEffect, useMemo, useState } from "react";
import ComponentRegisterModal, { Data } from "ui/components/ComponentRegisterModal";
import z from "zod";

/**
 * 電子部品登録モーダルを簡易に使用するためのカスタムhooks
 * @see ComponentRegisterModal
 * @returns 
 */
export const useComponentRegistryModal = () => {

    const initialFormState: RegistryComponentRequest = useMemo(() => {
        return {
            name: '',
            modelName: '',
            categoryId: '',
            makerId: '',
            description: '',
            images: [],
            currentStock: 0
        }
    }, []);


    const componentSchema = z.object({
        name: z.string().min(1, '名称は必須です'),
        modelName: z.string().min(1, '型番は必須です'),
        categoryId: z.string().min(1, 'カテゴリは必須です'),
        makerId: z.string().min(1, 'メーカーは必須です'),
        description: z.string().optional(),
        images: z.array(z.string()).optional(),
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const [form, setForm] = useState<RegistryComponentRequest>(initialFormState);

    const { categoryApi, makerApi, componentApi, akizukiCatalogApi } = useApiClint();

    const [errors, setErrors] = useState<Partial<Record<keyof RegistryComponentRequest, string>>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const [confirm, _] = useIonAlert();
    const presentConfirm = useCallback((category: Category | undefined, makerName: string | undefined): Promise<boolean> => {
        return new Promise((resolve) => {
            confirm(`以下のカテゴリまたはメーカーが未登録です。` +
                `${category ? `カテゴリ: ${category.name}\n` : ''}` +
                `${makerName ? `メーカー: ${makerName}\n` : ''}` +
                `\nこれらを登録しますか？`,
                [
                    {
                        text: 'OK',
                        handler: () => resolve(true),
                    },
                    {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => resolve(false)
                    }
                ])
        })
    }, [confirm])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const categoryRes = await categoryApi.fetchCategories();
                setCategories(categoryRes?.data ?? []);
                const makerRes = await makerApi.fetchMakers();
                setMakers(makerRes?.data ?? []);
            } catch (error: unknown) {
                const { message, status } = await parseApiError(error);
                setApiError(`カテゴリやメーカーの取得に失敗しました。${message}:${status}`);
            }
        };
        fetchData();
    }, [categoryApi, makerApi]);

    // モーダルを閉じる前に入力をリセット
    const resetForm = useCallback(() => {
        setForm(initialFormState);
        // setAkizukiCode('');
        setErrors({});
        setApiError(null);
    }, [initialFormState]);

    const handleClose = useCallback(() => {
        resetForm();
        setIsOpen(false);
    }, [resetForm, setIsOpen]);


    const handleFormChange = (field: keyof Data, value: unknown) => {
        setForm(prev => ({ ...prev, [field]: value }));
    }


    const fetchFromAkizukiCatalog = useCallback(async (code: string | undefined) => {
        if (!code) { return; }

        setApiError(null);
        code = code.trim();

        // 秋月電子のURLから通販コード（数字部分）を抽出
        const urlMatch = code.match(/\/g\/g(\d{6})\/?/i);
        if (urlMatch) { code = urlMatch[1]; } // g を除いた数字部分を通販コードとする

        try {
            const res: FetchComponentByAkizukiCatalogIdResponse = await akizukiCatalogApi.fetchComponentByAkizukiCatalogId({ catalogId: code });
            const data = res.data;

            if (!data) { return; }
            let maker: Maker | undefined = makers.find(x => x.name === data.makerName);

            if (data.unRegistered) {
                const { category, makerName } = data.unRegistered;

                if (await presentConfirm(category, makerName)) {
                    if (category) {
                        try {
                            await categoryApi.registryCategory({ registryCategoryRequest: category });
                            const updatedCategories = await categoryApi.fetchCategories();
                            setCategories(updatedCategories?.data ?? []);
                        } catch (err: unknown) {
                            const { message, status } = await parseApiError(err);
                            setApiError(`未登録カテゴリの登録に失敗しました。${message}:${status}`);
                        }
                    }
                    if (makerName) {
                        try {
                            await makerApi.registryMaker({ registryMakerRequest: { countryCode: 'JP', name: makerName } });
                            const updatedMakers = await makerApi.fetchMakers();
                            setMakers(updatedMakers?.data ?? []);
                            maker = updatedMakers?.data?.find(x => x.name === data.makerName);
                        } catch (err) {
                            const { message, status } = await parseApiError(err);
                            setApiError(`未登録メーカーの登録に失敗しました。${message}:${status}`);
                        }
                    }
                }
            }

            // TODO 以下があるため必ずモーダルがさいレンダリングされる
            setForm(prev => ({
                ...prev,
                name: data.name || '',
                modelName: data.modelName || '',
                description: data.description || '',
                categoryId: data.categoryId || '',
                makerId: maker?.id || '',
                images: data.images || []
            }));
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setApiError(`秋月電子の情報取得に失敗しました。通販コードをご確認ください。${message}:${status}`);
        }
    }, [akizukiCatalogApi, categoryApi, makerApi, makers, presentConfirm]);


    const [present] = useIonAlert();

    const handleSubmit = useCallback(async () => {
        setApiError(null); // 実行前にクリア
        const result = componentSchema.safeParse(form);
        if (!result.success) {
            const fieldErrors = result.error.flatten().fieldErrors;
            setErrors({
                name: fieldErrors.name?.[0],
                modelName: fieldErrors.modelName?.[0],
                categoryId: fieldErrors.categoryId?.[0],
                makerId: fieldErrors.makerId?.[0],
            });
            return;
        }

        form.description = form.description ?? '';
        try {
            await componentApi.registryComponent({ registryComponentRequest: form });

            await present('登録しました。');

            handleClose();
        } catch (err: unknown) {
            const { message, status } = await parseApiError(err);
            setApiError(`登録中にエラーが発生しました。もう一度お試しください。 ${message}:${status}`);
        }
    }, [componentApi, componentSchema, form, present, handleClose]);

    /**
     * 電子部品登録モーダル
     */
    const Modal = useCallback(() => {
        if (!isOpen) return null;

        return (
            <ComponentRegisterModal
                isOpen={isOpen}
                onClose={handleClose}
                categories={categories}
                makers={makers}
                form={form}
                errors={errors}
                onFetchFromAkizuki={fetchFromAkizukiCatalog}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
            />
        );
    }, [isOpen, categories, makers, form, errors, handleSubmit, handleClose, fetchFromAkizukiCatalog]);

    return { isOpen, setIsOpen, Modal };
}
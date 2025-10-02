import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    IonText,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    useIonAlert
} from '@ionic/react';
import ImageCarousel from './ImageCarousel';
import type { AkizukiCatalogsApi, CategoriesApi, ComponentsApi, FetchComponentByAkizukiCatalogIdResponse, MakersApi, RegistryComponentRequest } from 'cap-store-api-def';
import z from 'zod';
import { parseApiError } from '../utils/parseApiError';

interface Category {
    id: string;
    name: string;
}

interface Maker {
    id: string;
    name: string;
}

export interface Data {
    name: string;
    modelName: string;
    categoryId: string;
    makerId: string;
    description?: string;
    images?: string[];
}

interface Props {
    isOpen: boolean;
    categoryApi: CategoriesApi,
    makerApi: MakersApi,
    componentApi: ComponentsApi,
    akizukiApi: AkizukiCatalogsApi,
    onClose: () => void;
}

export const ComponentRegisterModal: React.FC<Props> = ({
    isOpen,
    categoryApi,
    makerApi,
    componentApi,
    akizukiApi,
    onClose
}) => {


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

    const [akizukiCode, setAkizukiCode] = useState<string | undefined>(undefined);
    const [form, setForm] = useState<RegistryComponentRequest>(initialFormState);

    const [errors, setErrors] = useState<Partial<Record<keyof RegistryComponentRequest, string>>>({});
    const [categories, setCategories] = useState<Category[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);


    const [confirm] = useIonAlert();
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
        setAkizukiCode('');
        setErrors({});
        setApiError(null);
    }, [initialFormState]);

    const handleClose = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);


    const handleFormChange = useCallback((field: keyof Data, value: unknown) => { setForm(prev => ({ ...prev, [field]: value })); }, [])


    const handleFetchFromAkizukiCatalog = useCallback(async (code: string | undefined) => {
        if (!code) { return; }

        setApiError(null);
        code = code.trim();

        // 秋月電子のURLから通販コード（数字部分）を抽出
        const urlMatch = code.match(/\/g\/g(\d{6})\/?/i);
        if (urlMatch) { code = urlMatch[1]; } // g を除いた数字部分を通販コードとする

        try {
            const res: FetchComponentByAkizukiCatalogIdResponse = await akizukiApi.fetchComponentByAkizukiCatalogId({ catalogId: code });
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
    }, [akizukiApi, categoryApi, makerApi, makers, presentConfirm]);


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

    console.log(errors);

    return (
        <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>コンポーネント登録</IonTitle>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleClose}>
                            キャンセル
                        </IonButton>
                    </IonButtons>
                    <IonButtons slot="end">
                        <IonButton fill="clear" onClick={handleSubmit}>
                            登録
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {apiError && (
                    <IonNote color="danger" className="ion-padding">
                        {apiError}
                    </IonNote>
                )}

                <IonItem>
                    <IonInput
                        labelPlacement="stacked"
                        placeholder="URLまたは通販コード"
                        value={akizukiCode}
                        onIonInput={(e) => setAkizukiCode(e.detail.value ?? undefined)}
                    >
                        <div slot="label">秋月電子通販コード</div>
                    </IonInput>
                    <IonButton
                        fill="outline"
                        size="small"
                        slot="end"
                        onClick={() => handleFetchFromAkizukiCatalog(akizukiCode)}
                    >
                        取得
                    </IonButton>
                </IonItem>

                <IonGrid>
                    <IonRow>
                        <IonCol size="12" sizeMd="6">
                            <ImageCarousel
                                images={form.images || []}
                                onDelete={(index) => {
                                    const updated = (form.images || []).filter((_, i) => i !== index);
                                    handleFormChange('images', updated);
                                }}
                            />
                            <IonItem>
                                <IonInput
                                    placeholder='画像URL（カンマ区切りで複数可）'
                                    value={form.images?.join(', ') || ''}
                                    onIonInput={(e) => {
                                        const urls = (e.detail.value as string).split(',').map(url => url.trim()).filter(url => url);
                                        handleFormChange('images', urls);
                                    }}
                                >
                                </IonInput>
                            </IonItem>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                            <IonItem>
                                <IonInput
                                    labelPlacement="stacked"
                                    required
                                    value={form.name}
                                    onIonInput={(e) => handleFormChange('name', e.detail.value)}
                                >
                                    <div slot="label">名称 <IonText color="danger">*</IonText></div>
                                </IonInput>
                                {errors.name && (
                                    <IonNote color="danger" slot="helper">
                                        {errors.name}
                                    </IonNote>
                                )}
                            </IonItem>

                            <IonItem>
                                <IonInput
                                    labelPlacement="stacked"
                                    required
                                    value={form.modelName}
                                    onIonInput={(e) => handleFormChange('modelName', e.detail.value)}
                                >
                                    <div slot="label">型番 <IonText color="danger">*</IonText></div>
                                </IonInput>
                                {errors.modelName && (
                                    <IonNote color="danger" slot="helper">
                                        {errors.modelName}
                                    </IonNote>
                                )}
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">カテゴリ <span style={{ color: 'red' }}>*</span></IonLabel>
                                <IonSelect
                                    required
                                    labelPlacement='stacked'
                                    value={form.categoryId}
                                    onIonChange={(e) => handleFormChange('categoryId', e.detail.value)}
                                    placeholder="選択してください"
                                >
                                    {categories.map(cat => (
                                        <IonSelectOption key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                                {errors.categoryId && (
                                    <IonNote color="danger" slot="helper">
                                        {errors.categoryId}
                                    </IonNote>
                                )}
                            </IonItem>

                            <IonItem>
                                <IonLabel position="stacked">メーカー <span style={{ color: 'red' }}>*</span></IonLabel>
                                <IonSelect
                                    value={form.makerId}
                                    onIonChange={(e) => handleFormChange('makerId', e.detail.value)}
                                    placeholder="選択してください"
                                >
                                    {makers.map((maker, index) => (
                                        <IonSelectOption key={index} value={maker.id}>
                                            {maker.name}
                                        </IonSelectOption>
                                    ))}
                                </IonSelect>
                                {errors.makerId && (
                                    <IonNote color="danger" slot="helper">
                                        {errors.makerId}
                                    </IonNote>
                                )}
                            </IonItem>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                <IonItem>
                    <IonTextarea
                        placeholder='説明・仕様'
                        value={form.description}
                        onIonInput={(e) => handleFormChange('description', e.detail.value)}
                        rows={4}
                    />
                </IonItem>
            </IonContent>
        </IonModal>
    );
};

export default ComponentRegisterModal;
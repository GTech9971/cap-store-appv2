import { IonItem, IonLabel, IonList, IonListHeader, IonNote } from "@ionic/react"
import type { CategoriesApi, Category } from "cap-store-api-def";
import { useCallback, useEffect, useState } from "react"
import { parseApiError } from "../../utils/parseApiError";

export interface Prop {
    categoryApi: CategoriesApi,
    onClick: (categoryId: string) => void
}

export const CategoryList: React.FC<Prop> = ({
    categoryApi,
    onClick
}) => {

    const [selectedCategoryId, setSelectedCategoryId] = useState<string>();
    const [categories, setCategories] = useState<Category[]>([]);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchCategory = useCallback(async () => {
        try {
            const categoriesRes = await categoryApi.fetchCategories();
            const fetchedCategories = categoriesRes?.data ?? [];
            setCategories(fetchedCategories);
            return fetchedCategories;
        } catch (err) {
            const { message, status } = await parseApiError(err);
            setApiError(`カテゴリ一覧の取得に失敗しました。${message}:${status}`);
            return [];
        }
    }, [categoryApi]);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const handleOnClick = useCallback((categoryId: string) => {
        setSelectedCategoryId(categoryId);
        onClick(categoryId);
    }, [onClick]);

    return (
        <IonList inset={true}>
            <IonListHeader>
                カテゴリ一覧
            </IonListHeader>

            {apiError && (
                <IonItem>
                    <IonNote color="danger">{apiError}</IonNote>
                </IonItem>
            )}

            {categories.length === 0 && (
                <IonItem>
                    <IonNote>プロジェクト登録なし</IonNote>
                </IonItem>
            )}

            {categories &&
                categories.map((category, index) => (
                    <IonItem
                        button
                        detail={false}
                        key={index}
                        color={selectedCategoryId == category.id ? 'primary' : undefined}
                        onClick={() => handleOnClick(category.id)}>
                        <IonLabel>{category.name}</IonLabel>
                    </IonItem>
                ))
            }
        </IonList>
    )
}
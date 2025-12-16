import { IonItem, IonLabel, IonList, IonListHeader, IonLoading, IonNote } from "@ionic/react"
import type { CategoriesApi, } from "cap-store-api-def";
import { useCallback, useState } from "react"
import { UseFetchCategoryApiClient } from "../../api/categories/useFetchCategoryApi";

export interface Prop {
    initCategoryId: string | undefined,
    categoryApi: CategoriesApi,
    onClick: (categoryId: string) => void
}

export const CategoryList: React.FC<Prop> = ({
    initCategoryId,
    categoryApi,
    onClick
}) => {

    const { categories, fetchCategoryError, isLoadingFetchCategory, } = UseFetchCategoryApiClient(categoryApi);

    const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(initCategoryId);

    const handleOnClick = useCallback((categoryId: string) => {
        setSelectedCategoryId(categoryId);
        onClick(categoryId);
    }, [onClick]);

    return (
        <IonList inset={true}>
            <IonListHeader>
                カテゴリ一覧
            </IonListHeader>

            {fetchCategoryError && (
                <IonItem>
                    <IonNote color="danger">{fetchCategoryError?.message}:{fetchCategoryError?.status}</IonNote>
                </IonItem>
            )}

            {isLoadingFetchCategory && (<IonLoading />)}

            {categories.length === 0 && (
                <IonItem>
                    <IonNote>カテゴリー登録なし</IonNote>
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
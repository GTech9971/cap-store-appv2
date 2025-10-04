import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonLabel,
    IonList,
    IonListHeader,
    IonModal,
    IonText,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import "./AkizukiInvoiceModal.css";
import { Item } from "@/types/invoices/item";
import { InvoiceItem } from "@/components/InvoiceItem";
import { useApiClint } from "@/api/useApiClient";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FetchComponentByAkizukiCatalogIdData, FetchComponentByAkizukiCatalogIdRequest, RegistryComponentRequest } from "cap-store-api-def";
import { parseApiError } from "@/utils/parseApiError";
import { useConfirmUtils } from "ui/utils/alertUtils";

type CustomItem = Item & { isUnRegistry: boolean, data?: FetchComponentByAkizukiCatalogIdData };

interface Props {
    isOpen: boolean
}

export const AkizukiInvoiceModal: React.FC<Props> = ({
    isOpen,
}) => {

    const [list, setList] = useState<CustomItem[]>([]);


    const items: Item[] = useMemo(() => {
        const a: Item = {
            catalog_Id: '123456',
            name: '丸ピンICソケット ( 6P)',
            img_url: "/img/goods/M/128818.jpg",
            quantity: 12,
            unit_price: 200
        }

        const b: Item = {
            catalog_Id: '34631',
            name: '積層セラミックコンデンサー 0.1μF50V X7R 2.54mm',
            img_url: "/img/goods/M/109862.jpg",
            quantity: 1,
            unit_price: 100
        }
        return [a, b]
    }, []);

    const [handleConfirm] = useConfirmUtils();
    const { categoryApi, makerApi, akizukiCatalogApi, componentApi } = useApiClint();

    /**
     * データ登録確認
     */
    const checkRegistry = useCallback(async (catalogId: string): Promise<{ isUnRegistry: boolean, data?: FetchComponentByAkizukiCatalogIdData }> => {
        const request: FetchComponentByAkizukiCatalogIdRequest = { catalogId: catalogId };

        let isUnRegistry: boolean = false;
        let data: FetchComponentByAkizukiCatalogIdData | undefined = undefined;
        try {
            const response = await akizukiCatalogApi.fetchComponentByAkizukiCatalogId(request);
            data = response.data;
            isUnRegistry = true;
        } catch (error) {
            const { message, status } = await parseApiError(error);
            console.warn(message, status);
            isUnRegistry = false;
        }
        return { isUnRegistry, data };
    }, [akizukiCatalogApi]);

    const handleUnRegistryData = useCallback(async () => {
        if (await handleConfirm("未登録データを登録します。") === false) { return; }
    }, [handleConfirm]);



    /**
     * カタログIDを使って登録
     */
    const registryComponentByCatalogId = useCallback(async (item: CustomItem, isShowConfirm: boolean) => {
        if (isShowConfirm) {
            if (await handleConfirm(`${item.name}を登録しますか？`) === false) { return; }
        }

        let categoryId: string | undefined = item.data?.categoryId;
        let makerId: string | undefined;
        if (item.data?.unRegistered) {
            const { category, makerName } = item.data.unRegistered;

            if (category) {
                try {
                    const res = await categoryApi.registryCategory({ registryCategoryRequest: category });
                    categoryId = res.data?.categoryId;
                } catch (err: unknown) {
                    const { message, status } = await parseApiError(err);
                    // setApiError(`未登録カテゴリの登録に失敗しました。${message}:${status}`);
                }
            }
            if (makerName) {
                try {
                    const res = await makerApi.registryMaker({ registryMakerRequest: { countryCode: 'JP', name: makerName } });
                    makerId = res.data?.makerId;
                } catch (err) {
                    const { message, status } = await parseApiError(err);
                    // setApiError(`未登録メーカーの登録に失敗しました。${message}:${status}`);
                }
            }

            const request: RegistryComponentRequest = {
                categoryId: categoryId,
                makerId: makerId,
                name: item.data.name,
                modelName: item.data.modelName,
                images: item.data.images,
                description: item.data.description
            }

            const response = await componentApi.registryComponent(request);
        }


    }, [handleConfirm, categoryApi, makerApi, componentApi]);

    // データ整形
    useEffect(() => {
        (async () => {
            const list: CustomItem[] = [];
            for (const item of items) {
                const result = await checkRegistry(item.catalog_Id);
                list.push({ ...item, isUnRegistry: result.isUnRegistry, data: result.data });
            }
            setList(list);
        })();
    }, [checkRegistry, items]);

    return (
        <IonModal isOpen={isOpen}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton>
                            閉じる
                        </IonButton>
                    </IonButtons>

                    <IonTitle>納品書</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" color="light">

                <IonText>
                    <h2>
                        注文番号: E123456-09876123
                    </h2>
                </IonText>

                <IonText>
                    注文日: 2025-02-12
                </IonText>
                <br />
                <IonText>
                    出荷日: 2025-03-12
                </IonText>


                合計: 3,190円
                <IonList inset>
                    <IonListHeader lines="inset">
                        <IonLabel>注文内容</IonLabel>
                        <IonButton disabled={list.some(x => x.isUnRegistry) === false} onClick={handleUnRegistryData}>未登録データ</IonButton>
                    </IonListHeader>
                    {
                        list.map((item, idx) => (
                            <InvoiceItem
                                key={idx}
                                item={item}
                                isUnRegistry={item.isUnRegistry}
                                onClick={() => item.isUnRegistry ? registryComponentByCatalogId(item, true) : undefined}
                            />
                        ))
                    }

                </IonList>

            </IonContent>

        </IonModal>
    )
}
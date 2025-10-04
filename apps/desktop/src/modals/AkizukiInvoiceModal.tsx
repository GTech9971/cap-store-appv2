import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonModal,
    IonNote,
    IonTitle,
    IonToolbar,
    useIonAlert,
    useIonToast
} from "@ionic/react"
import "./AkizukiInvoiceModal.css";
import { Item } from "@/types/invoices/item";
import { InvoiceItem } from "@/components/InvoiceItem";
import { useApiClint } from "@/api/useApiClient";
import { useCallback, useEffect, useState } from "react";
import { FetchComponentByAkizukiCatalogIdData, FetchComponentByAkizukiCatalogIdRequest, Maker, RegistryComponentRequest } from "cap-store-api-def";
import { parseApiError } from "@/utils/parseApiError";
import { useConfirmUtils } from "ui/utils/alertUtils";
import { clipboardOutline, checkmarkOutline } from 'ionicons/icons'
import { writeText } from '@tauri-apps/plugin-clipboard-manager'
import { Invoice } from "@/types/invoices/invoice";

type CustomItem = Item & { isUnRegistry: boolean, data?: FetchComponentByAkizukiCatalogIdData };

interface Props {
    isOpen: boolean,
    invoice: Invoice,
    onClose: () => void
}

export const AkizukiInvoiceModal: React.FC<Props> = ({
    isOpen,
    invoice,
    onClose,
}) => {
    const { categoryApi, makerApi, akizukiCatalogApi, componentApi } = useApiClint();
    const [error, setError] = useState<string>();

    // 納品
    const [list, setList] = useState<CustomItem[]>([]);
    const [makers, setMakers] = useState<Maker[]>([]);

    // ダイアログ系
    const [handleConfirm] = useConfirmUtils();
    const [presentAlert] = useIonAlert();

    // クリップボード
    const [copied, setCopied] = useState<boolean>(false);
    const [presentToast] = useIonToast();


    useEffect(() => {
        (async () => {
            try {
                const makerResponse = await makerApi.fetchMakers();
                setMakers(makerResponse?.data ?? []);
            } catch (error) {
                const { message, status } = await parseApiError(error);
                setError(`メーカーの取得に失敗 ${message}:${status}`);
            }
        })();
    }, [makerApi]);

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

    // データ整形
    useEffect(() => {
        (async () => {
            const list: CustomItem[] = [];
            for (const item of invoice.items) {
                const result = await checkRegistry(item.catalog_id);
                list.push({ ...item, ...result, });
            }
            setList(list);
        })();
    }, [checkRegistry, invoice]);


    /**
     * カタログIDを使って登録
     * @param item
     * @param isShowConfirm
     */
    const registryComponentByCatalogId = useCallback(async (item: CustomItem, isShowConfirm: boolean) => {
        if (isShowConfirm) {
            if (await handleConfirm(`${item.name}を登録しますか？`) === false) { return; }
        }

        // 未登録カテゴリー・メーカー登録
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
                    setError(`未登録カテゴリの登録に失敗しました。${message}:${status}`);
                }
            }
            if (makerName) {
                try {
                    const res = await makerApi.registryMaker({ registryMakerRequest: { countryCode: 'JP', name: makerName } });
                    makerId = res.data?.makerId;
                } catch (err) {
                    const { message, status } = await parseApiError(err);
                    setError(`未登録メーカーの登録に失敗しました。${message}:${status}`);
                }
            }

            if (!makerId) {
                makerId = makers.find(x => x.name === makerName)?.id;
                if (!makerId) { throw new Error(); }
            }

            // 電子部品登録
            const request: RegistryComponentRequest = {
                categoryId: categoryId!,
                makerId: makerId,
                name: item.data.name,
                modelName: item.data.modelName,
                images: item.data.images,
                description: item.data.description,
                currentStock: 0
            }

            try {
                const response = await componentApi.registryComponent({ registryComponentRequest: request });
                // 未登録マークを消す
                setList(prev =>
                    prev.map(x => x.name === item.name
                        ? { ...x, isUnRegistry: false, data: undefined }
                        : x)
                );
                await presentAlert({ header: response.data?.componentId, message: '登録しました。' });
            } catch (error) {
                const { message, status } = await parseApiError(error);
                setError(`電子部品登録に失敗 ${message}:${status}`);
            }
        }
    }, [handleConfirm, presentAlert, categoryApi, makerApi, componentApi, makers,]);


    /**
     * 注文番号をクリップボードにコピー
     */
    const handleCopyOrderId = useCallback(async (orderId: string) => {
        await writeText(orderId);
        await presentToast('注文番号をコピーしました', 1000);
        setCopied(true);
    }, [presentToast]);

    return (
        <IonModal isOpen={isOpen}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start" >
                        <IonButton onClick={onClose}>
                            閉じる
                        </IonButton>
                    </IonButtons>

                    <IonTitle>納品書</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="ion-padding" color="light">

                <IonList inset>
                    <IonItem button detail={false} onClick={() => handleCopyOrderId("123456")}>
                        <IonLabel >注文番号: {invoice.order_id}</IonLabel>
                        <IonIcon color={copied ? 'success' : undefined} icon={copied ? checkmarkOutline : clipboardOutline} />
                    </IonItem>
                    <IonItem>
                        <IonLabel>注文日: {invoice.order_date}</IonLabel>
                    </IonItem>

                    <IonItem>
                        <IonLabel> 出荷日: {invoice.shipping_date}</IonLabel>
                    </IonItem>
                </IonList>

                {error &&
                    <IonNote color='danger'>{error}</IonNote>
                }

                <IonList inset>
                    <IonListHeader lines="inset">
                        <IonLabel>合計: {invoice.items.map(x => x.quantity * x.unit_price).reduce((sum, x) => sum + x)}円</IonLabel>
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
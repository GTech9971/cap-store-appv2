import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonRow,
  IonSearchbar,
  IonSplitPane,
  IonText,
  IonTitle,
  IonToolbar,
  useIonAlert
} from "@ionic/react";
import { ComponentCard } from "ui/components/ComponentCard";
import { useApiClint } from "../api/useApiClient";
import { Category, Maker, PartsComponent } from "cap-store-api-def";
import { parseApiError } from "../utils/parseApiError";
import { menuOutline, addOutline, documentOutline } from "ionicons/icons"
import { ComponentRegisterModal } from 'ui/components/ComponentRegisterModal';
import { useNavigate } from "react-router-dom";

// tauri
import { useTauriDragDrop } from "@/hooks/useTauriDragDrop";
import { open } from '@tauri-apps/plugin-dialog';

import { Invoice } from "@/types/invoices/invoice";
import { useInvoice } from "@/hooks/useInvoice";
import { AkizukiInvoiceModal } from "@/modals/AkizukiInvoiceModal";

function Home() {
  const [hiddenMenu, setHiddenMenu] = useState<boolean>(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [components, setComponents] = useState<PartsComponent[]>([]); // cap-store-api-def より
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [componentApiError, setComponentApiError] = useState<string | null>(null);

  const [categoryApiError, setCategoryApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [makerApiError, setMakerApiError] = useState<string | null>(null);
  const [makers, setMakers] = useState<Maker[]>([]);

  const { categoryApi, makerApi, componentApi, akizukiCatalogApi } = useApiClint();

  const navigate = useNavigate();

  // 登録モーダル
  const [isOpenCModal, setIsOpenCModal] = useState<boolean>(false);

  // 納品書
  const { parseInvoice, presentInvoice } = useInvoice();
  const [invoice, setInvoice] = useState<Invoice>();
  const [isOpenIModal, setIsIModal] = useState<boolean>(false);
  const [present] = useIonAlert();

  // 検索フィルタリングされたコンポーネント
  const filteredComponents = components.filter(component => {
    if (!searchQuery.trim()) return true;

    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    const componentName = component.name.toLowerCase();
    const modelName = component.modelName?.toLowerCase() || '';

    return searchTerms.some(term =>
      componentName.includes(term) || modelName.includes(term)
    );
  });

  // カテゴリ一覧を取得する共通処理
  const fetchCategoriesList = useCallback(async (): Promise<Category[]> => {
    try {
      const categoriesRes = await categoryApi.fetchCategories();
      const fetchedCategories = categoriesRes?.data ?? [];
      setCategories(fetchedCategories);
      return fetchedCategories;
    } catch (err) {
      const { message, status } = await parseApiError(err);
      setCategoryApiError(`カテゴリ一覧の取得に失敗しました。${message}:${status}`);
      return [];
    }
  }, [categoryApi]);

  const fetchMakersList = useCallback(async (): Promise<Maker[]> => {
    try {
      const makersRes = await makerApi.fetchMakers();
      const fetchedMakers = makersRes?.data ?? [];
      setMakers(fetchedMakers);
      return fetchedMakers;
    } catch (err) {
      const { message, status } = await parseApiError(err);
      setMakerApiError(`メーカー一覧の取得に失敗しました。${message}:${status}`);
      return [];
    }
  }, [makerApi]);

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    try {
      const res = await categoryApi.fetchComponentsByCategoryId({ categoryId: categoryId });
      setComponents(res?.data ?? []);
    } catch (err) {
      const { message, status } = await parseApiError(err);
      setComponentApiError(`部品一覧の取得に失敗しました。${message}:${status}`);
    }
  }



  useEffect(() => {
    // 初期データ取得
    const fetchInitialData = async () => {
      const results: Category[] = await fetchCategoriesList();
      // 初期カテゴリがあれば部品を取得
      if (results.length > 0) {
        const initialCategoryId = results[0].id;
        setSelectedCategoryId(initialCategoryId);
        try {
          const componentsRes = await categoryApi.fetchComponentsByCategoryId({ categoryId: initialCategoryId });
          setComponents(componentsRes?.data ?? []);
        } catch (err) {
          const { message, status } = await parseApiError(err);
          setComponentApiError(`初期カテゴリの部品取得に失敗しました。${message}:${status}`);
        }

        await fetchMakersList();
      }
    };
    fetchInitialData();
  }, [categoryApi, fetchCategoriesList, fetchMakersList]);


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    // setGreetMsg(await invoke("greet", { name }));
  }

  // ドラックアンドドロップ
  useTauriDragDrop(async (event) => {
    if (event.type !== 'drop') { return; }

    const paths: string[] = event.paths ?? [];
    if (paths.length === 0) { return; }
    console.log(paths);

    const result: Invoice = await parseInvoice(paths[0]);
    if (result) {
      setInvoice(result);
      setIsIModal(true);
    }
    console.log(result);
  });



  const openInvoiceFile = useCallback(async () => {
    const path: string | null = await open({
      title: '納品書を開く',
      multiple: false,
      directory: false,
      filters: [{ name: 'html', extensions: ['html'] }]
    })
    console.log(path);
    if (!path) { return; }

    const result = await parseInvoice(path);
    console.log(result);

    if (result) {
      setInvoice(result);
      setIsIModal(true);
    }

  }, [parseInvoice]);


  return (

    <IonSplitPane when="xs" contentId="main" disabled={hiddenMenu}>
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>CapStoreApp</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList inset={true}>
            <IonListHeader>
              カテゴリ一覧
            </IonListHeader>
            {categories &&
              categories.map((category, index) => (
                <IonItem button detail={false} key={index} color={selectedCategoryId == category.id ? 'primary' : undefined} onClick={() => handleCategorySelect(category.id)}>
                  <IonLabel>{category.name}</IonLabel>
                </IonItem>
              ))
            }
          </IonList>

          <IonList inset>
            <IonListHeader>
              ファイル
            </IonListHeader>
            <IonItem button detail={false} onClick={openInvoiceFile}>
              <IonIcon slot="start" icon={documentOutline} />
              <IonLabel>納品書</IonLabel>
            </IonItem>
          </IonList>


        </IonContent>
      </IonMenu>
      <div className="ion-page" id="main">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start" onClick={() => setHiddenMenu(!hiddenMenu)}>
              <IonButton slot="icon">
                <IonIcon icon={menuOutline} />
              </IonButton>
            </IonButtons>
            <IonTitle>CapStoreApp v2</IonTitle>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar value={searchQuery} onIonBlur={e => setSearchQuery(e.target.value ?? '')} placeholder="部品を検索"></IonSearchbar>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonText>
            {selectedCategoryId ? `「${selectedCategoryId}」の部品一覧` : `カテゴリーの取得失敗`}
          </IonText>
          <br />
          <IonText>{categories.length}件の部品が見つかりました</IonText>

          <IonGrid>
            {
              Array.from({ length: Math.ceil(filteredComponents.length / 4) }, (_, rowIndex) => filteredComponents.slice(rowIndex * 4, (rowIndex + 1) * 4)).map((rowItems, index) => (
                <IonRow key={index}>
                  {rowItems.map(item => (
                    <IonCol key={item.id}>
                      <ComponentCard id={item.id} name={item.name} model={item.modelName} img={item.images ? item.images[0] : ''} currentStock={item.currentStock}
                        onClick={() => navigate(`/parts/${item.id}`)}>
                      </ComponentCard>
                    </IonCol>
                  ))}
                </IonRow>
              ))
            }
          </IonGrid>

        </IonContent>
      </div>


      <IonFab vertical="bottom" horizontal="end">
        <IonFabButton onClick={() => setIsOpenCModal(true)}>
          <IonIcon icon={addOutline} />
        </IonFabButton>
      </IonFab>

      <ComponentRegisterModal
        isOpen={isOpenCModal}
        onClose={() => setIsOpenCModal(false)}
        categoryApi={categoryApi}
        makerApi={makerApi}
        componentApi={componentApi}
        akizukiApi={akizukiCatalogApi}
      />

      {invoice &&
        <AkizukiInvoiceModal
          isOpen={isOpenIModal}
          invoice={invoice}
          onClose={() => setIsIModal(false)}
        />
      }


    </IonSplitPane>

  );
}

export default Home;

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
  IonMenu,
  IonRow,
  IonSearchbar,
  IonSplitPane,
  IonText,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { ComponentCard } from "ui/components/ComponentCard";
import { useApiClint } from "../api/useApiClient";
import { Category, Maker, PartsComponent } from "cap-store-api-def";
import { parseApiError } from "../utils/parseApiError";
import { menuOutline, addOutline } from "ionicons/icons"
import { ComponentRegisterModal } from 'ui/components/ComponentRegisterModal';
import { useNavigate } from "react-router-dom";

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

  return (

    <IonSplitPane when="xs" contentId="main" disabled={hiddenMenu}>
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>カテゴリ一覧</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonList>
            {categories &&
              categories.map((category, index) => (
                <IonItem button detail={false} key={index} color={selectedCategoryId == category.id ? 'primary' : undefined} onClick={() => handleCategorySelect(category.id)}>
                  <IonLabel>{category.name}</IonLabel>
                </IonItem>
              ))
            }
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

    </IonSplitPane>

  );
}

export default Home;

import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { IonCol, IonContent, IonGrid, IonHeader, IonItem, IonLabel, IonList, IonMenu, IonRow, IonSearchbar, IonSplitPane, IonText, IonTitle, IonToolbar } from "@ionic/react";
import { ComponentCard } from "ui/components/ComponentCard";
import { useApiClint } from "./api/useApiClient";
import { Category, PartsComponent } from "cap-store-api-def";
import { parseApiError } from "./utils/parseApiError";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const [components, setComponents] = useState<PartsComponent[]>([]); // cap-store-api-def より
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [componentApiError, setComponentApiError] = useState<string | null>(null);

  const [categoryApiError, setCategoryApiError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const { categoryApi, makerApi } = useApiClint();


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
      }
    };
    fetchInitialData();
  }, [categoryApi, fetchCategoriesList]);


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

  return (

    <IonSplitPane contentId="main">
      <IonMenu contentId="main" >
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
            <IonTitle>CapStoreApp v2</IonTitle>
          </IonToolbar>
          <IonToolbar>
            <IonSearchbar value={searchQuery} onIonBlur={e => setSearchQuery(e.target.value ?? '')} placeholder="部品を検索"></IonSearchbar>
          </IonToolbar>
        </IonHeader>
        <IonContent fullscreen>
          <IonText>
            {`「${selectedCategoryId}」の部品一覧`}
          </IonText>
          <br />
          <IonText>{categories.length}件の部品が見つかりました</IonText>

          <IonGrid>
            {
              Array.from({ length: Math.ceil(filteredComponents.length / 4) }, (_, rowIndex) => filteredComponents.slice(rowIndex * 4, (rowIndex + 1) * 4)).map((rowItems, index) => (
                <IonRow key={index}>
                  {rowItems.map(item => (
                    <IonCol key={item.id}>
                      <ComponentCard id={item.id} name={item.name} model={item.modelName} img={item.images ? item.images[0] : ''} currentStock={item.currentStock}>
                      </ComponentCard>
                    </IonCol>
                  ))}
                </IonRow>
              ))
            }
          </IonGrid>

          <ComponentCard id="" name="PIC16F1855" model="PIC16F1827-IP" img="https://akizukidenshi.com/img/goods/L/104430.jpg" currentStock={5} />
        </IonContent>
      </div>

    </IonSplitPane>

  );
}

export default App;

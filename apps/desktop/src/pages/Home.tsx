import { useCallback, useEffect, useState } from "react";
import {
  IonAvatar,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonChip,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonFooter,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonNote,
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
import { Category, Maker, PartsComponent, Project } from "cap-store-api-def";
import { parseApiError } from "../utils/parseApiError";
import { menuOutline, addOutline, documentOutline } from "ionicons/icons"
import { ComponentRegisterModal } from 'ui/components/ComponentRegisterModal';
import { useNavigate } from "react-router-dom";

// tauri
import { DragDropEvent, useTauriDragDrop } from "@/hooks/useTauriDragDrop";
import { open } from '@tauri-apps/plugin-dialog';

import { Invoice } from "@/types/invoices/invoice";
import { useInvoice } from "@/hooks/useInvoice";
import { AkizukiInvoiceModal } from "@/modals/AkizukiInvoiceModal";
import { useOktaAuth } from "@okta/okta-react";

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

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectApiError, setProjectApiError] = useState<string | null>(null);

  const getProjectStatusLabel = useCallback((status: string) => {
    switch (status) {
      case "planning":
        return "計画中";
      case "processing":
        return "進行中";
      case "pause":
        return "一時停止";
      case "cancel":
        return "中止";
      case "complete":
        return "完了";
      default:
        return status;
    }
  }, []);

  const { categoryApi, makerApi, componentApi, projectApi, akizukiCatalogApi } = useApiClint();

  const [presentAlert] = useIonAlert();

  const navigate = useNavigate();

  // 登録モーダル
  const [isOpenCModal, setIsOpenCModal] = useState<boolean>(false);

  // 納品書
  const { parseInvoice } = useInvoice();
  const [invoice, setInvoice] = useState<Invoice>();
  const [isOpenIModal, setIsIModal] = useState<boolean>(false);

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

  /** メーカー取得 */
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

  /**
   * カテゴリー選択
   * @param categoryId 
   */
  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    try {
      const response = await categoryApi.fetchComponentsByCategoryId({ categoryId: categoryId });
      setComponents(response?.data ?? []);
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

  useEffect(() => {
    const fetchProjects = async () => {
      setProjectApiError(null);
      try {
        const res = await projectApi.fetchProjects({ pageIndex: 1, pageSize: 20 });
        setProjects(res?.data ?? []);
      } catch (err) {
        const { message, status } = await parseApiError(err);
        setProjectApiError(`プロジェクト一覧の取得に失敗しました。${message}${status ? `:${status}` : ''}`);
        setProjects([]);
      }
    };
    fetchProjects();
  }, [projectApi]);


  /**
   * ドラッグドロップ処理
   */
  const DragDropHandler = useCallback(async (event: DragDropEvent) => {
    if (event.type !== 'drop') { return; }

    const paths: string[] = event.paths ?? [];
    if (paths.length === 0) { return; }
    console.debug(paths);
    try {
      const result: Invoice = await parseInvoice(paths[0]);
      if (result) {
        setInvoice(result);
        setIsIModal(true);
      }
      console.debug(result);
    } catch (err: unknown) {
      console.error(err);
      await presentAlert({ header: 'エラー', message: (err as Error).message });
    }

  }, [parseInvoice, presentAlert])

  // ドラックアンドドロップ
  useTauriDragDrop(DragDropHandler);


  /**
   * 納品書をファイルダイアログで開く
   */
  const openInvoiceFile = useCallback(async () => {
    const path: string | null = await open({
      title: '納品書を開く',
      multiple: false,
      directory: false,
      filters: [{ name: 'html', extensions: ['html'] }]
    })
    console.debug(path);
    if (!path) { return; }

    try {
      const result = await parseInvoice(path);
      console.debug(result);
      if (result) {
        setInvoice(result);
        setIsIModal(true);
      }
    } catch (err: unknown) {
      console.error(err);
      await presentAlert({ header: 'エラー', message: (err as Error).message });
    }
  }, [parseInvoice, presentAlert]);

  // okta系
  const { authState, oktaAuth } = useOktaAuth();
  // ユーザー名取得用 state
  const [userName, setUserName] = useState<string>('');

  // 認証状態変化時にユーザー情報を取得
  useEffect(() => {
    (async () => {
      if (authState?.isAuthenticated) {
        const user = await oktaAuth.getUser();
        setUserName(user.name || '');
      }
    })();
  }, [authState, oktaAuth]);


  return (

    <IonSplitPane when="xs" contentId="main" disabled={hiddenMenu}>
      <IonMenu contentId="main">
        <IonHeader>
          <IonToolbar>
            <IonTitle>CapStoreApp</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding" color="light">
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
              <IonLabel>プロジェクト</IonLabel>
              <IonButton onClick={() => navigate('/projects/new')}>追加</IonButton>
            </IonListHeader>
            {projectApiError ? (
              <IonItem>
                <IonNote color="danger">{projectApiError}</IonNote>
              </IonItem>
            ) : projects.length === 0 ? (
              <IonItem>
                <IonNote>プロジェクト登録なし</IonNote>
              </IonItem>
            ) : (
              projects.map((project) => (
                <IonItem
                  key={project.id}
                  button
                  detail={false}
                  onClick={() => navigate(`/projects?projectId=${project.id}`)}
                >
                  <IonLabel>
                    <IonText>{project.name}</IonText>
                    <IonNote>{project.summary ?? '-'}</IonNote>
                  </IonLabel>
                  <IonBadge slot="end">{getProjectStatusLabel(project.status)}</IonBadge>
                </IonItem>
              ))
            )}
          </IonList>

          <IonList inset>
            <IonListHeader>
              納品書
            </IonListHeader>
            <IonItem button detail={false} onClick={openInvoiceFile}>
              <IonIcon slot="start" icon={documentOutline} />
              <IonLabel>アップロード</IonLabel>
            </IonItem>
          </IonList>

        </IonContent>

        {/* フッター アカウント系 */}
        <IonFooter translucent className="ion-no-border">
          <IonList inset>
            <IonItem>
              {
                authState?.isAuthenticated ? (
                  <>
                    <IonChip>
                      <IonAvatar>
                        <img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" />
                      </IonAvatar>
                      <IonLabel>{userName}</IonLabel>
                    </IonChip>

                    <IonButton slot="end" fill="clear" onClick={() => oktaAuth.signOut()}>ログアウト</IonButton>
                  </>

                ) : (
                  <IonLabel color='primary'>
                    <IonButton fill="clear" onClick={() => oktaAuth.signInWithRedirect()}>ログイン</IonButton>
                  </IonLabel>
                )
              }
            </IonItem>
          </IonList>
        </IonFooter>

      </IonMenu>
      <div className="ion-page" id="main">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start" onClick={() => setHiddenMenu(!hiddenMenu)}>
              <IonButton slot="icon">
                <IonIcon icon={menuOutline} />
              </IonButton>
            </IonButtons>

            <IonTitle>{selectedCategoryId ? `「${selectedCategoryId}」の部品一覧` : `カテゴリーの取得失敗`}</IonTitle>
          </IonToolbar>

          <IonToolbar>
            <IonSearchbar value={searchQuery} onIonBlur={e => setSearchQuery(e.target.value ?? '')} placeholder="部品を検索"></IonSearchbar>
          </IonToolbar>
        </IonHeader>


        <IonContent fullscreen className="ion-padding" color="light">

          <IonItem lines="none" color='light'>
            <IonBadge color='secondary'>{filteredComponents.length}件</IonBadge>
            <IonText>の部品が見つかりました</IonText>
          </IonItem>

          {/* 以下を記載しないと電子部品カードの表示がされないことの予想だが、事前にスタイル設定を1度でも読み込まないと後から動的に追加した際に反映されない？ */}
          <IonCard style={{ display: 'none' }}></IonCard>

          <IonGrid className="ion-padding">
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

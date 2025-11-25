import { useCallback, useMemo, useState } from "react";
import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
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
  IonLoading,
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
import { ProjectList } from "ui/components/projects/ProjectList"
import { CategoryList } from "ui/components/categories/CategoryList"
import { menuOutline, addOutline, documentOutline } from "ionicons/icons"
import { ComponentRegisterModal } from 'ui/components/ComponentRegisterModal';
import { useFetchComponentsApi } from 'ui/api/components/useFetchComponentsApi';
import { useNavigate } from "react-router-dom";

// tauri
import { DragDropEvent, useTauriDragDrop } from "@/hooks/useTauriDragDrop";
import { open } from '@tauri-apps/plugin-dialog';

import { Invoice } from "@/types/invoices/invoice";
import { useInvoice } from "@/hooks/useInvoice";
import { AkizukiInvoiceModal } from "@/modals/AkizukiInvoiceModal";
import { ErrorNote } from "ui/components/ErrorNote";
import { AuthFooter } from "@/components/AuthFooter";
import { LocationList } from "ui/components/locations/LocationList";

function Home() {
  const [hiddenMenu, setHiddenMenu] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const { categoryApi, makerApi, componentApi, projectApi, akizukiCatalogApi } = useApiClint();

  const [presentAlert] = useIonAlert();

  const navigate = useNavigate();

  // 登録モーダル
  const [isOpenCModal, setIsOpenCModal] = useState<boolean>(false);

  // 納品書
  const { parseInvoice } = useInvoice();
  const [invoice, setInvoice] = useState<Invoice>();
  const [isOpenIModal, setIsIModal] = useState<boolean>(false);

  const [categoryId, setCategoryId] = useState<string | undefined>();
  const { components, isLoadingFetchComponents, fetchComponentsError, refreshComponents } = useFetchComponentsApi(categoryApi, categoryId);


  // 検索フィルタリングされたコンポーネント
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      if (!searchQuery.trim()) return true;

      const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/);
      const componentName = component.name.toLowerCase();
      const modelName = component.modelName?.toLowerCase() || '';

      return searchTerms.some(term =>
        componentName.includes(term) || modelName.includes(term)
      );
    });
  }, [components, searchQuery]);

  /**
   * カテゴリー選択
   * @param categoryId 
   */
  const handleCategorySelect = useCallback(async (categoryId: string) => {
    setCategoryId(categoryId);
    await refreshComponents();
  }, [refreshComponents]);


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




  return (

    <IonSplitPane when="xs" contentId="main" disabled={hiddenMenu}>
      <IonMenu contentId="main">
        <IonContent className="ion-padding" color="light">

          <CategoryList
            onClick={handleCategorySelect}
            categoryApi={categoryApi} />

          <LocationList
            onClickNorthRoom={() => navigate("/locations/north-room")} />

          <ProjectList
            projectApi={projectApi}
            onClickAdd={() => navigate('/projects/new')}
            onClickProject={(id) => navigate(`/projects/${id}`)} />

          <IonList inset>
            <IonListHeader>
              納品書
            </IonListHeader>
            <IonItem lines="none" button detail={false} onClick={openInvoiceFile}>
              <IonIcon slot="start" icon={documentOutline} />
              <IonLabel>アップロード</IonLabel>
            </IonItem>
          </IonList>

        </IonContent>

        {/* フッター アカウント系 */}
        <AuthFooter />

      </IonMenu>
      <div className="ion-page" id="main">
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start" onClick={() => setHiddenMenu(!hiddenMenu)}>
              <IonButton slot="icon">
                <IonIcon icon={menuOutline} />
              </IonButton>
            </IonButtons>

            <IonTitle>{categoryId ? `「${categoryId}」の部品一覧` : `カテゴリー未選択`}</IonTitle>
          </IonToolbar>

          <IonToolbar>
            <IonSearchbar value={searchQuery} onIonBlur={e => setSearchQuery(e.target.value ?? '')} placeholder="部品を検索"></IonSearchbar>
          </IonToolbar>
        </IonHeader>


        <IonContent fullscreen className="ion-padding" color="light">

          <IonItem lines="none" color='light'>
            <IonBadge color='secondary'>{filteredComponents.length}件</IonBadge>
            <IonText>の部品が見つかりました</IonText>
            <ErrorNote error={fetchComponentsError} />
          </IonItem>

          {/* 以下を記載しないと電子部品カードの表示がされないことの予想だが、事前にスタイル設定を1度でも読み込まないと後から動的に追加した際に反映されない？ */}
          <IonCard style={{ display: 'none' }}></IonCard>

          <IonGrid className="ion-padding">
            {isLoadingFetchComponents && (<IonLoading />)}

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

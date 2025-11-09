import React, { useCallback, useMemo, useState } from 'react';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonList,
  IonNote,
  IonText,
  IonListHeader,
  IonThumbnail,
  IonImg,
  IonSearchbar
} from '@ionic/react';
import type { CategoriesApi, PartsComponent } from 'cap-store-api-def';
import { UseFetchCategoryApiClient } from '../../api/categories/useFetchCategoryApi';
import { useFetchComponentsApi } from '../../api/components/useFetchComponentsApi';
import { ErrorNote } from '../ErrorNote';

type Props = {
  isOpen: boolean;
  categoryApi: CategoriesApi;
  onClose: () => void;
  onSelect: (component: PartsComponent) => void;
};

/**
 * コンポーネント検索モーダル
 * - フリーワード検索（name / modelName / id / maker名）
 * - ID 検索（入力IDに完全一致するものを優先表示）
 * - 選択で onSelect を返却
 */
export const ComponentSearchModal: React.FC<Props> = ({
  isOpen,
  categoryApi,
  onClose,
  onSelect,
}) => {
  const { categories, fetchCategoryError } = UseFetchCategoryApiClient(categoryApi);

  const [categoryId, setCategoryId] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');

  const { components, fetchComponentsError } = useFetchComponentsApi(categoryApi, categoryId || undefined);

  // 取得済みデータをキーワードで絞り込む
  const filtered = useMemo((): PartsComponent[] => {
    if (!components || components.length === 0) return [];
    const q = keyword.trim().toLowerCase();
    if (!q) return components;

    return components.filter((c) => {
      const makerName = c.maker?.name ?? '';
      return (
        c.id?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.modelName?.toLowerCase().includes(q) ||
        makerName?.toLowerCase().includes(q)
      );
    });
  }, [components, keyword]);

  const handleClear = useCallback(() => {
    setCategoryId('');
    setKeyword('');
  }, []);

  const handleSelect = useCallback((c: PartsComponent) => {
    onSelect?.(c);
    onClose?.();
  }, [onClose, onSelect]);

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>コンポーネント検索</IonTitle>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={onClose}>閉じる</IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton fill="clear" onClick={handleClear}>クリア</IonButton>
          </IonButtons>
        </IonToolbar>

        <IonToolbar>
          <IonSearchbar
            onIonChange={(e) => setKeyword(e.detail.value ?? '')}
            value={keyword}
            placeholder='フリーワード(名称・型番・メーカーなど)' />
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" color='light'>
        <ErrorNote error={fetchCategoryError} />
        <ErrorNote error={fetchComponentsError} />

        <IonList inset>
          <IonItem>
            <IonLabel position="stacked">カテゴリ</IonLabel>
            <IonSelect
              value={categoryId}
              interface="popover"
              placeholder="選択してください"
              onIonChange={(e) => setCategoryId(e.detail.value)}>
              {categories.map((cat) => (
                <IonSelectOption key={cat.id} value={cat.id}>{cat.name}</IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
        </IonList>

        {/* 結果表示 */}
        <IonList inset>
          <IonListHeader>
            <IonText color="medium">
              検索結果
              {categoryId
                ? <></>
                : <IonNote>（カテゴリを選択すると表示されます）</IonNote>}
            </IonText>
          </IonListHeader>

          {filtered.map((c) => (
            <IonItem
              key={c.id}
              button
              detail={false}
              onClick={() => handleSelect(c)}>

              <IonThumbnail>
                <IonImg src={c.images ? c.images[0] : undefined} />
              </IonThumbnail>

              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{c.name}</strong>
                  <IonNote>{c.id}</IonNote>
                </div>
                <IonText color="medium" style={{ fontSize: '12px' }}>{c.modelName}</IonText>
              </div>
            </IonItem>
          ))}

          {categoryId && filtered.length === 0 && (
            <IonItem lines='none'>
              <IonNote color="medium">該当する結果がありません</IonNote>
            </IonItem>
          )}
        </IonList>
      </IonContent>
    </IonModal>
  );
};

export default ComponentSearchModal;

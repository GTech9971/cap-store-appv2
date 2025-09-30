import React from 'react';
import {
    IonText,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
    IonAlert
} from '@ionic/react';
import ImageCarousel from './ImageCarousel';

interface Category {
    id: string;
    name: string;
}

interface Maker {
    id: string;
    name: string;
}

interface FormData {
    name: string;
    modelName: string;
    categoryId: string;
    makerId: string;
    description: string;
    images: string[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    form?: FormData;
    errors?: Partial<Record<keyof FormData, string>>;
    categories?: Category[];
    makers?: Maker[];
    akizukiCode?: string;
    imageUrls?: string[];
    apiError?: string | null;
    showAlert?: boolean;
    alertMessage?: string;
    onFormChange?: (field: keyof FormData, value: any) => void;
    onAkizukiCodeChange?: (value: string) => void;
    onImageUrlChange?: (urls: string[]) => void;
    onSubmit?: () => void;
    onFetchFromAkizuki?: () => void;
    onImageDelete?: (index: number) => void;
    onAlertDismiss?: () => void;
}

export const ComponentRegisterModal: React.FC<Props> = ({
    isOpen,
    onClose,
    form = { name: '', modelName: '', categoryId: '', makerId: '', description: '', images: [] },
    errors = {},
    categories = [],
    makers = [],
    akizukiCode = '',
    imageUrls = [],
    apiError = null,
    showAlert = false,
    alertMessage = '',
    onFormChange,
    onAkizukiCodeChange,
    onImageUrlChange,
    onSubmit,
    onFetchFromAkizuki,
    onImageDelete,
    onAlertDismiss,
}) => {

    return (
        <>
            <IonModal isOpen={isOpen} onDidDismiss={onClose}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>コンポーネント登録</IonTitle>
                        <IonButtons slot="start">
                            <IonButton fill="clear" onClick={onClose}>
                                キャンセル
                            </IonButton>
                        </IonButtons>
                        <IonButtons slot="end">
                            <IonButton fill="clear" onClick={onSubmit}>
                                登録
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {apiError && (
                        <IonNote color="danger" className="ion-padding">
                            {apiError}
                        </IonNote>
                    )}

                    <IonItem>
                        <IonInput
                            labelPlacement="stacked"
                            placeholder="URLまたは通販コード"
                            value={akizukiCode}
                            onIonInput={(e) => onAkizukiCodeChange?.(e.detail.value!)}
                        >
                            <div slot="label">秋月電子通販コード</div>
                        </IonInput>
                        <IonButton
                            fill="outline"
                            size="small"
                            slot="end"
                            onClick={onFetchFromAkizuki}
                        >
                            取得
                        </IonButton>
                    </IonItem>

                    <IonGrid>
                        <IonRow>
                            <IonCol size="12" sizeMd="6">
                                <ImageCarousel
                                    images={form.images || []}
                                    onDelete={(index) => {
                                        const updated = (form.images || []).filter((_, i) => i !== index);
                                        onFormChange?.('images', updated);
                                        onImageDelete?.(index);
                                    }}
                                />
                                <IonItem>
                                    <IonInput
                                        placeholder='画像URL（カンマ区切りで複数可）'
                                        value={form.images?.join(', ') || ''}
                                        onIonInput={(e) => {
                                            const urls = (e.detail.value as string).split(',').map(url => url.trim()).filter(url => url);
                                            onFormChange?.('images', urls);
                                            onImageUrlChange?.(urls);
                                        }}
                                    >
                                    </IonInput>
                                </IonItem>
                            </IonCol>
                            <IonCol size="12" sizeMd="6">
                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={form.name}
                                        onIonInput={(e) => onFormChange?.('name', e.detail.value)}
                                    >
                                        <div slot="label">名称 <IonText color="danger">*</IonText></div>
                                    </IonInput>
                                    {errors.name && (
                                        <IonNote color="danger" slot="helper">
                                            {errors.name}
                                        </IonNote>
                                    )}
                                </IonItem>

                                <IonItem>
                                    <IonInput
                                        labelPlacement="stacked"
                                        required
                                        value={form.modelName}
                                        onIonInput={(e) => onFormChange?.('modelName', e.detail.value)}
                                    >
                                        <div slot="label">型番 <IonText color="danger">*</IonText></div>
                                    </IonInput>
                                    {errors.modelName && (
                                        <IonNote color="danger" slot="helper">
                                            {errors.modelName}
                                        </IonNote>
                                    )}
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked">カテゴリ <span style={{ color: 'red' }}>*</span></IonLabel>
                                    <IonSelect
                                        required
                                        labelPlacement='stacked'
                                        value={form.categoryId}
                                        onIonChange={(e) => onFormChange?.('categoryId', e.detail.value)}
                                        placeholder="選択してください"
                                    >
                                        {categories.map(cat => (
                                            <IonSelectOption key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                    {errors.categoryId && (
                                        <IonNote color="danger" slot="helper">
                                            {errors.categoryId}
                                        </IonNote>
                                    )}
                                </IonItem>

                                <IonItem>
                                    <IonLabel position="stacked">メーカー <span style={{ color: 'red' }}>*</span></IonLabel>
                                    <IonSelect
                                        value={form.makerId}
                                        onIonChange={(e) => onFormChange?.('makerId', e.detail.value)}
                                        placeholder="選択してください"
                                    >
                                        {makers.map((maker, index) => (
                                            <IonSelectOption key={index} value={maker.id}>
                                                {maker.name}
                                            </IonSelectOption>
                                        ))}
                                    </IonSelect>
                                    {errors.makerId && (
                                        <IonNote color="danger" slot="helper">
                                            {errors.makerId}
                                        </IonNote>
                                    )}
                                </IonItem>
                            </IonCol>
                        </IonRow>
                    </IonGrid>

                    <IonItem>
                        <IonTextarea
                            placeholder='説明・仕様'
                            value={form.description}
                            onIonInput={(e) => onFormChange?.('description', e.detail.value)}
                            rows={4}
                        />
                    </IonItem>
                </IonContent>
            </IonModal>

            <IonAlert
                isOpen={showAlert}
                onDidDismiss={onAlertDismiss}
                header="完了"
                message={alertMessage}
                buttons={['OK']}
            />
        </>
    );
};
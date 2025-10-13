import { useCallback, useEffect, useState } from "react"
import {
    IonBadge,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonModal,
    IonText,
    IonThumbnail,
    IonTitle,
    IonToolbar
} from "@ionic/react"
import { closeOutline } from "ionicons/icons"
import type { ImageLink } from "./ImageLinkCarousel"
import { Editable } from "../editable/Editable"

export interface Prop {
    isOpen: boolean
    images: ImageLink[]
    onChange?: (images: ImageLink[]) => void
    onDismiss: () => void
}

export const ImageLinkCarouselSelectModal: React.FC<Prop> = ({
    isOpen,
    images,
    onChange,
    onDismiss
}) => {
    const [localImages, setLocalImages] = useState<ImageLink[]>(images);
    const [newImageInput, setNewImageInput] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setLocalImages(images);
            setNewImageInput("");
        }
    }, [isOpen, images]);

    const handleRemoveImage = useCallback((url: string) => {
        setLocalImages((prev) => prev.filter((item) => item.url !== url));
    }, []);

    const updateImage = useCallback((url: string, updater: (image: ImageLink) => ImageLink) => {
        setLocalImages((prev) =>
            prev.map((item) => (item.url === url ? updater(item) : item))
        );
    }, []);

    const handleTitleCommit = useCallback((url: string, value: string) => {
        const trimmed = value.trim();
        const nextTitle = trimmed.length > 0 ? trimmed : "タイトル無し";
        updateImage(url, (image) => ({
            ...image,
            title: nextTitle
        }));
    }, [updateImage]);

    const handleTagCommit = useCallback((url: string, value: string) => {
        const trimmed = value.trim();
        const nextTag = trimmed.length > 0 ? trimmed : "タグ無し";
        updateImage(url, (image) => ({
            ...image,
            tag: nextTag
        }));
    }, [updateImage]);



    const handleAddImage = useCallback(() => {
        const candidates = newImageInput
            .split(",")
            .map((url) => url.trim())
            .filter((url) => url.length > 0);

        if (candidates.length === 0) { return }

        setLocalImages((prev) => {
            const next = [...prev];
            candidates.forEach((url) => {
                if (!next.find(x => x.url === url)) {
                    next.push({ title: 'タイトル無し', tag: 'タグ無し', url: url });
                }
            })
            return next;
        });
        setNewImageInput("");
    }, [newImageInput]);

    const handleKeydown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && newImageInput) {
            handleAddImage();
        };
    }, [newImageInput, handleAddImage]);

    const handleCancel = useCallback(() => {
        setLocalImages(images)
        setNewImageInput("")
        onDismiss()
    }, [onDismiss, images])

    const handleSave = useCallback(() => {
        onChange?.(localImages)
        onDismiss()
    }, [onChange, localImages, onDismiss])

    return (
        <IonModal isOpen={isOpen} backdropDismiss={false}>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonButton fill="clear" onClick={handleCancel}>
                            キャンセル
                        </IonButton>
                    </IonButtons>
                    <IonTitle>画像の編集</IonTitle>
                    <IonButtons slot="end">

                        <IonButton fill="clear" onClick={handleSave}>
                            保存
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonList inset>
                    {localImages.map((link) => (
                        <IonItem key={link.url}>
                            <IonThumbnail>
                                <IonImg src={link.url} />
                            </IonThumbnail>
                            <IonLabel style={{ whiteSpace: "normal" }}>
                                {link.url}
                                <Editable
                                    text={link.title ?? "タイトル無し"}
                                    defaultText="タイトル無し"
                                    onCommit={(value) => handleTitleCommit(link.url, value)}>
                                    <p />
                                </Editable>
                            </IonLabel>



                            <Editable
                                text={link.tag ?? "タグ無し"}
                                defaultText="タグ無し"
                                onCommit={(value) => handleTagCommit(link.url, value)}>
                                <IonBadge />
                            </Editable>


                            <IonButton
                                slot="end"
                                fill="clear"
                                color="danger"
                                onClick={() => handleRemoveImage(link.url)}>
                                <IonIcon icon={closeOutline} />
                            </IonButton>
                        </IonItem>
                    ))}
                    {localImages.length === 0 && (
                        <IonItem>
                            <IonLabel color="medium">画像がありません。追加してください。</IonLabel>
                        </IonItem>
                    )}
                </IonList>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <IonInput
                        label="画像URLを追加"
                        labelPlacement="stacked"
                        placeholder="画像URL（カンマ区切りで複数可）"
                        value={newImageInput}
                        onKeyDown={handleKeydown}
                        onIonInput={(e) => setNewImageInput(e.detail.value ?? "")}
                    />
                    <IonButton onClick={handleAddImage} disabled={newImageInput.trim().length === 0}>
                        追加
                    </IonButton>
                </div>
            </IonContent>
        </IonModal>
    )
}

export default ImageLinkCarouselSelectModal;

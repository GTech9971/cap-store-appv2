import {
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
    IonText,
} from "@ionic/react"

import "@ionic/react/css/text-transformation.css";
import { type CSSProperties } from "react";
import { openOutline, closeOutline } from 'ionicons/icons'
import { Editable } from "../editable/Editable";

export interface Props {
    link: string,
    onEditedLink: (link: string) => void,
    title?: string | null,
    onEditedTitle: (title: string) => void,
    tag?: string | null,
    onEditedTag: (tag: string) => void,
    onDelete?: (link: string) => void,
    cssProperties?: CSSProperties,
}

export const ExternalLinkCard = ({
    link,
    onEditedLink,
    title,
    onEditedTitle,
    tag,
    onEditedTag,
    onDelete,
    cssProperties,
}: Props) => {

    const css: CSSProperties = {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '200px',
        whiteSpace: 'nowrap'
    }

    const center: CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    }

    return (
        <IonCard style={{ width: 'fit-content', cssProperties }}>
            {onDelete &&
                <IonButton onClick={() => onDelete(link)}
                    size="small"
                    fill="clear"
                    color='danger'
                    style={{ position: 'absolute', right: '2px', zIndex: 999 }}>
                    <IonIcon slot="icon-only" icon={closeOutline} />
                </IonButton>
            }

            <IonCardContent>
                <div style={center}>
                    <Editable text={title ?? 'タイトルなし'}
                        defaultText="タイトルなし"
                        onCommit={onEditedTitle}>
                        <IonCardTitle />
                    </Editable>

                    <Editable
                        text={tag ?? 'タグなし'}
                        defaultText="タグなし"
                        onCommit={onEditedTag}>
                        <IonBadge />
                    </Editable>
                </div>

                <div style={center}>
                    <IonCardSubtitle style={css} className="ion-text-lowercase">
                        <Editable
                            text={link}
                            defaultText={link}
                            onCommit={onEditedLink}>
                            <IonText />
                        </Editable>

                    </IonCardSubtitle>

                    <IonButton size="small" fill="clear" href={link}>
                        <IonIcon slot="icon-only" icon={openOutline} />
                    </IonButton>

                </div>

            </IonCardContent>
        </IonCard>
    )
}
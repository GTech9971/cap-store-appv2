import {
    IonBadge,
    IonButton,
    IonIcon,
    IonItem,
    IonLabel,
    IonText,
} from "@ionic/react"

import "@ionic/react/css/text-transformation.css";
import { type CSSProperties } from "react";
import { openOutline } from 'ionicons/icons'
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

export const ExternalLinkItem = ({
    link,
    onEditedLink,
    title,
    onEditedTitle,
    tag,
    onEditedTag,
    onDelete,
    cssProperties,
}: Props) => {

    const linkStyle: CSSProperties = {
        fontSize: 'small',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap'
    };


    return (
        <IonItem style={cssProperties}>

            <IonButton slot="start" size="small" fill="clear" href={link} target="_blank">
                <IonIcon aria-hidden='true' slot="icon-only" icon={openOutline} />
            </IonButton>

            <IonLabel>
                <h2>
                    <Editable text={title ?? 'タイトルなし'}
                        defaultText="タイトルなし"
                        onCommit={onEditedTitle}>
                        <span />
                    </Editable>
                </h2>
                <Editable
                    text={link}
                    defaultText={link}
                    onCommit={onEditedLink}>
                    <IonText style={linkStyle} color='primary' />
                </Editable>
            </IonLabel>

            <Editable
                text={tag ?? 'タグなし'}
                defaultText="タグなし"
                onCommit={onEditedTag}>
                <IonBadge />
            </Editable>

            {
                onDelete &&
                <IonButton onClick={() => onDelete(link)}
                    size="small"
                    fill="clear"
                    color='danger'>
                    削除
                </IonButton>
            }

        </IonItem>
    )
}
import { IonButton, IonLabel, IonList, IonListHeader } from "@ionic/react";
import type { ProjectExternalLink } from "cap-store-api-def";
import type React from "react";
import { ExternalLinkItem } from "./ExternalLinkItem";
import type { CSSProperties } from "react";

type Prop = {
    links: ProjectExternalLink[],
    onEditedLink: (index: number, link: string) => void,
    onEditedTitle: (index: number, title?: string | undefined) => void,
    onEditedTag: (index: number, tag?: string | undefined) => void,
    onDelete: (index: number) => void,

    onAddEmptyLink: () => void,
};

export const ExternalLinkList: React.FC<Prop> = ({
    links,
    onEditedLink,
    onEditedTitle,
    onEditedTag,
    onDelete,

    onAddEmptyLink,
}) => {

    const style: CSSProperties = {
        maxHeight: '300px',
        overflowY: 'auto'
    }

    return (
        <IonList inset style={style}>
            <IonListHeader>
                <IonLabel>外部リンク</IonLabel>
                <IonButton
                    style={{ marginRight: '35px' }}
                    fill="clear"
                    onClick={onAddEmptyLink}>
                    追加
                </IonButton>
            </IonListHeader>

            {links.map((link, index) =>
                <ExternalLinkItem
                    key={index}
                    link={link.link}
                    onEditedLink={() => onEditedLink(index, link.link)}
                    title={link.title}
                    onEditedTitle={() => onEditedTitle(index, link.title)}
                    tag={link.tag}
                    onEditedTag={() => onEditedTag(index, link.tag)}
                    onDelete={() => onDelete(index)} />
            )}

        </IonList>
    )
}
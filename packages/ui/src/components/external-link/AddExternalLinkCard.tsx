import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonText
} from "@ionic/react"
import type { CSSProperties } from "react"
import { addOutline } from "ionicons/icons"

export interface Prop {
    onClick?: () => void
}

export const AddExternalLinkCard = ({ onClick }: Prop) => {

    const css: CSSProperties = {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        width: '200px',
        whiteSpace: 'nowrap'
    }
    const center: CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }

    return (
        <IonCard button style={{ width: 'fit-content' }} onClick={onClick}>
            <IonCardContent style={css}>
                <IonText style={center}>
                    外部リンク追加
                    <IonIcon icon={addOutline} />
                </IonText>
            </IonCardContent>
        </IonCard>
    )
}

export default AddExternalLinkCard;
import { IonButton, IonIcon } from "@ionic/react"
import { chevronForward } from 'ionicons/icons';

export interface Prop {
    onClick: () => void
}

export const NextButton: React.FC<Prop> = ({ onClick }) => {
    return (
        <IonButton
            fill="clear"
            size="small"
            onClick={onClick}
            style={{
                position: 'absolute',
                right: '8px',
                '--padding-start': '6px',
                '--padding-end': '6px',
                '--padding-top': '6px',
                '--padding-bottom': '6px',
                minHeight: '32px',
                opacity: 0.8
            }}
        >
            <IonIcon icon={chevronForward} />
        </IonButton>
    )
}
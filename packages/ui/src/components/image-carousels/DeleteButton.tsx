import { IonButton, IonIcon } from "@ionic/react"
import { close } from 'ionicons/icons';

export interface Prop {
    onDelete: () => void
}

export const DeleteButton: React.FC<Prop> = ({ onDelete }) => {
    return (
        <IonButton
            fill="clear"
            color="danger"
            size="small"
            onClick={onDelete}
            style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                zIndex: 10,
                '--padding-start': '8px',
                '--padding-end': '8px',
                '--padding-top': '4px',
                '--padding-bottom': '4px',
                minHeight: '24px'
            }}
        >
            <IonIcon icon={close} style={{ fontSize: '16px' }} />
        </IonButton>
    )
}
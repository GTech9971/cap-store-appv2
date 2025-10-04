import { Item } from "@/types/invoices/item"
import {
    IonAvatar,
    IonItem,
    IonLabel,
    IonNote
} from "@ionic/react"
import { env } from "@/config/env"

interface Props {
    item: Item,
    isUnRegistry: boolean,
    onClick?: (item: Item) => void
}

export const InvoiceItem: React.FC<Props> = ({ item, isUnRegistry, onClick }) => {

    return (
        <IonItem button detail={false} onClick={() => onClick?.(item)}>
            {isUnRegistry &&
                <div className="unread-indicator-wrapper" slot="start">
                    <div className="unread-indicator"></div>
                </div>
            }

            <IonAvatar aria-hidden="true" slot="start">
                <img style={{ width: '50px' }} alt="" src={`${env.AKIZUKI_URL}${item.img_url}`} />
            </IonAvatar>

            <IonLabel>
                <strong>{item.name}</strong>
                <IonNote color="medium" className="ion-text-wrap">
                    カタログID: {item.catalog_id}
                </IonNote>
            </IonLabel>
            <div className="metadata-end-wrapper" slot="end">
                <IonNote color="medium">{item.quantity}個 {item.unit_price * item.quantity}円</IonNote>
            </div>
        </IonItem>
    )
}
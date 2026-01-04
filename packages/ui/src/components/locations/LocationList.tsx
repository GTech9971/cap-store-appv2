import { IonButton, IonItem, IonLabel, IonList, IonListHeader } from "@ionic/react"


export interface Prop {
    onClickNorthRoom?: () => void,
}

export const LocationList: React.FC<Prop> = ({
    onClickNorthRoom
}) => {

    return (
        <IonList inset>
            <IonListHeader>
                <IonLabel>保管場所</IonLabel>
                <IonButton disabled style={{ marginRight: '15px' }}>追加</IonButton>
            </IonListHeader>

            <IonItem
                button
                detail={false}
                onClick={() => onClickNorthRoom?.()}>
                <IonLabel>北の部屋</IonLabel>
            </IonItem>

        </IonList>
    )
}
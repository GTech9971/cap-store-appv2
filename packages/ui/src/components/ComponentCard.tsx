import {
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
    IonText
} from "@ionic/react";
import { useMemo, type CSSProperties } from "react";

export interface ComponentCardProps {
    id: string;
    name: string;
    model: string;
    img: string;
    currentStock: number;
    onClick?(): void
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
    id,
    name,
    model,
    img,
    currentStock,
    onClick
}) => {

    const showAllNameStyle: CSSProperties = useMemo(() => {
        return {
            fontSize: '14px',
            fontWeight: 600,
            margin: '8px 0 0 0',
        }
    }, []);

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '200px',
                cursor: 'pointer'
            }}>
            <IonCard
                onClick={onClick}
                style={{
                    margin: 0,
                    width: '80%',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                    <IonImg
                        src={img}
                        alt={name}
                        style={{
                            width: 'clamp(48px, 15vw, 120px)',
                            height: 'clamp(48px, 15vw, 120px)',
                            objectFit: 'fit',
                            borderRadius: '8px'
                        }}
                    />
                </div>


            </IonCard>
            <IonCardContent
                style={{ padding: '8px 0 0 0', textAlign: 'center' }}>
                <IonCardTitle style={showAllNameStyle}>
                    {name}
                </IonCardTitle>

                <IonCardSubtitle style={{ margin: '4px 0 0 0' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IonText>{model}</IonText>
                        <IonBadge color="danger" style={{ marginLeft: '5px', fontSize: '8px' }}>
                            {currentStock}個
                        </IonBadge>
                    </div>

                    <IonText style={{ fontSize: '10px' }}>
                        ID:{id}
                    </IonText>

                </IonCardSubtitle>
            </IonCardContent>
        </div>
    );
}
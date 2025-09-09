import { IonBadge, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonImg } from "@ionic/react";

export interface ComponentCardProps {
    id: string;
    name: string;
    model: string;
    img: string;
    currentStock: number;
    onClick?(): void
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ id, name, model, img, currentStock, onClick }) => {
    return (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                maxWidth: '80%',
                width: 'auto',
                cursor: 'pointer'
            }}
        >
            <IonCard style={{
                margin: 0,
                width: '100%',
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
                            width: 'clamp(48px, 15vw, 80px)',
                            height: 'clamp(48px, 15vw, 80px)',
                            objectFit: 'cover',
                            borderRadius: '8px'
                        }}
                    />
                    <IonBadge
                        color="danger"
                        style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px'
                        }}
                    >
                        {currentStock}個
                    </IonBadge>
                </div>
            </IonCard>
            <IonCardContent style={{ padding: '8px 0 0 0', textAlign: 'center' }}>
                <IonCardTitle style={{ fontSize: '16px', fontWeight: 600, margin: '8px 0 0 0' }}>
                    {name}
                </IonCardTitle>
                <IonCardSubtitle style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {model}
                </IonCardSubtitle>
            </IonCardContent>
        </div>
    );
}
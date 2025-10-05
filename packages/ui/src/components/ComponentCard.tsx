import { IonBadge, IonCard, IonCardContent, IonCardSubtitle, IonCardTitle, IonImg, IonText } from "@ionic/react";
import { useMemo, useState, type CSSProperties } from "react";

export interface ComponentCardProps {
    id: string;
    name: string;
    model: string;
    img: string;
    currentStock: number;
    onClick?(): void
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ id, name, model, img, currentStock, onClick }) => {

    const [showAllName, setShowAllName] = useState<boolean>(false);

    const showPartNameStyle: CSSProperties = useMemo(() => {
        return {
            fontSize: '14px',
            fontWeight: 600,
            margin: '8px 0 0 0',
            textOverflow: 'ellipsis',
            width: "170px",
            overflow: 'hidden',
            whiteSpace: 'nowrap'
        }
    }, [])

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
                maxWidth: '300px',
                width: 'auto',
                cursor: 'pointer'
            }}
        >
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
                            width: 'clamp(48px, 15vw, 80px)',
                            height: 'clamp(48px, 15vw, 80px)',
                            objectFit: 'fit',
                            borderRadius: '8px'
                        }}
                    />
                </div>

                <IonBadge
                    color="danger"
                    style={{
                        position: 'absolute',
                        bottom: '14px',
                        right: '8px'
                    }}>
                    {currentStock}個
                </IonBadge>

            </IonCard>
            <IonCardContent onClick={() => setShowAllName(!showAllName)}
                style={{ padding: '8px 0 0 0', textAlign: 'center' }}>
                <IonCardTitle style={showAllName ? showAllNameStyle : showPartNameStyle}>
                    {name}
                </IonCardTitle>
                <IonCardSubtitle style={{ fontSize: '12px', margin: '4px 0 0 0' }}>
                    {model}
                    {
                        showAllName ?
                            <>
                                <br />
                                <IonText style={{ fontSize: '10px' }}>ID:{id}</IonText>
                            </>
                            : <></>
                    }
                </IonCardSubtitle>
            </IonCardContent>
        </div>
    );
}
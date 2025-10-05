import {
    IonBadge,
    IonCard,
    IonCardContent,
    IonCardSubtitle,
    IonCardTitle,
    IonImg,
    IonText
} from "@ionic/react";
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
                            width: 'clamp(48px, 15vw, 120px)',
                            height: 'clamp(48px, 15vw, 120px)',
                            objectFit: 'fit',
                            borderRadius: '8px'
                        }}
                    />
                </div>


            </IonCard>
            <IonCardContent onClick={() => setShowAllName(!showAllName)}
                style={{ padding: '8px 0 0 0', textAlign: 'center' }}>
                <IonCardTitle style={showAllName ? showAllNameStyle : showPartNameStyle}>
                    {name}
                </IonCardTitle>
                <IonCardSubtitle style={{ margin: '4px 0 0 0' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <IonText>{model}</IonText>
                        <IonBadge color="danger" style={{ marginLeft: '5px', fontSize: '8px' }}>
                            {currentStock}個
                        </IonBadge>
                    </div>

                    {showAllName &&
                        <IonText style={{ fontSize: '10px' }}>ID:{id}</IonText>
                    }

                </IonCardSubtitle>
            </IonCardContent>
        </div>
    );
}
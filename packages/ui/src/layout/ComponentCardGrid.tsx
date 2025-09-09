import { IonGrid, IonRow, IonCol } from "@ionic/react";
import { ComponentCard } from "../components/ComponentCard";

export interface ComponentCardGridProps {
    components?: Array<{
        id: string;
        name: string;
        model: string;
        img: string;
        currentStock: number;
    }>;
    onCardClick?: (id: string) => void;
}

export const ComponentCardGrid: React.FC<ComponentCardGridProps> = ({ 
    components = [], 
    onCardClick 
}) => {
    // サンプルデータを生成（16個のカード用）
    const generateSampleData = () => {
        const sampleData = [];
        for (let i = 1; i <= 16; i++) {
            sampleData.push({
                id: `component-${i}`,
                name: `部品 ${i}`,
                model: `Model-${String(i).padStart(3, '0')}`,
                img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
                currentStock: Math.floor(Math.random() * 50) + 1
            });
        }
        return sampleData;
    };

    const displayComponents = components.length > 0 ? components : generateSampleData();
    
    // 4x4のグリッドに分割
    const rows = [];
    for (let i = 0; i < displayComponents.length; i += 4) {
        rows.push(displayComponents.slice(i, i + 4));
    }

    return (
        <IonGrid style={{ padding: '4px' }}>
            {rows.map((row, rowIndex) => (
                <IonRow key={rowIndex} style={{ marginBottom: '4px' }}>
                    {row.map((component) => (
                        <IonCol 
                            key={component.id}
                            size="3"
                            sizeMd="3"
                            sizeLg="3"
                            style={{ padding: '2px' }}
                        >
                            <ComponentCard
                                id={component.id}
                                name={component.name}
                                model={component.model}
                                img={component.img}
                                currentStock={component.currentStock}
                                onClick={() => onCardClick?.(component.id)}
                            />
                        </IonCol>
                    ))}
                    {/* 行が4個未満の場合は空のカラムで埋める */}
                    {row.length < 4 && Array.from({ length: 4 - row.length }).map((_, index) => (
                        <IonCol key={`empty-${rowIndex}-${index}`} size="3" sizeMd="3" sizeLg="3" />
                    ))}
                </IonRow>
            ))}
        </IonGrid>
    );
}
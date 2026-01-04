import { IonText } from '@ionic/react'
import { Html } from '@react-three/drei'
import type { FC, ReactNode } from 'react'
import './LabelOverlay.css';

type Props = {
    position: [number, number, number]
    children: ReactNode,
    isHighlight?: boolean,
    padding?: string,
    onClick?: () => void
}

// ラベルを3D空間上に重ねて描画するシンプルなオーバーレイ
export const LabelOverlay: FC<Props> = ({
    position,
    children,
    isHighlight = false,
    padding = '6px 10px',
    onClick,
}) => {

    return (
        <Html position={position} center>
            <div
                onClick={onClick}
                className='label'
                style={{
                    padding,
                    border: isHighlight ? 'solid 1px #2dd55b' : 'none',
                    pointerEvents: onClick ? 'auto' : 'none',
                    cursor: onClick ? 'pointer' : 'default',
                }}>
                <IonText color='light'>{children}</IonText>
            </div>
        </Html >
    )
}

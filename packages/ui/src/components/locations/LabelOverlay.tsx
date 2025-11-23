import { IonText } from '@ionic/react'
import { Html } from '@react-three/drei'
import type { FC, ReactNode } from 'react'

type Props = {
    position: [number, number, number]
    children: ReactNode
    padding?: string
    onClick?: () => void
}

export const LabelOverlay: FC<Props> = ({
    position,
    children,
    padding = '6px 10px',
    onClick,
}) => (
    <Html position={position} center>
        <div
            onClick={onClick}
            style={{
                width: 'max-content',
                background: 'rgba(0,0,0,0.65)',
                padding,
                borderRadius: 8,
                pointerEvents: onClick ? 'auto' : 'none',
                cursor: onClick ? 'pointer' : 'default',
            }}
        >
            <IonText color='light'>{children}</IonText>

        </div>
    </Html>
)

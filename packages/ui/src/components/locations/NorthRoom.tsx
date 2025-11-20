import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useState, type FC } from 'react';
import { Desk } from './desk/Desk';
import { Cabinet } from './cabinet/Cabinet';
import './NorthRoom.css';

type Props = {
    sample?: string
};

export const NorthRoom: FC<Props> = ({
    sample: _sample,
}) => {
    const [cabinetHighlight, setCabinetHighlight] = useState<number | null>(null)
    const [deskHighlight, setDeskHighlight] = useState<number | null>(null)

    return (
        <div className="app">
            <Canvas
                className="canvas-container"
                camera={{ fov: 60, position: [6, 4, 12] }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#111111']} />
                <ambientLight intensity={0.2} />
                <directionalLight position={[5, 10, 7]} intensity={1} />
                <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
                <Desk
                    highlight={deskHighlight}
                    onSelectShelf={setDeskHighlight}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={setCabinetHighlight}
                />
            </Canvas>
        </div>
    )
}

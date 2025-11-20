import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import type { Location, Storage } from 'cap-store-api-def';
import { useMemo, useState, type FC } from 'react';
import { Desk } from './desk/Desk';
import { Cabinet } from './cabinet/Cabinet';
import './NorthRoom.css';

type Props = {
    cabinetLocation?: Location | null
    deskLocation?: Location | null
    cabinetStorages?: Storage[]
    deskStorages?: Storage[]
};

const toStorageMap = (storages?: Storage[]) => Object.fromEntries(
    (storages ?? [])
        .filter((storage) => storage.positionIndex != null)
        .map((storage) => [storage.positionIndex as number, storage.name]),
)

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
}) => {
    const [cabinetHighlight, setCabinetHighlight] = useState<number | null>(null)
    const [deskHighlight, setDeskHighlight] = useState<number | null>(null)

    const cabinetStorageByPosition = useMemo(
        () => toStorageMap(cabinetStorages),
        [cabinetStorages],
    )
    const deskStorageByPosition = useMemo(
        () => toStorageMap(deskStorages),
        [deskStorages],
    )

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
                    locationName={deskLocation?.name}
                    storageByPosition={deskStorageByPosition}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={setCabinetHighlight}
                    locationName={cabinetLocation?.name}
                    storageByPosition={cabinetStorageByPosition}
                />
            </Canvas>
        </div>
    )
}

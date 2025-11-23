import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import type { FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { useStorageController } from './useStorageController'
import './NorthRoom.css'

type Props = {
    cabinetLocation?: Location | null
    deskLocation?: Location | null
    cabinetStorages?: Storage[]
    deskStorages?: Storage[]
    onCabinetDrawerSelect?: (args: {
        positionIndex: number
        location: Location | null
        storage?: Storage
    }) => void
    onDeskShelfSelect?: (args: {
        positionIndex: number
        location: Location | null
        storage?: Storage
    }) => void
    onEmptyCabinetSlotDoubleClick?: (args: {
        positionIndex: number
        location: Location | null
    }) => void
    onEmptyDeskSlotDoubleClick?: (args: {
        positionIndex: number
        location: Location | null
    }) => void
    onStorageMove?: (args: {
        from: {
            kind: 'cabinet' | 'desk'
            positionIndex: number
            location: Location | null
            storage?: Storage
        },
        to: {
            kind: 'cabinet' | 'desk'
            positionIndex: number
            location: Location | null
            storage?: Storage
        },
    }) => void
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
    onCabinetDrawerSelect,
    onDeskShelfSelect,
    onEmptyCabinetSlotDoubleClick,
    onEmptyDeskSlotDoubleClick,
    onStorageMove,
}) => {
    const {
        cabinetHighlight,
        deskHighlight,
        cabinetStorages: cabinetStorageState,
        deskStorages: deskStorageState,
        blinkPhase,
        movingFrom,
        handleSelect,
        handleDoubleClick,
    } = useStorageController({
        cabinetLocation,
        deskLocation,
        cabinetStorages,
        deskStorages,
        onCabinetDrawerSelect: (args) => onCabinetDrawerSelect?.({
            positionIndex: args.positionIndex,
            location: args.location,
            storage: args.storage,
        }),
        onDeskShelfSelect: (args) => onDeskShelfSelect?.({
            positionIndex: args.positionIndex,
            location: args.location,
            storage: args.storage,
        }),
        onEmptyCabinetSlotDoubleClick,
        onEmptyDeskSlotDoubleClick,
        onStorageMove,
    })

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
                    onSelectShelf={(index) => handleSelect('desk', index)}
                    onSlotDoubleClick={(index) => handleDoubleClick('desk', index)}
                    locationName={deskLocation?.name}
                    storages={deskStorageState}
                    movingFromKind={movingFrom?.kind ?? null}
                    movingFromIndex={movingFrom?.kind === 'desk' ? movingFrom.positionIndex : null}
                    blinkPhase={blinkPhase}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={(index) => handleSelect('cabinet', index)}
                    onSlotDoubleClick={(index) => handleDoubleClick('cabinet', index)}
                    locationName={cabinetLocation?.name}
                    storages={cabinetStorageState}
                    movingFromKind={movingFrom?.kind ?? null}
                    movingFromIndex={movingFrom?.kind === 'cabinet' ? movingFrom.positionIndex : null}
                    blinkPhase={blinkPhase}
                />
            </Canvas>
        </div>
    )
}

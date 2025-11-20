import { type ThreeEvent } from '@react-three/fiber'
import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { StorageByPosition } from '../../../api/locations/useFetchStoragesApi';

const DRAWER_COUNT = 5;

const RIGHT_X = 1.6
const FW_RIGHT = 1.4
const FH = 4
const FD_RIGHT = 1.0
const FT = 0.12
const DRAWER_GAP = 0.05

type Props = {
    highlight: number | null
    onSelectDrawer: (index: number) => void
    locationName?: string | null
    storageByPosition?: StorageByPosition
}

type FrameSegment = {
    position: [number, number, number]
    size: [number, number, number]
}

const Frame: FC = () => {
    const segments: FrameSegment[] = [
        { position: [0, FH / 2, 0], size: [FW_RIGHT, FT, FD_RIGHT] },
        { position: [0, -FH / 2, 0], size: [FW_RIGHT, FT, FD_RIGHT] },
        { position: [-FW_RIGHT / 2, 0, 0], size: [FT, FH, FD_RIGHT] },
        { position: [FW_RIGHT / 2, 0, 0], size: [FT, FH, FD_RIGHT] },
        { position: [0, FH / 2, FD_RIGHT / 2], size: [FW_RIGHT, FT, FT] },
        { position: [0, -FH / 2, FD_RIGHT / 2], size: [FW_RIGHT, FT, FT] },
        { position: [0, FH / 2, -FD_RIGHT / 2], size: [FW_RIGHT, FT, FT] },
        { position: [0, -FH / 2, -FD_RIGHT / 2], size: [FW_RIGHT, FT, FT] },
    ]

    return (
        <group position={[RIGHT_X, 0, 0]}>
            {segments.map((segment, index) => (
                <mesh key={index} position={segment.position}>
                    <boxGeometry args={segment.size} />
                    <meshStandardMaterial color="#bbbbbb" />
                </mesh>
            ))}
        </group>
    )
}

const DrawerHandle: FC<{
    position: [number, number, number]
    onClick: () => void
}> = ({ position, onClick }) => (
    <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={position}
        onClick={(event: ThreeEvent<MouseEvent>) => {
            event.stopPropagation()
            onClick()
        }}
    >
        <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
        <meshStandardMaterial color="#dddddd" />
    </mesh>
)

export const Cabinet: FC<Props> = ({
    highlight,
    onSelectDrawer,
    locationName,
    storageByPosition,
}) => {

    const drawerHeight = (FH - DRAWER_GAP * (DRAWER_COUNT - 1)) / DRAWER_COUNT
    const drawers = Array.from({ length: DRAWER_COUNT }, (_, i) => {
        const index = i + 1
        const y = -FH / 2 + drawerHeight / 2 + i * (drawerHeight + DRAWER_GAP)
        const isHighlighted = highlight != null && index === highlight
        const color = isHighlighted ? '#ffcc00' : '#777777'

        return {
            index,
            position: [RIGHT_X, y, 0.05] as [number, number, number],
            handlePosition: [RIGHT_X, y, 0.55] as [number, number, number],
            color,
            label: storageByPosition?.[index],
        }
    })

    const handleDrawerClick = (event: ThreeEvent<MouseEvent>, index: number) => {
        event.stopPropagation()
        onSelectDrawer(index)
    }

    return (
        <group>
            <Frame />
            {locationName && (
                <LabelOverlay position={[RIGHT_X, FH / 2 + 0.6, 0]}>
                    {locationName}
                </LabelOverlay>
            )}
            {drawers.map((drawer) => (
                <group key={drawer.index}>
                    <mesh
                        position={drawer.position}
                        onClick={(event) => handleDrawerClick(event, drawer.index)}
                    >
                        <boxGeometry args={[1.3, drawerHeight, FD_RIGHT - 0.08]} />
                        <meshStandardMaterial color={drawer.color} />
                    </mesh>
                    {drawer.label && (
                        <LabelOverlay
                            position={[
                                drawer.position[0] + 1.5,
                                drawer.position[1],
                                drawer.position[2] + 0.6,
                            ]}
                            padding="4px 10px"
                        >
                            {drawer.label}
                        </LabelOverlay>
                    )}
                    <DrawerHandle
                        position={drawer.handlePosition}
                        onClick={() => onSelectDrawer(drawer.index)}
                    />
                </group>
            ))}
        </group>
    )
}

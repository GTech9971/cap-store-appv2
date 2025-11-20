import { type ThreeEvent } from '@react-three/fiber'
import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { StorageByPosition } from '../../../api/locations/useFetchStoragesApi'


const LEFT_X = -1.6
const FW_LEFT = 2.0
const FH = 4
const FD_RIGHT = 1.0
const FD_LEFT = 2.8
const FT = 0.12
const LEFT_Z_SHIFT = FD_RIGHT / 2 - FD_LEFT / 2

type Props = {
    highlight: number | null
    onSelectShelf: (index: number) => void
    locationName?: string | null
    storageByPosition?: StorageByPosition
}

type FrameSegment = {
    position: [number, number, number]
    size: [number, number, number]
}

const Frame: FC = () => {
    const segments: FrameSegment[] = [
        { position: [0, FH / 2, 0], size: [FW_LEFT, FT, FD_LEFT] },
        { position: [0, -FH / 2, 0], size: [FW_LEFT, FT, FD_LEFT] },
        { position: [-FW_LEFT / 2, 0, 0], size: [FT, FH, FD_LEFT] },
        { position: [FW_LEFT / 2, 0, 0], size: [FT, FH, FD_LEFT] },
        { position: [0, FH / 2, FD_LEFT / 2], size: [FW_LEFT, FT, FT] },
        { position: [0, -FH / 2, FD_LEFT / 2], size: [FW_LEFT, FT, FT] },
        { position: [0, FH / 2, -FD_LEFT / 2], size: [FW_LEFT, FT, FT] },
        { position: [0, -FH / 2, -FD_LEFT / 2], size: [FW_LEFT, FT, FT] },
    ]

    return (
        <group position={[LEFT_X, 0, LEFT_Z_SHIFT]}>
            {segments.map((segment, index) => (
                <mesh key={index} position={segment.position}>
                    <boxGeometry args={segment.size} />
                    <meshStandardMaterial color="#bbbbbb" />
                </mesh>
            ))}
        </group>
    )
}

export const Desk: FC<Props> = ({
    highlight,
    onSelectShelf,
    locationName,
    storageByPosition,
}) => {

    const shelfPositions = [-1.0, 1.0]

    const handleShelfClick = (event: ThreeEvent<MouseEvent>, index: number) => {
        event.stopPropagation()
        onSelectShelf(index)
    }

    return (
        <group>
            <Frame />
            {locationName && (
                <LabelOverlay position={[LEFT_X, FH / 2 + 0.6, LEFT_Z_SHIFT]}>
                    {locationName}
                </LabelOverlay>
            )}
            {shelfPositions.map((position, idx) => {
                const index = idx + 1
                const isHighlighted = highlight != null && index === highlight
                const color = isHighlighted ? '#ffcc00' : '#bbbbbb'
                const label = storageByPosition?.[index]
                return (
                    <group key={index}>
                        <mesh
                            position={[LEFT_X, position, LEFT_Z_SHIFT]}
                            onClick={(event) => handleShelfClick(event, index)}
                        >
                            <boxGeometry args={[1.9, 0.15, FD_LEFT - 0.1]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        {label && (
                            <LabelOverlay
                                position={[LEFT_X, position + 0.35, LEFT_Z_SHIFT + 0.8]}
                                padding="4px 10px"
                            >
                                {label}
                            </LabelOverlay>
                        )}
                    </group>
                )
            })}
        </group>
    )
}

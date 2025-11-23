import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import { ShelfSlot } from './ShelfSlot'
import type { UiStorage } from '../types'


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
    onSlotDoubleClick?: (index: number) => void
    locationName: string
    storages?: UiStorage[]
    movingFromKind?: 'cabinet' | 'desk' | null
    movingFromIndex?: number | null
    blinkPhase?: boolean
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
    onSlotDoubleClick,
    locationName,
    storages,
    movingFromKind,
    movingFromIndex,
    blinkPhase = false,
}) => {

    const shelfPositions = [-1.0, 1.0]

    return (
        <group>
            <Frame />
            <LabelOverlay position={[LEFT_X, FH / 2 + 0.6, LEFT_Z_SHIFT]}>
                {locationName}
            </LabelOverlay>

            {shelfPositions.map((position, idx) => {
                const index = idx + 1
                const slotStorages = (storages ?? []).filter((s) => s.positionIndex === index)
                const isHighlighted = highlight != null && index === highlight
                return (
                    <ShelfSlot
                        key={index}
                        index={index}
                        position={[LEFT_X, position, LEFT_Z_SHIFT]}
                        size={[1.9, 0.15, FD_LEFT - 0.1]}
                        labelPosition={[LEFT_X, position + 0.35, LEFT_Z_SHIFT + 0.8]}
                        storages={slotStorages}
                        isHighlighted={isHighlighted}
                        shouldBlink={movingFromKind === 'desk' && movingFromIndex === index}
                        blinkPhase={blinkPhase ?? false}
                        onClick={onSelectShelf}
                        onDoubleClick={onSlotDoubleClick}
                    />
                )
            })}
        </group>
    )
}

import { type ThreeEvent } from '@react-three/fiber'
import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { UiStorage } from '../types'

type Props = {
    index: number
    position: [number, number, number]
    size: [number, number, number]
    labelPosition: [number, number, number]
    storages: UiStorage[]
    isHighlighted: boolean
    shouldBlink: boolean
    blinkPhase: boolean
    onEdit?: (storage: UiStorage) => void
    onClick: (index: number) => void
    onDoubleClick?: (index: number) => void
}

export const ShelfSlot: FC<Props> = ({
    index,
    position,
    size,
    labelPosition,
    storages,
    isHighlighted,
    shouldBlink,
    blinkPhase,
    onEdit,
    onClick,
    onDoubleClick,
}) => {
    const color = shouldBlink && blinkPhase ? '#ff6666' : isHighlighted ? '#ffcc00' : '#bbbbbb'

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onClick(index)
    }

    const handleDoubleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onDoubleClick?.(index)
    }

    return (
        <group>
            <mesh
                position={position}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} />
            </mesh>
            {storages.length > 0 && (
                <LabelOverlay
                    position={labelPosition}
                    padding="4px 10px"
                    onClick={() => onEdit?.(storages[0])}
                >
                    {storages.map((storage) => storage.name).join('\n')}
                </LabelOverlay>
            )}
        </group>
    )
}

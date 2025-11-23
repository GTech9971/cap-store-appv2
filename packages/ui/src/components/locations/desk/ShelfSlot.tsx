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
    onDoubleClick?: (index: number, storages: UiStorage[]) => void
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
        onDoubleClick?.(index, storages)
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
            {storages.map((storage, idx) => (
                <LabelOverlay
                    key={storage.id ?? `${index}-${idx}`}
                    position={[labelPosition[0], labelPosition[1] + idx * 0.35, labelPosition[2]]}
                    padding="4px 10px"
                    onClick={() => onEdit?.(storage)}
                >
                    {storage.name}
                </LabelOverlay>
            ))}
        </group>
    )
}

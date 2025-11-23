import { type ThreeEvent } from '@react-three/fiber'
import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { UiStorage } from '../types'

type Props = {
    index: number
    position: [number, number, number]
    handlePosition: [number, number, number]
    drawerHeight: number
    drawerDepth: number
    storages: UiStorage[]
    isHighlighted: boolean
    shouldBlink: boolean
    blinkPhase: boolean
    onEdit?: (storage: UiStorage) => void
    onClick: (index: number) => void
    onDoubleClick?: (index: number, storages: UiStorage[]) => void
}

export const DrawerSlot: FC<Props> = ({
    index,
    position,
    handlePosition,
    drawerHeight,
    drawerDepth,
    storages,
    isHighlighted,
    shouldBlink,
    blinkPhase,
    onEdit,
    onClick,
    onDoubleClick,
}) => {
    const color = shouldBlink && blinkPhase ? '#2dd55b' : isHighlighted ? '#ffcc00' : '#777777'

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
                <boxGeometry args={[1.3, drawerHeight, drawerDepth]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {storages.map((storage, idx) => (
                <LabelOverlay
                    key={storage.id ?? `${index}-${idx}`}
                    position={[
                        position[0] + 1.5,
                        position[1] + idx * 0.35,
                        position[2] + 0.6,
                    ]}
                    padding="4px 10px"
                    onClick={() => onEdit?.(storage)}
                >
                    {storage.name}
                </LabelOverlay>
            ))}
            <mesh
                rotation={[0, 0, Math.PI / 2]}
                position={handlePosition}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
            >
                <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
                <meshStandardMaterial color="#dddddd" />
            </mesh>
        </group>
    )
}

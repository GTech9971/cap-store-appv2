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
    onClickLabel?: (storage: UiStorage) => void
    onClick: (index: number, storages: UiStorage[]) => void
}

export const DrawerSlot: FC<Props> = ({
    index,
    position,
    handlePosition,
    drawerHeight,
    drawerDepth,
    storages,
    isHighlighted,
    onClickLabel,
    onClick,
}) => {
    const color = isHighlighted ? '#ffcc00' : '#777777'

    // スロットクリックで選択や作成を親へ伝搬
    const handleClick = (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        onClick(index, storages)
    }

    return (
        <group>
            <mesh
                position={position}
                onClick={handleClick}
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
                    onClick={() => onClickLabel?.(storage)}
                >
                    {storage.name}
                </LabelOverlay>
            ))}
            <mesh
                rotation={[0, 0, Math.PI / 2]}
                position={handlePosition}
                onClick={handleClick}
            >
                <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
                <meshStandardMaterial color="#dddddd" />
            </mesh>
        </group>
    )
}

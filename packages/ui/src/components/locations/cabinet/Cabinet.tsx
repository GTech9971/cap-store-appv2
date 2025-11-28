import type { FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import { DrawerSlot } from './DrawerSlot'
import { useNorthRoomHighlightContext } from '../NorthRoomHighlightProvider'
import { useNorthRoomStorageContext } from '../NorthRoomStorageProvider'

const DRAWER_COUNT = 5;

const RIGHT_X = 1.6
const FW_RIGHT = 1.4
const FH = 4
const FD_RIGHT = 1.0
const FT = 0.12
const DRAWER_GAP = 0.05

type Props = Record<string, never>;

type FrameSegment = {
    position: [number, number, number]
    size: [number, number, number]
}

// キャビネットの枠を構築するヘルパーコンポーネント
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

// キャビネットの引き出しを描画するコンポーネント
export const Cabinet: FC<Props> = () => {
    const {
        cabinetHighlight,
        dispatchHighlight,
    } = useNorthRoomHighlightContext();
    const {
        cabinetList,
        cabinetLocation,
    } = useNorthRoomStorageContext();

    const drawerHeight = (FH - DRAWER_GAP * (DRAWER_COUNT - 1)) / DRAWER_COUNT
    const drawers = Array.from({ length: DRAWER_COUNT }, (_, i) => {
        const index = i + 1
        const y = -FH / 2 + drawerHeight / 2 + i * (drawerHeight + DRAWER_GAP)
        const slotStorages = (cabinetList ?? []).filter((storage) => storage.positionIndex === index)
        const isHighlighted = cabinetHighlight != null && index === cabinetHighlight

        return {
            index,
            position: [RIGHT_X, y, 0.05] as [number, number, number],
            handlePosition: [RIGHT_X, y, 0.55] as [number, number, number],
            isHighlighted,
            storages: slotStorages,
        }
    })

    return (
        <group>
            <Frame />

            <LabelOverlay position={[RIGHT_X, FH / 2 + 0.6, 0]}>
                {cabinetLocation.name}
            </LabelOverlay>

            {drawers.map((drawer) => (
                <DrawerSlot
                    key={drawer.index}
                    index={drawer.index}
                    position={drawer.position}
                    handlePosition={drawer.handlePosition}
                    drawerHeight={drawerHeight}
                    drawerDepth={FD_RIGHT - 0.08}
                    storages={drawer.storages}
                    isHighlighted={drawer.isHighlighted}
                    onEdit={(storage) => dispatchHighlight({ type: 'LABEL_SELECTED', kind: 'cabinet', locationId: cabinetLocation.id, storage })}
                    onClick={(idx, slotStorages) => dispatchHighlight({ type: 'SLOT_SELECTED', kind: 'cabinet', locationId: cabinetLocation.id, positionIndex: idx, slotStorages })}
                />
            ))}
        </group>
    )
}

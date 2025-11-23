import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { useMemo, useState, type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { useStorageController } from './useStorageController'
import { StorageEditAlert } from './StorageEditAlert'
import { StorageCreateAlert } from './StorageCreateAlert'
import './NorthRoom.css'

type Props = {
    cabinetLocation: Location
    deskLocation: Location
    cabinetStorages?: Storage[]
    deskStorages?: Storage[]
    onStoragesChange?: (cabinet: Storage[], desk: Storage[]) => void
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    cabinetStorages,
    deskStorages,
    onStoragesChange,
}) => {
    const [alertOpen, setAlertOpen] = useState(false)
    const [pendingSlot, setPendingSlot] = useState<{ kind: 'cabinet' | 'desk'; index: number } | null>(null)
    const [editing, setEditing] = useState<{ kind: 'cabinet' | 'desk'; storage: Storage } | null>(null)

    const handleCreateRequest = (kind: 'cabinet' | 'desk', index: number, hasStorage: boolean) => {
        if (hasStorage) {
            handleDoubleClick(kind, index)
            return
        }
        setPendingSlot({ kind, index })
        setAlertOpen(true)
    }

    const {
        cabinetHighlight,
        deskHighlight,
        cabinetStorages: cabinetStorageState,
        deskStorages: deskStorageState,
        blinkPhase,
        movingFrom,
        handleSelect,
        handleDoubleClick,
        addStorage,
        updateStorageName,
    } = useStorageController({
        cabinetLocation,
        deskLocation,
        cabinetStorages,
        deskStorages,
        onStoragesChange,
    })

    const handleCancelAlert = () => {
        setPendingSlot(null)
        setAlertOpen(false)
    }

    const hasStorageAt = useMemo(
        () => ({
            cabinet: (index: number) => cabinetStorageState.some((s) => s.positionIndex === index),
            desk: (index: number) => deskStorageState.some((s) => s.positionIndex === index),
        }),
        [cabinetStorageState, deskStorageState],
    )

    return (
        <div className="app">
            <StorageCreateAlert
                isOpen={alertOpen}
                onConfirm={(name) => {
                    if (!pendingSlot) return
                    const location = pendingSlot.kind === 'cabinet' ? cabinetLocation : deskLocation
                    addStorage(pendingSlot.kind, pendingSlot.index, name, location)
                    setPendingSlot(null)
                    setAlertOpen(false)
                }}
                onCancel={handleCancelAlert}
            />
            <StorageEditAlert
                isOpen={editing != null}
                defaultName={editing?.storage.name ?? ''}
                onConfirm={(name) => {
                    if (!editing) return
                    updateStorageName(editing.kind, editing.storage.id ?? '', name)
                    setEditing(null)
                }}
                onCancel={() => setEditing(null)}
            />
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
                    locationName={deskLocation?.name}
                    storages={deskStorageState}
                    movingFromKind={movingFrom?.kind ?? null}
                    movingFromIndex={movingFrom?.kind === 'desk' ? movingFrom.positionIndex : null}
                    blinkPhase={blinkPhase}
                    onSlotDoubleClick={(index) => handleCreateRequest('desk', index, hasStorageAt.desk(index))}
                    onEditStorage={(storage) => setEditing({ kind: 'desk', storage })}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={(index) => handleSelect('cabinet', index)}
                    onSlotDoubleClick={(index) => handleCreateRequest('cabinet', index, hasStorageAt.cabinet(index))}
                    locationName={cabinetLocation?.name}
                    storages={cabinetStorageState}
                    movingFromKind={movingFrom?.kind ?? null}
                    movingFromIndex={movingFrom?.kind === 'cabinet' ? movingFrom.positionIndex : null}
                    blinkPhase={blinkPhase}
                    onEditStorage={(storage) => setEditing({ kind: 'cabinet', storage })}
                />
            </Canvas>
        </div>
    )
}

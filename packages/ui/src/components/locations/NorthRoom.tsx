import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { useMemo, useState, type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { useStorageController } from './useStorageController'
import { StorageEditAlert } from './StorageEditAlert'
import { StorageCreateAlert } from './StorageCreateAlert'
import { StorageSelectAlert } from './StorageSelectAlert'
import './NorthRoom.css'

/**
 * NorthRoom コンポーネント仕様
 * - ロケーションとストレージ配列を受け取り、Cabinet/Deskを描画
 * - onStoragesChangeでストレージ配列の更新を親へ通知（移動・追加・編集）
 * - スロットダブルクリック:
 *    - 空スロット: StorageCreateAlertで名前入力後に新規追加（idはnull!）
 *    - 既存が1件: 即移動開始
 *    - 既存が複数: StorageSelectAlertで移動対象を明示選択
 * - ラベルクリック: StorageEditAlertで名前変更
 * - 移動中はmovingFromとblinkPhaseで点滅制御し、ドロップで配列更新・ハイライト反映
 */
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
    const [selectMove, setSelectMove] = useState<{ kind: 'cabinet' | 'desk'; index: number; storages: Storage[] } | null>(null)

    const handleCreateRequest = (kind: 'cabinet' | 'desk', index: number, slotStorages: Storage[]) => {
        if (slotStorages.length > 0) {
            if (slotStorages.length > 1) {
                setSelectMove({ kind, index, storages: slotStorages })
            } else {
                startMove(kind, index, slotStorages[0]?.id ?? undefined)
            }
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
        startMove,
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
            <StorageSelectAlert
                isOpen={selectMove != null}
                storages={selectMove?.storages ?? []}
                onConfirm={(storageId) => {
                    if (!selectMove) return
                    startMove(selectMove.kind, selectMove.index, storageId)
                    setSelectMove(null)
                }}
                onCancel={() => setSelectMove(null)}
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
            <StorageSelectAlert
                isOpen={selectMove != null}
                storages={selectMove?.storages ?? []}
                onConfirm={(storageId) => {
                    if (!selectMove) return
                    startMove(selectMove.kind, selectMove.index, storageId)
                    setSelectMove(null)
                }}
                onCancel={() => setSelectMove(null)}
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
                    onSlotDoubleClick={(index, slotStorages) => handleCreateRequest('desk', index, slotStorages)}
                    onEditStorage={(storage) => setEditing({ kind: 'desk', storage })}
                />
                <Cabinet
                    highlight={cabinetHighlight}
                    onSelectDrawer={(index) => handleSelect('cabinet', index)}
                    onSlotDoubleClick={(index, slotStorages) => handleCreateRequest('cabinet', index, slotStorages)}
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

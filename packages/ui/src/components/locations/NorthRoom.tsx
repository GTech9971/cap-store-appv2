import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Location, Storage } from 'cap-store-api-def'
import { type FC } from 'react'
import { Cabinet } from './cabinet/Cabinet'
import { Desk } from './desk/Desk'
import { StorageControlPanel } from './StorageControlPanel'
import { NorthRoomStorageProvider } from './NorthRoomStorageProvider'
import { NorthRoomHighlightProvider } from './NorthRoomHighlightProvider'
import './NorthRoom.css'

/**
 * NorthRoom コンポーネント仕様
 * - ロケーションとストレージ配列を受け取り、Cabinet/Deskを描画
 * - onSaveでストレージの新規登録と更新を親へ通知
 * - スロットクリックで選択を更新し、フォームから保存すると移動や名称変更を反映
 */
type Props = {
    cabinetLocation: Location,
    deskLocation: Location,
    /**
     *
     * @param mode
     * @param storage
     * @returns storageId
     */
    onSave: (mode: 'new' | 'update', storage: Storage) => Promise<string>;
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    onSave,
}) => {
    return (
        <NorthRoomHighlightProvider>
            <NorthRoomStorageProvider
                cabinetLocation={cabinetLocation}
                deskLocation={deskLocation}
                onSave={onSave}
            >
                <div className="app">
                    <StorageControlPanel />
                    <Canvas
                        className="canvas-container"
                        camera={{ fov: 60, position: [6, 4, 12] }}
                        dpr={[1, 2]}
                    >
                        <color attach="background" args={['#111111']} />
                        <ambientLight intensity={0.2} />
                        <directionalLight position={[5, 10, 7]} intensity={1} />
                        <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
                        <Desk />
                        <Cabinet />
                    </Canvas>
                </div>
            </NorthRoomStorageProvider>
        </NorthRoomHighlightProvider>
    )
}

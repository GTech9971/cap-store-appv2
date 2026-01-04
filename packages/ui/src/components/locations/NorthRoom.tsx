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
    defaultSelected?: Storage,
    /**
     * ストレージ新規登録・更新時の処理
     * @param mode
     * @param storage
     * @returns storageId
     */
    onSave: (mode: 'new' | 'update', storage: Storage) => Promise<string>;

    /**
     * ストレージ選択時の処理
     * @param selected      
     */
    onSelected?: (selected: Storage, selectedLocation: Location) => void,

    /**
     * ハイライト時の処理
     * @param location ハイライトさせた場所
     * @param positionIndex ハイライト位置     
     */
    onHighlight?: (location: Location, positionIndex: number) => void,

    /**
     * ハイライトオフ時の処理
     */
    onHighlightOff?: () => void,
}

export const NorthRoom: FC<Props> = ({
    cabinetLocation,
    deskLocation,
    defaultSelected,
    onSave,
    onSelected,
    onHighlight,
    onHighlightOff,
}) => {
    return (
        <NorthRoomHighlightProvider
            cabinetLocation={cabinetLocation}
            deskLocation={deskLocation}
            defaultSelected={defaultSelected}
            onSelected={onSelected}
            onHighlight={onHighlight}
            onHighlightOff={onHighlightOff}>

            <NorthRoomStorageProvider
                cabinetLocation={cabinetLocation}
                deskLocation={deskLocation}
                onSave={onSave}>
                <div className="app">
                    <StorageControlPanel />
                    <Canvas
                        className="canvas-container"
                        camera={{ fov: 60, position: [6, 4, 12] }}
                        dpr={[1, 2]}>

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

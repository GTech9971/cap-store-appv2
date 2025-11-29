import { useCallback, useMemo, type FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { UiStorage } from '../types'
import { useNorthRoomHighlightContext } from '../NorthRoomHighlightProvider'
import type { Storage, } from 'cap-store-api-def'

type Props = {
    index: number
    position: [number, number, number]
    handlePosition: [number, number, number]
    drawerHeight: number
    drawerDepth: number
    locationId: string,
    storages: UiStorage[]
}

export const DrawerSlot: FC<Props> = ({
    index,
    position,
    handlePosition,
    drawerHeight,
    drawerDepth,
    locationId,
    storages,
}) => {

    const {
        cabinetHighlight,
        selected,
        dispatchHighlight,
    } = useNorthRoomHighlightContext();


    const color = useMemo(() => {
        return cabinetHighlight != null && index === cabinetHighlight
            ? '#ffcc00'
            : '#777777'
    }, [cabinetHighlight, index]);

    /** ラベルを光らすかどうか */
    const isHighlightLabel = useCallback((storage: Storage): boolean => {
        if (selected?.type === 'empty-slot') { return false; }

        return selected?.kind === 'cabinet'
            && selected?.positionIndex == index
            && selected?.storage === storage;
    }, [selected, index]);



    return (
        <group>
            <mesh
                position={position}
                onClick={() =>
                    dispatchHighlight({
                        type: 'SLOT_SELECTED',
                        kind: 'cabinet',
                        locationId: locationId,
                        positionIndex: index,
                        occupied: storages.length > 0
                    })}>
                <boxGeometry args={[1.3, drawerHeight, drawerDepth]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {storages.map((storage, idx) => (
                <LabelOverlay
                    key={storage.id ?? `${index}-${idx}`}
                    isHighlight={isHighlightLabel(storage)}
                    position={[
                        position[0] + 1.5,
                        position[1] + idx * 0.35,
                        position[2] + 0.6,
                    ]}
                    padding="4px 10px"
                    onClick={() =>
                        dispatchHighlight({
                            type: 'LABEL_SELECTED',
                            kind: 'cabinet',
                            locationId: locationId,
                            storage
                        })}>
                    {storage.name}
                </LabelOverlay>
            ))}

            <mesh
                rotation={[0, 0, Math.PI / 2]}
                position={handlePosition}
                onClick={() =>
                    dispatchHighlight({
                        type: 'SLOT_SELECTED',
                        kind: 'cabinet',
                        locationId: locationId,
                        positionIndex: index,
                        occupied: storages.length > 0
                    })}>
                <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
                <meshStandardMaterial color="#dddddd" />
            </mesh>
        </group>
    )
}

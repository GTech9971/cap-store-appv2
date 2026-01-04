import { useCallback, useMemo, type FC } from 'react'
import { LabelOverlay } from '../LabelOverlay'
import type { UiStorage } from '../types'
import { useNorthRoomHighlightContext } from '../NorthRoomHighlightProvider'
import type { Storage } from 'cap-store-api-def'

type Props = {
    index: number
    position: [number, number, number]
    size: [number, number, number]
    labelPosition: [number, number, number],
    locationId: string,
    storages: UiStorage[]
}

export const ShelfSlot: FC<Props> = ({
    index,
    position,
    size,
    labelPosition,
    locationId,
    storages,
}) => {


    const {
        deskHighlight,
        selected,
        dispatchHighlight,
    } = useNorthRoomHighlightContext();

    const color = useMemo(() => {
        return deskHighlight != null && index === deskHighlight
            ? '#ffcc00'
            : '#bbbbbb'
    }, [deskHighlight, index]);

    /** ラベルを光らすかどうか */
    const isHighlightLabel = useCallback((storage: Storage): boolean => {
        if (selected?.type === 'empty-slot') { return false; }

        return selected?.kind === 'desk'
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
                        kind: 'desk',
                        locationId: locationId,
                        positionIndex: index,
                        occupied: storages.length > 0
                    })}>
                <boxGeometry args={size} />
                <meshStandardMaterial color={color} />
            </mesh>
            {storages.map((storage, idx) => (
                <LabelOverlay
                    key={storage.id ?? `${index}-${idx}`}
                    position={[labelPosition[0], labelPosition[1] + idx * 0.35, labelPosition[2]]}
                    isHighlight={isHighlightLabel(storage)}
                    padding="4px 10px"
                    onClick={() =>
                        dispatchHighlight({
                            type: 'LABEL_SELECTED',
                            kind: 'desk',
                            locationId: locationId,
                            storage
                        })}>
                    {storage.name}
                </LabelOverlay>
            ))}
        </group>
    )
}

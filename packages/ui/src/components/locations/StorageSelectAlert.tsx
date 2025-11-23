import { IonAlert } from '@ionic/react'
import { useEffect, useState, type FC } from 'react'
import type { UiStorage } from './types'

type Props = {
    isOpen: boolean
    storages: UiStorage[]
    onConfirm: (storageId: string) => void
    onCancel: () => void
    header?: string
    message?: string
}

export const StorageSelectAlert: FC<Props> = ({
    isOpen,
    storages,
    onConfirm,
    onCancel,
    header = '移動するストレージを選択',
    message = 'どのストレージを移動しますか？',
}) => {
    const [selected, setSelected] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen) {
            setSelected(storages[0]?.id ?? null)
        }
    }, [isOpen, storages])

    return (
        <IonAlert
            isOpen={isOpen}
            header={header}
            message={message}
            inputs={storages.map((storage, idx) => ({
                name: `storage-${idx}`,
                type: 'radio',
                label: storage.name,
                value: storage.id ?? '',
                checked: storage.id === selected || (!selected && idx === 0),
            }))}
            buttons={[
                {
                    text: 'キャンセル',
                    role: 'cancel',
                    handler: onCancel,
                },
                {
                    text: '移動',
                    handler: (value) => {
                        const id = typeof value === 'string' ? value : (value as { value?: string })?.value ?? selected
                        if (!id) return false
                        onConfirm(id)
                        return true
                    },
                },
            ]}
            onDidDismiss={onCancel}
        />
    )
}

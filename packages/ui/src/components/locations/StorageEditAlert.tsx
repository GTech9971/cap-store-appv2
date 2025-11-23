import { IonAlert } from '@ionic/react'
import { useEffect, useState, type FC } from 'react'

type Props = {
    isOpen: boolean
    defaultName?: string
    onConfirm: (name: string) => void
    onCancel: () => void
    header?: string
    message?: string
}

export const StorageEditAlert: FC<Props> = ({
    isOpen,
    defaultName = '',
    onConfirm,
    onCancel,
    header = 'ストレージ編集',
    message = 'ストレージ名を入力してください',
}) => {
    const [name, setName] = useState(defaultName)

    useEffect(() => {
        if (isOpen) {
            setName(defaultName)
        }
    }, [defaultName, isOpen])

    return (
        <IonAlert
            isOpen={isOpen}
            header={header}
            message={message}
            inputs={[
                {
                    name: 'name',
                    placeholder: 'Storage name',
                    value: name,
                    attributes: {
                        autofocus: true,
                    },
                    handler: (value) => {
                        setName(typeof value === 'string' ? value : (value as { name?: string })?.name ?? '')
                        return true
                    },
                },
            ]}
            buttons={[
                {
                    text: 'キャンセル',
                    role: 'cancel',
                    handler: onCancel,
                },
                {
                    text: '保存',
                    handler: (value) => {
                        const inputValue = typeof value === 'string' ? value : (value as { name?: string })?.name ?? name
                        const trimmed = (inputValue ?? '').trim()
                        if (!trimmed) return false
                        onConfirm(trimmed)
                        return true
                    },
                },
            ]}
            onDidDismiss={() => {
                setName(defaultName)
                onCancel()
            }}
        />
    )
}

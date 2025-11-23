import { IonAlert } from '@ionic/react'
import { useEffect, useState, type FC } from 'react'

type Props = {
    isOpen: boolean
    onConfirm: (name: string) => void
    onCancel: () => void
    header?: string
    message?: string
}

export const StorageCreateAlert: FC<Props> = ({
    isOpen,
    onConfirm,
    onCancel,
    header = 'ストレージ登録',
    message = 'ストレージ名を入力してください',
}) => {
    const [name, setName] = useState('')

    useEffect(() => {
        if (isOpen) {
            setName('')
        }
    }, [isOpen])

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
                    text: '追加',
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
                setName('')
                onCancel()
            }}
        />
    )
}

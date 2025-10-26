export interface Prop {
    isSelected: boolean,
    onClick?: () => void
}

export const Indicator: React.FC<Prop> = ({
    isSelected,
    onClick
}) => {
    return (
        <div
            style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isSelected ? 'var(--ion-color-primary)' : '#ccc',
                cursor: 'pointer'
            }}
            onClick={() => onClick?.()}
        />
    )
}
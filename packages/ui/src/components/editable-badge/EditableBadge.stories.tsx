import type { Meta, StoryObj } from '@storybook/react-vite';
import { EditableBadge, type Prop } from './EditableBadge';
import { IonApp } from '@ionic/react';

const wrapper = (args: Prop) => {
    return (
        <IonApp>
            <div style={{ padding: '20px', maxWidth: '400px' }}>
                <EditableBadge {...args} />
            </div>
        </IonApp>
    );
};

const meta: Meta<typeof EditableBadge> = {
    title: 'Components/EditableBadge',
    component: wrapper,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof EditableBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        text: 'Github',
        defaultText: 'タグなし',
        onCommit: (text) => console.warn(text)
    },
};
import type { Meta, StoryObj } from '@storybook/react-vite';
import { IonApp, IonBadge, IonCardSubtitle, IonCardTitle } from '@ionic/react';
import { Editable, type Prop } from './Editable';
import type { DOMAttributes, ReactElement } from 'react';

const wrapper = (child: ReactElement<DOMAttributes<HTMLElement>>, args: Prop) => {
    return (
        <IonApp>
            <div style={{ padding: '20px', maxWidth: '400px' }}>
                <Editable {...args}>
                    {child}
                </Editable>
            </div>
        </IonApp>
    );
};

const meta: Meta<typeof Editable> = {
    title: 'Components/Editable',
    component: Editable,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof Editable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => wrapper(<IonBadge />, args),
    args: {
        text: 'Github',
        defaultText: 'タグなし',
        onCommit: (text) => console.warn(text)
    },
};

export const IonCardTitleStory: Story = {
    render: (args) => wrapper(<IonCardTitle />, args),
    args: {
        text: 'Github',
        defaultText: 'タイトルなし',
        onCommit: (text) => console.warn(text)
    }
}

export const IonCardSubTitleStory: Story = {
    render: (args) => wrapper(<IonCardSubtitle />, args),
    args: {
        text: 'Github',
        defaultText: 'タイトルなし',
        onCommit: (text) => console.warn(text)
    }
}
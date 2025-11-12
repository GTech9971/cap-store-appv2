import type { Meta, StoryObj } from '@storybook/react-vite';
import { IonApp, IonBadge, IonCardTitle } from '@ionic/react';

import type { DOMAttributes, ReactElement } from 'react';
import { Diff, type Prop } from './Diff';

const wrapper = (child: ReactElement<DOMAttributes<HTMLElement>>, args: Prop) => {
    return (
        <IonApp>
            <div style={{ padding: '20px', maxWidth: '400px' }}>
                <Diff {...args}>
                    {child}
                </Diff>
            </div>
        </IonApp>
    );
};

const meta: Meta<typeof Diff> = {
    title: 'Components/Diff',
    component: Diff,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],

} satisfies Meta<typeof Diff>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (args) => wrapper(<IonBadge>10</IonBadge>, args),
    args: {
        showDiff: true,
    },
};

export const IonCardTitleStory: Story = {
    render: (args) => wrapper(<IonCardTitle>Sample</IonCardTitle>, args),
    args: {
        showDiff: true,
    }
}
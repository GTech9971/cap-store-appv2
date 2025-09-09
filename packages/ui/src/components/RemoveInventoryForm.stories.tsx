import type { Meta, StoryObj } from '@storybook/react';
import { IonApp } from '@ionic/react';

import { RemoveInventoryForm } from './RemoveInventoryForm';

const RemoveInventoryFormWrapper = (args: any) => {
  return (
    <IonApp>
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <RemoveInventoryForm {...args} />
      </div>
    </IonApp>
  );
};

const meta: Meta<typeof RemoveInventoryForm> = {
  title: 'Components/RemoveInventoryForm',
  component: RemoveInventoryFormWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
} satisfies Meta<typeof RemoveInventoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Remove submitted:', data),
  },
};
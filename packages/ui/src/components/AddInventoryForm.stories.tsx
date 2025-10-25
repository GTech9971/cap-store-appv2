import type { Meta, StoryObj } from '@storybook/react-vite';
import { IonApp } from '@ionic/react';

import { AddInventoryForm } from './AddInventoryForm';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AddInventoryFormWrapper = (args: any) => {
  return (
    <IonApp>
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <AddInventoryForm {...args} />
      </div>
    </IonApp>
  );
};

const meta: Meta<typeof AddInventoryForm> = {
  title: 'Components/AddInventoryForm',
  component: AddInventoryFormWrapper,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onSubmit: { action: 'submitted' },
  },
} satisfies Meta<typeof AddInventoryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onSubmit: (data) => console.log('Add submitted:', data),
  },
};
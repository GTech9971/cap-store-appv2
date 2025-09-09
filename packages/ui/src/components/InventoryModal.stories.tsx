import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IonButton, IonApp } from '@ionic/react';

import { InventoryModal } from './InventoryModal';

// Wrapper component to handle modal state
const InventoryModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <IonApp>
      <IonButton onClick={() => setIsOpen(true)}>在庫管理モーダルを開く</IonButton>
      <InventoryModal
        {...args}
        isOpen={isOpen}
        onDidDismiss={() => setIsOpen(false)}
      />
    </IonApp>
  );
};

const meta: Meta<typeof InventoryModal> = {
  title: 'Components/InventoryModal',
  component: InventoryModalWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    componentId: { 
      control: 'text',
      description: 'コンポーネントID'
    },
    onDidDismiss: { action: 'dismissed' },
  },
} satisfies Meta<typeof InventoryModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    componentId: 'C-000001',
  },
};

export const WithDifferentComponent: Story = {
  args: {
    componentId: 'C-000002',
  },
};
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IonButton, IonApp, IonPage } from '@ionic/react';

import { InventoryModal } from './InventoryModal';
import { Configuration, InventoriesApi } from 'cap-store-api-def';

// Wrapper component to handle modal state
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const InventoryModalWrapper = (args: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <IonApp>
      <IonPage>
        <IonButton onClick={() => setIsOpen(true)}>在庫管理モーダルを開く</IonButton>
        <InventoryModal
          {...args}
          isOpen={isOpen}
          onDidDismiss={() => setIsOpen(false)}
        />
      </IonPage>
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

const config: Configuration = new Configuration({
  basePath: 'http://localhost:6006'
});
const inventoryApi: InventoriesApi = new InventoriesApi(config);

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

export const WithManyInventoryItems: Story = {
  args: {
    componentId: 'C-000003',
    inventoryApi: inventoryApi,
    onDidDismiss: () => { }
  },
};
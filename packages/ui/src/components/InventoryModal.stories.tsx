import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { IonButton, IonApp, IonPage } from '@ionic/react';

import { InventoryModal } from './InventoryModal';

// Wrapper component to handle modal state
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
    currentStock: 1250,
    historyData: Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      changeType: Math.random() > 0.5 ? 'add' : 'remove',
      quantity: Math.floor(Math.random() * 100) + 1,
      remarks: [
        '初期在庫',
        '追加発注',
        '製品A使用',
        '製品B使用',
        '在庫調整',
        '返品処理',
        '不良品廃棄',
        '棚卸し調整',
        'プロジェクトX使用',
        'メンテナンス用',
        '試作品製造',
        '品質検査用',
        '緊急発注',
        'バックアップ在庫'
      ][Math.floor(Math.random() * 14)],
      executeAt: new Date(2024, 0, 1 + Math.floor(Math.random() * 365))
    })).sort((a, b) => b.executeAt.getTime() - a.executeAt.getTime()),
    onAddSubmit: (data) => console.log('Add submitted:', data),
    onRemoveSubmit: (data) => console.log('Remove submitted:', data),
  },
};
/* eslint-disable storybook/no-renderer-packages */
import type { Meta, StoryObj } from '@storybook/react';

import { ComponentCardGrid } from './ComponentCardGrid';
import { IonContent, IonPage } from '@ionic/react';

const meta: Meta<typeof ComponentCardGrid> = {
  title: 'Layout/ComponentCardGrid',
  component: ComponentCardGrid,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onCardClick: { action: 'card clicked' },
  },
  args: { onCardClick: undefined },
  decorators: [
    (Story) => (
      <IonPage>
        <IonContent fullscreen>
          <Story />
        </IonContent>
      </IonPage>

    ),
  ]
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithCustomData: Story = {
  args: {
    components: [
      {
        id: '1',
        name: 'Arduino Uno',
        model: 'A000066',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 25,
      },
      {
        id: '2',
        name: 'Raspberry Pi 4',
        model: 'Model B',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 12,
      },
      {
        id: '3',
        name: 'ESP32 DevKit',
        model: 'ESP32-WROOM-32',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 8,
      },
      {
        id: '4',
        name: 'STM32 Nucleo',
        model: 'NUCLEO-F401RE',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 15,
      },
      {
        id: '5',
        name: 'LED Matrix',
        model: '8x8 RGB',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 30,
      },
      {
        id: '6',
        name: 'Servo Motor',
        model: 'SG90',
        img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
        currentStock: 5,
      },
    ],
  },
};

export const LowStock: Story = {
  args: {
    components: Array.from({ length: 16 }, (_, i) => ({
      id: `low-stock-${i + 1}`,
      name: `低在庫部品 ${i + 1}`,
      model: `LS-${String(i + 1).padStart(3, '0')}`,
      img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
      currentStock: Math.floor(Math.random() * 3) + 1, // 1-3個の低在庫
    })),
  },
};

export const HighStock: Story = {
  args: {
    components: Array.from({ length: 16 }, (_, i) => ({
      id: `high-stock-${i + 1}`,
      name: `高在庫部品 ${i + 1}`,
      model: `HS-${String(i + 1).padStart(3, '0')}`,
      img: 'https://akizukidenshi.com//img/goods/L/113065.jpg',
      currentStock: Math.floor(Math.random() * 50) + 50, // 50-99個の高在庫
    })),
  },
};
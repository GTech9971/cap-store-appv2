import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { IonButton, IonPage } from '@ionic/react';
import { ComponentSearchModal } from './ComponentSearchModal';
import { CategoriesApi, Configuration } from 'cap-store-api-def';

const meta: Meta<typeof ComponentSearchModal> = {
  title: 'Components/projects/ComponentSearchModal',
  component: ComponentSearchModal,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    onSelect: { action: 'selected' },
    onClose: { action: 'closed' },
  }
} satisfies Meta<typeof ComponentSearchModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const config = new Configuration({ basePath: 'http://localhost:6006' });
const categoryApi = new CategoriesApi(config);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Wrapper = (args: any) => {
  const [open, setOpen] = useState(false);
  return (
    <IonPage style={{ padding: 16 }}>
      <IonButton onClick={() => setOpen(true)}>検索モーダルを開く</IonButton>
      <ComponentSearchModal
        {...args}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </IonPage>
  );
};

export const Default: Story = {
  render: (args) => <Wrapper {...args} />,
  args: {
    categoryApi,
  }
};


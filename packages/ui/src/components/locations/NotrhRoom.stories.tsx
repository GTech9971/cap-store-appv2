import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Location, Storage } from 'cap-store-api-def';
import { NorthRoom } from './NorthRoom';

const meta: Meta<typeof NorthRoom> = {
    title: 'Components/locations/NorthRoom',
    component: NorthRoom,
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: '空スロットはダブルクリックで追加。ラベルをクリックすると右上パネルから名前変更と移動先（キャビネット/デスクと段）を編集できます。',
            },
        },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;


const cabinetStorages: Storage[] = [
    { id: 's1', name: 'Cabinet 1段', locationId: 'loc-1', positionIndex: 1 },
    { id: 's2', name: 'Cabinet 3段', locationId: 'loc-1', positionIndex: 3 },
]

const deskStorages: Storage[] = [
    { id: 's3', name: 'Desk 上段', locationId: 'loc-2', positionIndex: 2 },
    { id: 'sIII', name: 'Desk箱', locationId: 'loc-2', positionIndex: 2 },
]

const cabinetLocation: Location = { id: 'loc-1', name: 'キャビネット', storages: cabinetStorages };
const deskLocation: Location = { id: 'loc-2', name: 'デスク', storages: deskStorages };

export const Default: Story = {
    args: {
        cabinetLocation,
        deskLocation,
        onSave: async (mode, storage) => {
            console.log(`${mode}`);
            console.log(storage);
            return mode === 'new' ? 'NEW-Storage' : storage.id;
        }
    },
};

export const Select: Story = {
    args: {
        cabinetLocation,
        deskLocation,
        onSelect: async (storages) => {

        }
    },
};

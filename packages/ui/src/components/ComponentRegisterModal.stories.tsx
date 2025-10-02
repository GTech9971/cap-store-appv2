import type { Meta, StoryObj } from '@storybook/react-vite';
import ComponentRegisterModal from './ComponentRegisterModal';
import { AkizukiCatalogsApi, CategoriesApi, ComponentsApi, Configuration, MakersApi } from 'cap-store-api-def';

const meta = {
  title: 'Components/ComponentRegisterModal',
  component: ComponentRegisterModal,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ComponentRegisterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const config: Configuration = new Configuration({
  basePath: 'http://localhost:6006'
});

const categoryApi: CategoriesApi = new CategoriesApi(config);
const makerApi: MakersApi = new MakersApi(config);
const componentApi: ComponentsApi = new ComponentsApi(config);
const akizukiApi: AkizukiCatalogsApi = new AkizukiCatalogsApi(config);

export const Default: Story = {

  args: {
    isOpen: true,
    categoryApi: categoryApi,
    makerApi: makerApi,
    componentApi: componentApi,
    akizukiApi: akizukiApi,
    onClose: () => console.log('close')
  }
};
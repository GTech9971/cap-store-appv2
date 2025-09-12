import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ComponentRegisterModal from './ComponentRegisterModal';

const meta = {
  title: 'Components/ComponentRegisterModal',
  component: ComponentRegisterModal,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    isOpen: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof ComponentRegisterModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveModal = () => {
  const [form, setForm] = useState({
    name: '',
    modelName: '',
    categoryId: '',
    makerId: '',
    description: '',
    images: []
  });
  const [imageUrls, setImageUrls] = useState(["https://akizukidenshi.com//img/goods/L/113065.jpg"]);
  
  const categories = [
    { id: "ic", name: "半導体" },
    { id: "casecrew", name: "ケース・ネジ・固定具" },
    { id: "opt", name: "オプトエレクトロニクス" },
    { id: "measulog", name: "計測器・センサー・ロガー" },
    { id: "cable", name: "ケーブル・コネクター" },
    { id: "cparts", name: "制御部品・駆動部品" },
    { id: "passive", name: "受動部品" },
    { id: "developm", name: "開発ツール・ボード" },
    { id: "boards", name: "基板・ブレッドボード・ラグ板" }
  ];
  
  const makers = [
    { id: "M-JP-000001", name: "株式会社秋月電子通商" },
    { id: "M-JP-000002", name: "日清紡マイクロデバイス株式会社(JRC/NewJRC/NJR)" },
    { id: "M-JP-000003", name: "COMFORTABLE ELECTRONIC CO., LTD(COMF)" },
    { id: "M-JP-000004", name: "DB Products Limited." },
    { id: "M-JP-000005", name: "Alphaplus Connectors & Cables Corp." },
    { id: "M-JP-000006", name: "Useconn Electronics Ltd." },
    { id: "M-JP-000007", name: "Microchip Technology Inc.(マイクロチップ)/Atmel Corporation(アトメル)" },
    { id: "M-JP-000008", name: "メーカー不明" },
    { id: "M-JP-000009", name: "STMicroelectronics(STマイクロ)" },
    { id: "M-JP-000010", name: "OptoSupply" },
    { id: "M-JP-000011", name: "FAITHFUL LINK INDUSTRIAL CORP." },
    { id: "M-JP-000012", name: "SHIH HAO Electronics CO.,LTD" },
    { id: "M-JP-000013", name: "株式会社村田製作所(muRata)" },
    { id: "M-JP-000014", name: "ルビコン株式会社(Rubycon)" },
    { id: "M-JP-000015", name: "UNISONIC TECHNOLOGIES CO.,LTD (ユニソニック・UTC)" },
    { id: "M-JP-000016", name: "株式会社東芝セミコンダクター社(TOSHIBA)" },
    { id: "M-JP-000017", name: "シャープ株式会社(SHARP)" },
    { id: "M-JP-000018", name: "Nanyang Senba Optical&Electronic Co.,Ltd." },
    { id: "M-JP-000019", name: "PANJIT INTERNATIONAL INC.(パンジット)" },
    { id: "M-JP-000020", name: "MERCURY MOTOR" },
    { id: "M-JP-000021", name: "Espressif Systems (Shanghai) Pte. Ltd." },
    { id: "M-JP-000022", name: "Neltron Industrial Co., Ltd." },
    { id: "M-US-000001", name: "Allegro MicroSystems" },
    { id: "M-JP-000023", name: "ラズベリーパイ財団(Raspberry Pi Foundation)" },
    { id: "M-JP-000024", name: "江蘇沁恒股分有限公司(wch.cn/nanjing qinheng microelectronics co.ltd.)" }
  ];

  return (
    <ComponentRegisterModal
      isOpen={true}
      form={form}
      imageUrls={imageUrls}
      categories={categories}
      makers={makers}
      onImageUrlChange={setImageUrls}
      onFormChange={(field, value) => setForm(prev => ({ ...prev, [field]: value }))}
      onClose={() => console.log('Modal closed')}
    />
  );
};

export const Default: Story = {
  render: () => <InteractiveModal />
};

export const Closed: Story = {
  args: {
    isOpen: false,
    onClose: () => console.log('Modal closed'),
  },
};
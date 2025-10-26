import { http, HttpResponse } from 'msw';
import { FetchComponentResponse, RegistryComponentResponse, UpdateComponentResponse } from 'cap-store-api-def';

export const componentHandlers = [
    http.post('/components', async () => HttpResponse.json<RegistryComponentResponse>({
        data: { componentId: 'C-12345' },
        errors: []
    }, { status: 201 })),

    http.get('/components/:id', async () => HttpResponse.json<FetchComponentResponse>({
        data: {
            id: 'C-12345',
            name: '抵抗1/4W',
            modelName: 'R-100Ω',
            description: `
XD3232は2つのラインドライバー、2つのラインレシーバー、1つのデュアルチャージポンプ回路で構成されており、±15kVのピン間(シリアルポート接続ピン、GNDを含む)ESD保護機能を備えています。TIA/EIA-232-Fの要件を満たし、非同期通信コントローラとシリアルポート・コネクタの間の電気的インターフェイスとして機能します。チャージポンプと4つの小さな外付けコンデンサにより、3V～5.5Vの単一電源で動作できます。

[データシート](https://akizukidenshi.com//goodsaffix/XD3232.pdf)
[データシート](https://akizukidenshi.com/goodsaffix/dd93204-ps2501-1-2-4-15_12_16.pdf)

■主な仕様

・機能：RS232Cインターフェイス

・電源電圧min.：3V

・電源電圧max.：5.5V

・ボーレートmax.：250kbps

・動作温度min.：-40℃

・動作温度max.：85℃

・実装タイプ：スルーホール

・パッケージ：DIP16

・パッケージタイプ：DIP16
`,
            images: [
                'https://akizukidenshi.com/img/goods/L/130195.jpg',
                'https://akizukidenshi.com/img/goods/1/130195.jpg',
                'https://akizukidenshi.com/img/goods/2/130195.jpg',
                'https://akizukidenshi.com/img/goods/3/130195.jpg',
                'https://akizukidenshi.com/img/goods/4/130195.jpg',
                'https://akizukidenshi.com/img/goods/6/130195.jpg'
            ],
            category: {
                id: 'resistor',
                name: '抵抗'
            },
            maker: {
                id: 'M-JPN-0001',
                name: 'Panasonic'
            },
            currentStock: 90
        },
        errors: []
    }, { status: 200 })),

    http.patch('/components/:id', async () => HttpResponse.json<UpdateComponentResponse>({
        data: {
            id: 'C-001',
            name: '炭素皮膜抵抗',
            modelName: 'R-100Ω',
            description: '1/4W 100Ωの標準抵抗',
            images: ['https://akizukidenshi.com/img/goods/L/130195.jpg'],
            category: { id: 'resistor', name: '抵抗' },
            maker: { id: 'rohm', name: 'ROHM' },
            currentStock: 3
        },
        errors: []
    }, { status: 200 }))
];

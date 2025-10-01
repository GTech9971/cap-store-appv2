import { http, HttpResponse } from 'msw';
import {
    FetchCategoriesResponse,
    FetchComponentByAkizukiCatalogIdResponse,
    FetchComponentResponse,
    FetchComponentsByCategoryIdResponse,
    FetchMakersResponse,
    RegistryCategoryResponse,
    RegistryComponentResponse,
    RegistryMakerResponse,
    UpdateComponentResponse,
    FetchComponentInventoryResponse,
    RemoveComponentInventoryResponse,
    RegistryComponentInventoryResponse,
} from 'cap-store-api-def';

export const handlers = [
    // GET /akizuki/catalogs/:catalogId
    http.get('/akizuki/catalogs/:catalogId', ({ params }) => {
        const { catalogId } = params;

        if (catalogId === 'N') { return HttpResponse.json<FetchComponentByAkizukiCatalogIdResponse>({ data: undefined, errors: [] }, { status: 404 }); }

        return HttpResponse.json<FetchComponentByAkizukiCatalogIdResponse>({
            data: {
                name: '抵抗1/4W',
                modelName: 'R-100Ω',
                description: '1/4W 100Ωの炭素皮膜抵抗です。',
                images: [
                    "https://akizukidenshi.com/img/goods/L/130195.jpg",
                    "https://akizukidenshi.com/img/goods/1/130195.jpg",
                    "https://akizukidenshi.com/img/goods/2/130195.jpg",
                    "https://akizukidenshi.com/img/goods/3/130195.jpg",
                    "https://akizukidenshi.com/img/goods/4/130195.jpg",
                    "https://akizukidenshi.com/img/goods/6/130195.jpg"
                ],
                categoryId: 'resistor',
                makerName: 'Panasonic',
                unRegistered: {
                    makerName: 'Panasonic',
                    category: {
                        id: 'ケーブル',
                        name: 'cable'
                    }
                }
            },
            errors: []

        }, { status: 200 });
    }),

    // GET /categories
    http.get('/categories', () => {
        return HttpResponse.json<FetchCategoriesResponse>({
            data: [
                { id: 'resistor', name: '抵抗' },
                { id: 'capacitor', name: 'コンデンサ' },
                { id: 'transistor', name: 'トランジスタ' }
            ],
            pageIndex: 1,
            pageSize: 50,
            hasNext: false,
            hasPrevious: false,
            totalCount: 3,
            totalPages: 1,
            errors: []
        }, { status: 200 })
    }),

    // GET /categories/:id/components
    http.get('/categories/:id/components', ({ params, request }) => {
        const { id } = params;
        const url = new URL(request.url);
        const searchQuery: string | null = url.searchParams.get('searchQuery');
        console.debug(searchQuery);

        const mockData: Record<string, FetchComponentsByCategoryIdResponse> = {
            resistor: {
                pageIndex: 1,
                pageSize: 2,
                totalCount: 2,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                data: [
                    {
                        id: 'C-001',
                        name: '炭素皮膜抵抗',
                        modelName: 'R-100Ω',
                        description: '1/4W 100Ωの標準抵抗',
                        images: ['https://akizukidenshi.com/img/goods/L/130195.jpg'],
                        category: { id: 'resistor', name: '抵抗' },
                        maker: { id: 'rohm', name: 'ROHM' },
                        currentStock: 32
                    },
                    {
                        id: 'C-002',
                        name: '金属皮膜抵抗',
                        modelName: 'R-1KΩ',
                        description: '1/4W 1KΩの高精度抵抗',
                        images: ['https://akizukidenshi.com/img/goods/1/130195.jpg'],
                        category: { id: 'resistor', name: '抵抗' },
                        maker: { id: 'toshiba', name: '東芝' },
                        currentStock: 127
                    }
                ],
                errors: []
            },
            capacitor: {
                pageIndex: 1,
                pageSize: 1,
                totalCount: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                data: [
                    {
                        id: 'C-010',
                        name: 'セラミックコンデンサ',
                        modelName: 'C-10uF',
                        description: '10μFの一般的なセラコン',
                        images: ['https://akizukidenshi.com/img/goods/L/116992.jpg'],
                        category: { id: 'capacitor', name: 'コンデンサ' },
                        maker: { id: 'murata', name: '村田製作所' },
                        currentStock: 3019
                    }
                ],
                errors: []
            },
            transistor: {
                pageIndex: 1,
                pageSize: 1,
                totalCount: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                data: [
                    {
                        id: 'C-020',
                        name: 'NPNトランジスタ',
                        modelName: 'T-2N2222',
                        description: '汎用NPNトランジスタ',
                        images: ['https://akizukidenshi.com/img/goods/L/130111.jpg'],
                        category: { id: 'transistor', name: 'トランジスタ' },
                        maker: { id: 'toshiba', name: '東芝' },
                        currentStock: 1
                    }
                ],
                errors: []
            }
        };

        const result = mockData[id as string] || {
            pageIndex: 1,
            pageSize: 0,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            data: [],
            errors: []
        };

        return HttpResponse.json(result, { status: 200 });
    }),

    // GET /makers
    http.get('/makers', () => {
        return HttpResponse.json<FetchMakersResponse>({
            data: [
                { id: 'rohm', name: 'ROHM' },
                { id: 'toshiba', name: '東芝' },
                { id: 'murata', name: '村田製作所' },
                { id: 'M-JPN-0001', name: 'Panasonic' },
            ],
            errors: [],
            pageIndex: 1,
            pageSize: 50,
            totalCount: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
        }, { status: 200 });
    }),

    // POST /makers
    http.post('/makers', async () => {
        return HttpResponse.json<RegistryMakerResponse>({
            data: { makerId: 'M-JPN-00001' },
            errors: []
        }, { status: 201 });
    }),

    // GET /parts/:name
    http.get('/parts/:name', ({ params }) => {
        const { name } = params;

        if (name === '抵抗') {
            return HttpResponse.json<FetchComponentResponse>({
                data: {
                    id: 'C-123456',
                    name: '抵抗',
                    modelName: 'R-100Ω',
                    description: '一般的な抵抗です。',
                    images: [
                        'https://example.com/image1.jpg',
                        'https://example.com/image2.jpg'
                    ],
                    category: { id: 'resistor', name: '抵抗' },
                    maker: { id: 'ROHM', name: '東芝' },
                    currentStock: 4
                },
                errors: []
            }, { status: 200 });
        }

        return HttpResponse.json({ message: 'Part not found' }, { status: 404 });
    }),

    // POST /categories
    http.post('/categories', async () => {
        return HttpResponse.json<RegistryCategoryResponse>({
            data: { categoryId: 'register' },
            errors: []
        }, { status: 201 });
    }),

    // POST /components
    http.post('/components', async () => {
        return HttpResponse.json<RegistryComponentResponse>({
            data: { componentId: 'C-12345' },
            errors: []
        }, { status: 201 });
    }),

    // GET /components/*
    http.get('/components/:id', async () => {
        return HttpResponse.json<FetchComponentResponse>({
            data: {
                id: 'C-12345',
                name: '抵抗1/4W',
                modelName: 'R-100Ω',
                description:
                    `
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
                    "https://akizukidenshi.com/img/goods/L/130195.jpg",
                    "https://akizukidenshi.com/img/goods/1/130195.jpg",
                    "https://akizukidenshi.com/img/goods/2/130195.jpg",
                    "https://akizukidenshi.com/img/goods/3/130195.jpg",
                    "https://akizukidenshi.com/img/goods/4/130195.jpg",
                    "https://akizukidenshi.com/img/goods/6/130195.jpg"
                ],
                category: {
                    id:
                        'resistor',
                    name: '抵抗',
                },
                maker: {
                    id: 'M-JPN-0001',
                    name: 'Panasonic'
                },
                currentStock: 90
            },
        }, { status: 200 })
    }),

    // PATCH /components/:id
    http.patch('/components/:id', async () => {

        return HttpResponse.json<UpdateComponentResponse>({
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
        }, { status: 200 });
    }),

    // GET /components/:componentId/inventories
    http.get('/components/:componentId/inventories', ({ params }) => {
        const { componentId } = params;
        return HttpResponse.json<FetchComponentInventoryResponse>({
            data: [
                {
                    id: `IA-${componentId}-001`,
                    changeType: 'add',
                    quantity: 10,
                    remarks: '初期在庫補充',
                    removeType: 'unknown',
                    executeAt: new Date('2025-01-01T12:00:00Z')
                },
                {
                    id: `IR-${componentId}-002`,
                    changeType: 'remove',
                    quantity: 2,
                    remarks: 'テスト出庫',
                    removeType: 'use',
                    executeAt: new Date('2025-01-02T15:30:00Z')
                }
            ],
            errors: []
        }, { status: 200 });
    }),
    // POST /components/:componentId/inventories:add (在庫追加)
    http.post('/components/:componentId/inventories:add', async ({ params }) => {
        const { componentId } = params;
        return HttpResponse.json<RegistryComponentInventoryResponse>({
            data: {
                id: `IA-${componentId}-${Date.now()}`,
                quantity: 13
            },
            errors: []
        }, { status: 200 });
    }),
    // POST /components/:componentId/inventories:remove (在庫削除)
    http.post('/components/:componentId/inventories:remove', async ({ params }) => {
        const { componentId } = params;

        return HttpResponse.json<RemoveComponentInventoryResponse>({
            data: {
                id: `IR-${componentId}-${Date.now()}`,
                quantity: 12
            },
            errors: []
        }, { status: 200 });
    }),
];

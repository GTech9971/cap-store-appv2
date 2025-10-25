import { http, HttpResponse } from 'msw';
import {
    FetchCategoriesResponse,
    FetchComponentsByCategoryIdResponse,
    RegistryCategoryResponse,
    FetchComponentResponse
} from 'cap-store-api-def';

const categoryComponentMap: Record<string, FetchComponentsByCategoryIdResponse> = {
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
            },
            {
                id: 'C-011',
                name: '電源用電解コンデンサー100μF35V105℃ ルビコンZLH',
                modelName: '35ZLH100MEFC6.3X11',
                description: '10μFの一般的なセラコン',
                images: ['https://akizukidenshi.com/img/goods/L/102724.jpg'],
                category: { id: 'capacitor', name: 'コンデンサ' },
                maker: { id: 'murata', name: '村田製作所' },
                currentStock: 230
            },
            {
                id: 'C-012',
                name: '積層セラミックコンデンサー 1μF50V X7R 5mm',
                modelName: 'RDER71H105K2K1H03B',
                description: '10μFの一般的なセラコン',
                images: ['https://akizukidenshi.com/img/goods/L/108150.jpg'],
                category: { id: 'capacitor', name: 'コンデンサ' },
                maker: { id: 'murata', name: '村田製作所' },
                currentStock: 10903
            },
            {
                id: 'C-013',
                name: '導電性高分子アルミ固体電解コンデンサー OS-CON 100μF16V105℃',
                modelName: '16SEPC100M',
                description: '10μFの一般的なセラコン',
                images: ['https://akizukidenshi.com/img/goods/L/108290.jpg'],
                category: { id: 'capacitor', name: 'コンデンサ' },
                maker: { id: 'murata', name: '村田製作所' },
                currentStock: 3019
            },
            {
                id: 'C-01412',
                name: 'オーディオ用無極性電解コンデンサー100μF25V85℃ ニチコンMUSE・ES',
                modelName: 'UES1E101MPM',
                description: '10μFの一般的なセラコン',
                images: ['https://akizukidenshi.com/img/goods/L/104628.jpg'],
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

export const categoryHandlers = [
    http.get('/categories', () => HttpResponse.json<FetchCategoriesResponse>({
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
    }, { status: 200 })),

    http.get('/categories/:id/components', ({ params, request }) => {
        const { id } = params;
        const url = new URL(request.url);
        const searchQuery: string | null = url.searchParams.get('searchQuery');
        console.debug(searchQuery);

        const response = categoryComponentMap[id as string] ?? {
            pageIndex: 1,
            pageSize: 0,
            totalCount: 0,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false,
            data: [],
            errors: []
        };

        return HttpResponse.json<FetchComponentsByCategoryIdResponse>(response, { status: 200 });
    }),

    http.post('/categories', async () => HttpResponse.json<RegistryCategoryResponse>({
        data: { categoryId: 'register' },
        errors: []
    }, { status: 201 })),

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
    })
];

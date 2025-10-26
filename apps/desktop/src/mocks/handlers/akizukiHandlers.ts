import { http, HttpResponse } from 'msw';
import { FetchComponentByAkizukiCatalogIdResponse } from 'cap-store-api-def';

export const akizukiHandlers = [
    http.get('/akizuki/catalogs/:catalogId', ({ params }) => {
        const { catalogId } = params;

        if (catalogId === 'N') {
            return HttpResponse.json<FetchComponentByAkizukiCatalogIdResponse>({ data: undefined, errors: [] }, { status: 404 });
        }

        if (catalogId === '123456') {
            return HttpResponse.json<FetchComponentByAkizukiCatalogIdResponse>({ data: undefined, errors: [] }, { status: 409 });
        }

        return HttpResponse.json<FetchComponentByAkizukiCatalogIdResponse>({
            data: {
                name: '抵抗1/4W',
                modelName: 'R-100Ω',
                description: '1/4W 100Ωの炭素皮膜抵抗です。',
                images: [
                    'https://akizukidenshi.com/img/goods/L/130195.jpg',
                    'https://akizukidenshi.com/img/goods/1/130195.jpg',
                    'https://akizukidenshi.com/img/goods/2/130195.jpg',
                    'https://akizukidenshi.com/img/goods/3/130195.jpg',
                    'https://akizukidenshi.com/img/goods/4/130195.jpg',
                    'https://akizukidenshi.com/img/goods/6/130195.jpg'
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
    })
];

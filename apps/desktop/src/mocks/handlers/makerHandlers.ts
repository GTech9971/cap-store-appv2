import { http, HttpResponse } from 'msw';
import { FetchMakersResponse, RegistryMakerResponse } from 'cap-store-api-def';

export const makerHandlers = [
    http.get('/makers', () => HttpResponse.json<FetchMakersResponse>({
        data: [
            { id: 'rohm', name: 'ROHM' },
            { id: 'toshiba', name: '東芝' },
            { id: 'murata', name: '村田製作所' },
            { id: 'M-JPN-0001', name: 'Panasonic' }
        ],
        errors: [],
        pageIndex: 1,
        pageSize: 50,
        totalCount: 3,
        totalPages: 1,
        hasNext: false,
        hasPrevious: false
    }, { status: 200 })),

    http.post('/makers', async () => HttpResponse.json<RegistryMakerResponse>({
        data: { makerId: 'M-JPN-00001' },
        errors: []
    }, { status: 201 }))
];

import { http, HttpResponse } from 'msw';
import {
    FetchComponentInventoryResponse,
    RegistryComponentInventoryResponse,
    RemoveComponentInventoryResponse
} from 'cap-store-api-def';

export const inventoryHandlers = [
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

    http.post('/components/:componentId/inventories:remove', async ({ params }) => {
        const { componentId } = params;
        return HttpResponse.json<RemoveComponentInventoryResponse>({
            data: {
                id: `IR-${componentId}-${Date.now()}`,
                quantity: 12
            },
            errors: []
        }, { status: 200 });
    })
];

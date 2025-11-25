import { RegistryStorageResponse, UpdateStorageResponse } from "cap-store-api-def";
import { http, HttpResponse } from "msw";

export const storageHandlers = [

    http.post('/storages', async () => {
        return HttpResponse.json<RegistryStorageResponse>({
            data: {
                storageId: 's4',
            },
            errors: []
        }, { status: 201 })
    }),

    http.patch('/storages/:id', async () => {
        return HttpResponse.json<UpdateStorageResponse>({
            data: {
                id: 's4',
                name: 'Update',
                locationId: 'loc1',
                positionIndex: 1
            }, errors: []
        })
    })
];

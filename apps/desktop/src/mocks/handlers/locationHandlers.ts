import { FetchLocationResponse, FetchLocationsResponse, Location, Storage } from "cap-store-api-def";
import { http, HttpResponse } from "msw";

const cabinetStorages: Storage[] = [
    { id: 's1', name: 'Cabinet 1段', locationId: 'loc-1', positionIndex: 1 },
    { id: 's2', name: 'Cabinet 3段', locationId: 'loc-1', positionIndex: 3 },
]

const deskStorages: Storage[] = [
    { id: 's3', name: 'Desk 上段', locationId: 'loc-2', positionIndex: 2 },
]

const cabinetLocation: Location = { id: 'loc-1', name: 'キャビネット', storages: cabinetStorages };
const deskLocation: Location = { id: 'loc-2', name: 'デスク', storages: deskStorages };

const list: Location[] = [
    cabinetLocation,
    deskLocation
];


export const locationHandler = [

    http.get('/locations', async () => HttpResponse.json<FetchLocationsResponse>({
        data: list,
        errors: [],
    }, { status: 200 })),

    http.get('/locations/:id', async ({ params }) => {

        const id = params.id as string;

        return HttpResponse.json<FetchLocationResponse>({
            data: id === 'L-000001'
                ? cabinetLocation : deskLocation,
            errors: []
        }, { status: 200 })
    }),
];

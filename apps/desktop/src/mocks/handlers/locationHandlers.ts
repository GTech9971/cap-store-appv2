import { FetchLocationResponse, FetchLocationsResponse, Location, Storage } from "cap-store-api-def";
import { http, HttpResponse } from "msw";

const cabinetStorages: Storage[] = [
    { id: 'S-000001', name: 'Cabinet 1段', locationId: 'L-000001', positionIndex: 1 },
    { id: 'S-000002', name: 'Cabinet 3段', locationId: 'L-000001', positionIndex: 3 },
]

const deskStorages: Storage[] = [
    { id: 'S-000003', name: 'Desk 上段', locationId: 'L-000002', positionIndex: 2 },
]

const cabinetLocation: Location = { id: 'L-000001', name: 'キャビネット', storages: cabinetStorages };
const deskLocation: Location = { id: 'L-000002', name: 'デスク', storages: deskStorages };

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
            data: id === 'L-000002'
                ? cabinetLocation
                : deskLocation,
            errors: []
        }, { status: 200 })
    }),
];

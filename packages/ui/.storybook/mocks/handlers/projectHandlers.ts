import { http, HttpResponse } from 'msw';
import {
    FetchProjectResponse,
    FetchProjectsResponse,
    Project,
    RegistryProjectRequest,
    RegistryProjectResponse,
    UpdateProjectRequest,
    UpdateProjectResponse
} from 'cap-store-api-def';

const initialProjectTimestamp = new Date('2025-01-01T09:00:00Z');

type MockProject = Omit<Project, 'createdAt' | 'lastModified'> & {
    createdAt: Date;
    lastModified: Date;
};

let projectStore: MockProject[] = [
    {
        id: 'P-001',
        name: 'IoT 温湿度モニタ',
        summary: '倉庫内の温度と湿度を遠隔監視するプロジェクト。',
        status: 'planning',
        description: 'BLE センサーノードとクラウドダッシュボードを組み合わせた監視システム。',
        tag: 'IoT',
        imgUrls: [
            {
                url: 'https://example.com/projects/iot-monitor/dashboard.png',
                title: 'ダッシュボード',
                tag: 'UI'
            },
            {
                url: 'https://example.com/projects/iot-monitor/hardware.jpg',
                title: 'センサーノード',
                tag: 'Hardware'
            }
        ],
        externalLinks: [
            {
                link: 'https://github.com/example/iot-monitor',
                title: 'GitHub',
                tag: 'Repository'
            },
            {
                link: 'https://docs.example.com/iot-monitor',
                title: '仕様書',
                tag: 'Docs'
            }
        ],
        createdAt: new Date(initialProjectTimestamp),
        lastModified: new Date(initialProjectTimestamp),
        bomList: [
            {
                id: 'B-001',
                componentId: 'C-001',
                quantity: 2,
                footPrintName: 'DIP-8',
                remarks: 'メインマイコン',
                refName: 'U1',
                supplier: undefined
            },
            {
                id: 'B-002',
                componentId: 'C-010',
                quantity: 4,
                footPrintName: '0402',
                remarks: 'センサーバイパス',
                refName: 'C1-C4',
                supplier: undefined
            }
        ]
    }
];

export const projectHandlers = [
    http.get('/projects', () => {
        const totalCount = projectStore.length;
        return HttpResponse.json<FetchProjectsResponse>({
            data: projectStore,
            pageIndex: 1,
            pageSize: totalCount,
            totalPages: 1,
            totalCount,
            hasNext: false,
            hasPrevious: false,
            errors: []
        }, { status: 200 });
    }),

    http.get('/projects/:projectId', ({ params }) => {
        const project = projectStore.find((item) => item.id === params.projectId);
        if (!project) {
            return HttpResponse.json<FetchProjectResponse>({
                data: undefined,
                errors: []
            }, { status: 404 });
        }

        return HttpResponse.json<FetchProjectResponse>({
            data: project,
            errors: []
        }, { status: 200 });
    }),

    http.post('/projects', async ({ request }) => {
        const body = await request.json() as RegistryProjectRequest;

        const newId = `P-${String(projectStore.length + 1).padStart(3, '0')}`;
        const timestamp = new Date();
        const newProject: MockProject = {
            id: newId,
            name: body.name,
            summary: body.summary,
            status: 'planning',
            description: body.description,
            tag: body.tag,
            imgUrls: body.imgUrls?.map((img) => ({
                url: img.url,
                title: img.title,
                tag: img.tag
            })),
            externalLinks: body.externalLinks?.map((link) => ({
                link: link.link,
                title: link.title,
                tag: link.tag
            })),
            createdAt: timestamp,
            lastModified: timestamp,
            // bomList: body.bomList?.map((bom) => ({
            //     id: bom.id ?? `B-${Date.now()}`,
            //     componentId: bom.componentId,
            //     quantity: bom.quantity,
            //     footPrintName: bom.footPrintName,
            //     remarks: bom.remarks,
            //     refName: bom.refName
            // })) ?? []
        };

        projectStore = [...projectStore, newProject];

        return HttpResponse.json<RegistryProjectResponse>({
            data: { projectId: newId },
            errors: []
        }, { status: 201 });
    }),

    http.patch('/projects/:projectId', async ({ params, request }) => {
        const projectId = params.projectId as string;
        const index = projectStore.findIndex((item) => item.id === projectId);
        if (index === -1) {
            return HttpResponse.json<UpdateProjectResponse>({
                data: undefined,
                errors: []
            }, { status: 404 });
        }

        const url = new URL(request.url);
        const fieldMasks = url.searchParams.getAll('fieldMask');
        const body = await request.json() as UpdateProjectRequest;

        const current = projectStore[index];
        const next: MockProject = {
            ...current,
            imgUrls: current.imgUrls ? current.imgUrls.map((img) => ({ ...img })) : undefined,
            externalLinks: current.externalLinks ? current.externalLinks.map((link) => ({ ...link })) : undefined,
            bomList: current.bomList ? current.bomList.map((bom) => ({ ...bom })) : undefined,
        };

        const applyOptionalText = (field: keyof MockProject, value: string | undefined) => {
            if (value === undefined || value === null) {
                delete (next as Record<string, unknown>)[field];
            } else {
                (next as Record<string, unknown>)[field] = value;
            }
        };

        fieldMasks.forEach((mask) => {
            switch (mask) {
                case 'name':
                    if (body.name !== undefined) next.name = body.name;
                    break;
                case 'summary':
                    if (body.summary !== undefined) next.summary = body.summary;
                    break;
                case 'status':
                    if (body.status !== undefined) next.status = body.status;
                    break;
                case 'description':
                    applyOptionalText('description', body.description);
                    break;
                case 'tag':
                    applyOptionalText('tag', body.tag);
                    break;
                case 'imgUrls':
                    next.imgUrls = body.imgUrls?.map((img) => ({
                        url: img.url,
                        title: img.title,
                        tag: img.tag
                    }));
                    break;
                case 'externalLinks':
                    next.externalLinks = body.externalLinks?.map((link) => ({
                        link: link.link,
                        title: link.title,
                        tag: link.tag
                    }));
                    break;
                case 'bomList':
                    next.bomList = body.bomList?.map((bom) => ({
                        id: bom.id ?? '',
                        componentId: bom.componentId,
                        quantity: bom.quantity,
                        footPrintName: bom.footPrintName,
                        remarks: bom.remarks,
                        refName: bom.refName,
                        supplier: bom.supplier
                    })) ?? [];
                    break;
                default:
                    break;
            }
        });

        next.lastModified = new Date();
        projectStore[index] = next;

        return HttpResponse.json<UpdateProjectResponse>({
            data: next,
            errors: []
        }, { status: 200 });
    }),

    http.delete('/projects/:projectId', ({ params }) => {
        const projectId = params.projectId as string;
        const index = projectStore.findIndex((item) => item.id === projectId);
        if (index === -1) {
            return HttpResponse.json(undefined, { status: 404 });
        }

        projectStore.splice(index, 1);
        return HttpResponse.json(undefined, { status: 204 });
    })
];

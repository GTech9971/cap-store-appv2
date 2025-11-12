import { http, HttpResponse } from 'msw';
import type {
    FetchProjectHistoriesResponse,
    FetchProjectHistoryResponse,
    Project,
    ProjectHistory,
    ProjectHistoryChangeType,
    RevertProjectResponse
} from 'cap-store-api-def';
type MockProjectHistory = Omit<ProjectHistory, 'createdAt'> & { createdAt: Date };
type MockProjectSnapshot = Omit<Project, 'createdAt' | 'lastModified'> & {
    createdAt: Date;
    lastModified: Date;
};
const formatHistoryId = (projectId: string, sequence: number) =>
    `${projectId}-H-${sequence.toString().padStart(6, '0')}`;
const createHistory = (
    projectId: string,
    sequence: number,
    createdAtIso: string,
    changeType: ProjectHistoryChangeType,
    message: string,
    changedFields?: string[]
): MockProjectHistory => ({
    historyId: formatHistoryId(projectId, sequence),
    projectId,
    createdAt: new Date(createdAtIso),
    message,
    changeType,
    changedFields,
});
const createProjectSnapshot = (projectId: string): MockProjectSnapshot => ({
    id: projectId,
    name: 'IoT 温湿度モニタ',
    summary: '倉庫内の温度と湿度を遠隔監視するプロジェクト。',
    status: 'processing',
    isDeleted: false,
    description: 'BLE センサーノードとクラウドダッシュボードを組み合わせた監視システム。',
    tag: 'IoT',
    imgUrls: [
        {
            url: 'https://example.com/projects/iot-monitor/dashboard.png',
            title: 'ダッシュボード',
            tag: 'UI'
        }
    ],
    externalLinks: [
        {
            link: 'https://github.com/example/iot-monitor',
            title: 'GitHub',
            tag: 'Repository'
        }
    ],
    bomList: [
        {
            id: 'B-001',
            componentId: 'C-001',
            quantity: 2,
            footPrintName: 'DIP-8',
            remarks: 'メインマイコン',
            refName: 'U1'
        }
    ],
    createdAt: new Date('2024-12-28T09:00:00Z'),
    lastModified: new Date('2024-12-28T09:00:00Z'),
});
const projectIds = ['P-000001', 'P-001'] as const;
const historyStore: Record<string, MockProjectHistory[]> = Object.fromEntries(
    projectIds.map((projectId) => [
        projectId,
        [
            createHistory(
                projectId,
                5,
                '2025-01-06T08:30:00Z',
                'deleted',
                'プロジェクトを削除しました。',
                ['status']
            ),
            createHistory(
                projectId,
                4,
                '2025-01-05T12:45:00Z',
                'updated',
                'BOM を更新しました。さらにプロジェクト概要も更新しています',
                ['bomList', 'summary', 'name', 'externalLinks']
            ),

            createHistory(
                projectId,
                3,
                '2025-01-04T18:20:00Z',
                'updated',
                '概要とタグを更新しました。',
                ['summary', 'tag']
            ),
            createHistory(
                projectId,
                2,
                '2025-01-03T10:05:00Z',
                'restored',
                '過去の構成へ復元しました。',
                ['description', 'status']
            ),
            createHistory(
                projectId,
                1,
                '2025-01-01T09:00:00Z',
                'created',
                'プロジェクトを作成しました。',
                ['name', 'summary', 'description']
            ),
        ],
    ])
) as Record<string, MockProjectHistory[]>;
const projectSnapshots: Record<string, MockProjectSnapshot> = Object.fromEntries(
    projectIds.map((projectId) => [projectId, createProjectSnapshot(projectId)])
) as Record<string, MockProjectSnapshot>;
const cloneHistory = (history: MockProjectHistory): ProjectHistory => ({
    ...history,
    createdAt: new Date(history.createdAt),
    changedFields: history.changedFields ? [...history.changedFields] : undefined,
});
const getHistories = (projectId: string): MockProjectHistory[] =>
    historyStore[projectId]?.slice().sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) ?? [];
const findHistory = (projectId: string, historyId: string): MockProjectHistory | undefined =>
    historyStore[projectId]?.find((history) => history.historyId === historyId);
const buildRevertedProject = (projectId: string, history: MockProjectHistory): Project => {
    const baseSnapshot = projectSnapshots[projectId] ?? createProjectSnapshot(projectId);
    return {
        ...baseSnapshot,
        imgUrls: baseSnapshot.imgUrls ? baseSnapshot.imgUrls.map((img) => ({ ...img })) : undefined,
        externalLinks: baseSnapshot.externalLinks ? baseSnapshot.externalLinks.map((link) => ({ ...link })) : undefined,
        bomList: baseSnapshot.bomList ? baseSnapshot.bomList.map((bom) => ({ ...bom })) : undefined,
        createdAt: new Date(baseSnapshot.createdAt),
        lastModified: new Date(history.createdAt),
    };
};
export const projectHistoryHandlers = [
    http.get('/projects/:projectId/histories', ({ params }) => {
        const projectId = params.projectId as string;
        const histories = getHistories(projectId);
        return HttpResponse.json<FetchProjectHistoriesResponse>({
            data: histories.map(cloneHistory),
            errors: [],
        }, { status: 200 });
    }),
    http.get('/projects/:projectId/histories/latest', ({ params }) => {
        const projectId = params.projectId as string;
        const histories = getHistories(projectId);
        const latest = histories[0];
        if (!latest) {
            return HttpResponse.json<FetchProjectHistoryResponse>({
                data: undefined,
                errors: [],
            }, { status: 404 });
        }
        return HttpResponse.json<FetchProjectHistoryResponse>({
            data: cloneHistory(latest),
            errors: [],
        }, { status: 200 });
    }),
    http.get('/projects/:projectId/histories/:historyId', ({ params }) => {
        const projectId = params.projectId as string;
        const historyId = params.historyId as string;
        const history = findHistory(projectId, historyId);
        if (!history) {
            return HttpResponse.json<FetchProjectHistoryResponse>({
                data: undefined,
                errors: [],
            }, { status: 404 });
        }
        return HttpResponse.json<FetchProjectHistoryResponse>({
            data: cloneHistory(history),
            errors: [],
        }, { status: 200 });
    }),
    http.post('/projects/:projectId/histories/:historyId\\:revert', ({ params }) => {
        const projectId = params.projectId as string;
        const historyId = params.historyId as string;
        const history = findHistory(projectId, historyId);
        if (!history) {
            return HttpResponse.json<RevertProjectResponse>({
                data: undefined,
                errors: [],
            }, { status: 404 });
        }
        return HttpResponse.json<RevertProjectResponse>({
            data: buildRevertedProject(projectId, history),
            errors: [],
        }, { status: 200 });
    }),
];

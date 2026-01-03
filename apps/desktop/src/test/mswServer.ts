import { setupServer } from 'msw/node';

// 各テストで server.use(...) でハンドラを差し替える想定
export const server = setupServer();


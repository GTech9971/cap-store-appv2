import { afterAll, beforeAll } from 'vitest';
import { server } from './mswServer';
import { afterEach } from 'node:test';

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
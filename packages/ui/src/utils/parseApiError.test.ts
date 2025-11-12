import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../test/mswServer';
import { ComponentsApi } from 'cap-store-api-def';
import { parseApiError } from './parseApiError';

describe('parseApiError', () => {
  it('ResponseError: エラーレスポンス(JSON)を正しく解析する', async () => {
    const baseUrl = 'http://localhost:5000';
    const path = '/components/abc123';

    server.use(
      http.get(`${baseUrl}${path}`, () => {
        return HttpResponse.json(
          {
            data: null,
            errors: [{ message: 'サーバーで検証エラー', detail: 'C-000010', code: 'VALIDATION_ERROR' }]
          },
          { status: 400 },
        );
      }),
    );

    const api = new ComponentsApi();
    try {
      await api.fetchComponent({ componentId: 'abc123' });
      throw new Error('should not reach');
    } catch (err) {
      const parsed = await parseApiError(err);
      expect(parsed.message).toBe('サーバーで検証エラー');
      expect(parsed.code).toBe('VALIDATION_ERROR');
      expect(parsed.detail).toBe('C-000010');
      expect(parsed.status).toBe(400);
    }
  });

  it('ResponseError: JSONでないレスポンス時は err.message を返す', async () => {
    const baseUrl = 'http://localhost:5000';
    const path = '/components/invalid-json';

    server.use(
      http.get(`${baseUrl}${path}`, () => {
        return new HttpResponse('Internal Server Error', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        });
      }),
    );

    // fetchComponent を呼ぶために存在するパスに合わせておく
    const api = new ComponentsApi();
    try {
      await api.fetchComponent({ componentId: 'invalid-json' });
      throw new Error('should not reach');
    } catch (err) {
      const parsed = await parseApiError(err);
      // runtime.ts で ResponseError 作成時のメッセージ
      expect(parsed.message).toBe('Response returned an error code');
      expect(parsed.code).toBeUndefined();
      expect(parsed.status).toBeUndefined();
    }
  });

  it('ネイティブ Error をそのままメッセージ化する', async () => {
    const err = new Error('単純なエラー');
    const parsed = await parseApiError(err);
    expect(parsed.message).toBe('単純なエラー');
    expect(parsed.code).toBeUndefined();
    expect(parsed.status).toBeUndefined();
  });

  it('unknown の場合はデフォルトメッセージを返す', async () => {
    const parsed = await parseApiError({});
    expect(parsed.message).toBe('予期せぬエラーが発生しました');
    expect(parsed.code).toBeUndefined();
    expect(parsed.status).toBeUndefined();
  });
});


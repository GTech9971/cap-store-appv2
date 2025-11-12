// src/utils/parseApiError.ts
import { ResponseError } from 'cap-store-api-def';

export type ParsedError = { message: string; code?: string, detail?: string, status?: number };


// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isResponseError(value: any): value is ResponseError {
    return (
        typeof value === "object" &&
        value !== null &&
        typeof value.response === 'object'
    );
}

/**
 * API 呼び出しで受け取った例外を解析し、
 * { message, code } の形で返す
 */
export async function parseApiError(err: unknown): Promise<ParsedError> {
    console.error(err);
    // デフォルトのメッセージ
    let message = '予期せぬエラーが発生しました';
    let code: string | undefined;
    let detail: string | undefined;
    let status: number | undefined;

    // cap-store-api-def の ResponseError であれば
    if (isResponseError(err)) {
        try {
            // レスポンスボディを JSON で読み込み
            const body = await err.response.json();
            // OpenAPI 仕様の errors 配列を期待
            if (Array.isArray(body.errors) && body.errors.length > 0) {
                message = body.errors[0].message;
                code = body.errors[0].code;
                detail = body.errors[0].detail;
            }
            status = err.response.status;
        } catch (parseError) {
            console.warn(parseError);
            // JSON パースに失敗したら、ResponseError.message を使う
            message = err.message;
            status = err.response.status;
        }
    }
    // ネイティブ Error の場合
    else if (err instanceof Error) {
        message = err.message;
    }

    return { message, code, detail, status };
}
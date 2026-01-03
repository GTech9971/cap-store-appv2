import { env } from "@/config/env";
import { describe, expect, it } from "vitest";

describe("デフォルトロケーションHooksのテスト", () => {

    it("キャビネットのシリアル番号が取得できること", () => {
        const cabinetSerialNumber: string | undefined = env.LOCATIONS_CABINET_SERIAL_ID;

        expect(cabinetSerialNumber).toBe("SN-CAP25001");
    });
});
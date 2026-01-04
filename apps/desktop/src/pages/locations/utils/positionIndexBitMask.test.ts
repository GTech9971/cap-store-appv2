import { describe, expect, it } from "vitest";
import { cabinetPositionIndex2BitMask } from "./positionIndexBitMask";

describe("positionIndexが正確にビットマスクに変換できていること", () => {

    it("1~5の範囲外の場合、エラー", () => {
        expect(() => cabinetPositionIndex2BitMask(0)).toThrow(RangeError);
        expect(() => cabinetPositionIndex2BitMask(6)).toThrow(RangeError);
    });

    it.each([
        [
            1, 0b10000, "10000",
            2, 0b01000, "01000",
            3, 0b00100, "00100",
            4, 0b00010, "00010",
            5, 0b00001, "00001",
        ],
    ])("1~5", (value, expected, expectedStr) => {
        const actual: number = cabinetPositionIndex2BitMask(value);

        expect(actual).toBe(expected);

        const actualStr = actual.toString(2).padStart(5, "0");
        expect(actualStr).toBe(expectedStr);
    });

});
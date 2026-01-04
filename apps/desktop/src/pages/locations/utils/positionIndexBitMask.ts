/**
 * positionIndexの値をビット位置に変換してビットを立てた値を返す
 * @throws 範囲外はエラー
 * @example 5 -> 00001
 * @example 4 -> 00010
*/
export function cabinetPositionIndex2BitMask(positionIndex: number): number {
    if (positionIndex < 1 || positionIndex > 5) { throw new RangeError("positionIndexの値が1~5の範囲外です"); }

    const bitIndex: number = 5 - positionIndex;
    let bitMask: number = 0;
    bitMask |= 1 << bitIndex;
    return bitMask;
}
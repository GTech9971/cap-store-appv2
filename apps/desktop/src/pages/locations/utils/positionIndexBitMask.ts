/**
 * positionIndexの値をビット位置に変換してビットを立てた値を返す
 * @throws 範囲外はエラー
 * @example 5 -> 10000
 * @example 4 -> 01000
*/
export function cabinetPositionIndex2BitMask(positionIndex: number): number {
    if (positionIndex < 1 || positionIndex > 5) { throw new RangeError("positionIndexの値が1~5の範囲外です"); }

    let bitMask = 0;
    bitMask |= 1 << (positionIndex - 1);
    return bitMask;
}
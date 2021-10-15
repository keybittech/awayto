export default BigInteger;
declare function BigInteger(a: any, b: any): void;
declare class BigInteger {
    constructor(a: any, b: any);
    am: typeof am2;
    DB: number;
    DM: number;
    DV: number;
    FV: number;
    F1: number;
    F2: number;
    copyTo: typeof bnpCopyTo;
    fromInt: typeof bnpFromInt;
    fromString: typeof bnpFromString;
    clamp: typeof bnpClamp;
    dlShiftTo: typeof bnpDLShiftTo;
    drShiftTo: typeof bnpDRShiftTo;
    lShiftTo: typeof bnpLShiftTo;
    rShiftTo: typeof bnpRShiftTo;
    subTo: typeof bnpSubTo;
    multiplyTo: typeof bnpMultiplyTo;
    squareTo: typeof bnpSquareTo;
    divRemTo: typeof bnpDivRemTo;
    invDigit: typeof bnpInvDigit;
    addTo: typeof bnpAddTo;
    toString: typeof bnToString;
    negate: typeof bnNegate;
    abs: typeof bnAbs;
    compareTo: typeof bnCompareTo;
    bitLength: typeof bnBitLength;
    mod: typeof bnMod;
    equals: typeof bnEquals;
    add: typeof bnAdd;
    subtract: typeof bnSubtract;
    multiply: typeof bnMultiply;
    divide: typeof bnDivide;
    modPow: typeof bnModPow;
}
declare namespace BigInteger {
    const ZERO: BigInteger;
    const ONE: BigInteger;
}
declare function am2(i: any, x: any, w: any, j: any, c: any, n: any): any;
declare function bnpCopyTo(r: any): void;
declare function bnpFromInt(x: any): void;
declare class bnpFromInt {
    constructor(x: any);
    t: number;
    s: number;
    0: any;
}
declare function bnpFromString(s: any, b: any): void;
declare class bnpFromString {
    constructor(s: any, b: any);
    t: number;
    s: number;
}
declare function bnpClamp(): void;
declare function bnpDLShiftTo(n: any, r: any): void;
declare function bnpDRShiftTo(n: any, r: any): void;
declare function bnpLShiftTo(n: any, r: any): void;
declare function bnpRShiftTo(n: any, r: any): void;
declare function bnpSubTo(a: any, r: any): void;
declare function bnpMultiplyTo(a: any, r: any): void;
declare function bnpSquareTo(r: any): void;
declare function bnpDivRemTo(m: any, q: any, r: any): void;
declare function bnpInvDigit(): number;
declare function bnpAddTo(a: any, r: any): void;
declare function bnToString(b: any): string;
declare function bnNegate(): BigInteger;
declare function bnAbs(): any;
declare function bnCompareTo(a: any): number;
declare function bnBitLength(): number;
declare function bnMod(a: any): BigInteger;
declare function bnEquals(a: any): boolean;
declare function bnAdd(a: any): BigInteger;
declare function bnSubtract(a: any): BigInteger;
declare function bnMultiply(a: any): BigInteger;
declare function bnDivide(a: any): BigInteger;
declare function bnModPow(e: any, m: any, callback: any): BigInteger;

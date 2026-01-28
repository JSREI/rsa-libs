// BigInt, a suite of routines for performing multiple-precision arithmetic in
// JavaScript/TypeScript.
//
// Copyright 1998-2005 David Shapiro.
// TypeScript adaptation with types and exports added.

export interface BigIntType {
  digits: number[];
  isNeg: boolean;
}

// Global variables
let biRadixBase = 2;
let biRadixBits = 16;
let bitsPerDigit = biRadixBits;
let biRadix = 1 << 16; // = 2^16 = 65536
let biHalfRadix = biRadix >>> 1;
let biRadixSquared = biRadix * biRadix;
let maxDigitVal = biRadix - 1;
let maxInteger = 9999999999999998; 

let maxDigits: number;
let ZERO_ARRAY: number[];
let bigZero: BigIntType, bigOne: BigIntType;

export function setMaxDigits(value: number): void {
  maxDigits = value;
  ZERO_ARRAY = new Array(maxDigits);
  for (let iza = 0; iza < ZERO_ARRAY.length; iza++) ZERO_ARRAY[iza] = 0;
  bigZero = createBigInt();
  bigOne = createBigInt();
  bigOne.digits[0] = 1;
}

setMaxDigits(20);

// The maximum number of digits in base 10 you can convert to an
// integer without JavaScript throwing up on you.
let dpl10 = 15;
// lr10 = 10 ^ dpl10
let lr10 = biFromNumber(1000000000000000);

// Helper function to create a BigInt instance
export function createBigInt(flag?: boolean): BigIntType {
  const result: BigIntType = {
    digits: (typeof flag === "boolean" && flag) ? [] : ZERO_ARRAY.slice(0),
    isNeg: false
  };
  return result;
}

// Original BigInt function - keep for backward compatibility
export function BigInt(flag?: boolean): BigIntType {
  return createBigInt(flag);
}

export function biFromDecimal(s: string): BigIntType {
  let isNeg = s.charAt(0) === '-';
  let i = isNeg ? 1 : 0;
  let result: BigIntType;
  
  // Skip leading zeros.
  while (i < s.length && s.charAt(i) === '0') ++i;
  
  if (i === s.length) {
    result = createBigInt();
  } else {
    let digitCount = s.length - i;
    let fgl = digitCount % dpl10;
    if (fgl === 0) fgl = dpl10;
    result = biFromNumber(Number(s.substr(i, fgl)));
    i += fgl;
    while (i < s.length) {
      result = biAdd(biMultiply(result, lr10), biFromNumber(Number(s.substr(i, dpl10))));
      i += dpl10;
    }
    result.isNeg = isNeg;
  }
  return result;
}

export function biCopy(bi: BigIntType): BigIntType {
  let result = createBigInt(true);
  result.digits = bi.digits.slice(0);
  result.isNeg = bi.isNeg;
  return result;
}

export function biFromNumber(i: number): BigIntType {
  let result = createBigInt();
  result.isNeg = i < 0;
  i = Math.abs(i);
  let j = 0;
  while (i > 0) {
    result.digits[j++] = i & maxDigitVal;
    i = Math.floor(i / biRadix);
  }
  return result;
}

function reverseStr(s: string): string {
  let result = "";
  for (let i = s.length - 1; i > -1; --i) {
    result += s.charAt(i);
  }
  return result;
}

const hexatrigesimalToChar = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
  'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
  'u', 'v', 'w', 'x', 'y', 'z'
];

export function biToString(x: BigIntType, radix: number): string {
  // 2 <= radix <= 36
  let b = createBigInt();
  b.digits[0] = radix;
  let qr = biDivideModulo(x, b);
  let result = hexatrigesimalToChar[qr[1].digits[0]];
  while (biCompare(qr[0], bigZero) === 1) {
    qr = biDivideModulo(qr[0], b);
    let digit = qr[1].digits[0];
    result += hexatrigesimalToChar[digit];
  }
  return (x.isNeg ? "-" : "") + reverseStr(result);
}

export function biToDecimal(x: BigIntType): string {
  let b = createBigInt();
  b.digits[0] = 10;
  let qr = biDivideModulo(x, b);
  let result = String(qr[1].digits[0]);
  while (biCompare(qr[0], bigZero) === 1) {
    qr = biDivideModulo(qr[0], b);
    result += String(qr[1].digits[0]);
  }
  return (x.isNeg ? "-" : "") + reverseStr(result);
}

const hexToChar = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                   'a', 'b', 'c', 'd', 'e', 'f'];

function digitToHex(n: number): string {
  let mask = 0xf;
  let result = "";
  for (let i = 0; i < 4; ++i) {
    result += hexToChar[n & mask];
    n >>>= 4;
  }
  return reverseStr(result);
}

export function biToHex(x: BigIntType): string {
  let result = "";
  for (let i = biHighIndex(x); i > -1; --i) {
    result += digitToHex(x.digits[i]);
  }
  return result;
}

function charToHex(c: number): number {
  const ZERO = 48;
  const NINE = ZERO + 9;
  const littleA = 97;
  const littleZ = littleA + 25;
  const bigA = 65;
  const bigZ = 65 + 25;
  let result;

  if (c >= ZERO && c <= NINE) {
    result = c - ZERO;
  } else if (c >= bigA && c <= bigZ) {
    result = 10 + c - bigA;
  } else if (c >= littleA && c <= littleZ) {
    result = 10 + c - littleA;
  } else {
    result = 0;
  }
  return result;
}

function hexToDigit(s: string): number {
  let result = 0;
  let sl = Math.min(s.length, 4);
  for (let i = 0; i < sl; ++i) {
    result <<= 4;
    result |= charToHex(s.charCodeAt(i))
  }
  return result;
}

export function biFromHex(s: string): BigIntType {
  let result = createBigInt();
  let sl = s.length;
  let i = 0, j = 0;
  let c: string;
  for (i = sl - 1; i > -1; i -= 4) {
    let subs = s.substring(Math.max(0, i-3), i+1);
    result.digits[j++] = hexToDigit(subs);
  }
  return result;
}

export function biFromString(s: string, radix: number): BigIntType {
  let isNeg = s.charAt(0) === '-';
  let istop = isNeg ? 1 : 0;
  let result = createBigInt();
  let place = createBigInt();
  place.digits[0] = 1; // radix^0
  
  for (let i = s.length - 1; i >= istop; i--) {
    let c = s.charCodeAt(i);
    let digit = charToHex(c);
    let biDigit = biMultiplyDigit(place, digit);
    result = biAdd(result, biDigit);
    place = biMultiplyDigit(place, radix);
  }
  result.isNeg = isNeg;
  return result;
}

export function biDump(b: BigIntType): void {
  let s = b.isNeg ? "-" : "";
  for (let i = b.digits.length - 1; i > -1; i--) {
    s += b.digits[i];
  }
}

export function biAdd(x: BigIntType, y: BigIntType): BigIntType {
  let result: BigIntType;
  
  if (x.isNeg !== y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biSubtract(x, y);
    y.isNeg = !y.isNeg;
  } else {
    result = createBigInt();
    let c = 0;
    let n;
    for (let i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] + y.digits[i] + c;
      result.digits[i] = n % biRadix;
      c = Number(n >= biRadix);
    }
    result.isNeg = x.isNeg;
  }
  return result;
}

export function biSubtract(x: BigIntType, y: BigIntType): BigIntType {
  let result: BigIntType;
  if (x.isNeg !== y.isNeg) {
    y.isNeg = !y.isNeg;
    result = biAdd(x, y);
    y.isNeg = !y.isNeg;
  } else {
    result = createBigInt();
    let n, c;
    c = 0;
    for (let i = 0; i < x.digits.length; ++i) {
      n = x.digits[i] - y.digits[i] + c;
      result.digits[i] = n % biRadix;
      // Stupid non-conforming modulus operation.
      if (result.digits[i] < 0) result.digits[i] += biRadix;
      c = 0 - Number(n < 0);
    }
    // Fix up the negative sign, if any.
    if (c === -1) {
      c = 0;
      for (let i = 0; i < x.digits.length; ++i) {
        n = 0 - result.digits[i] + c;
        result.digits[i] = n % biRadix;
        // Stupid non-conforming modulus operation.
        if (result.digits[i] < 0) result.digits[i] += biRadix;
        c = 0 - Number(n < 0);
      }
      // Result is opposite sign of arguments.
      result.isNeg = !x.isNeg;
    } else {
      // Result is same sign.
      result.isNeg = x.isNeg;
    }
  }
  return result;
}

export function biHighIndex(x: BigIntType): number {
  let result = x.digits.length - 1;
  while (result > 0 && x.digits[result] === 0) --result;
  return result;
}

export function biNumBits(x: BigIntType): number {
  let n = biHighIndex(x);
  let d = x.digits[n];
  let m = (n + 1) * bitsPerDigit;
  let result;
  for (result = m; result > m - bitsPerDigit; --result) {
    if ((d & 0x8000) !== 0) break;
    d <<= 1;
  }
  return result;
}

export function biMultiply(x: BigIntType, y: BigIntType): BigIntType {
  let result = createBigInt();
  let c;
  let n = biHighIndex(x);
  let t = biHighIndex(y);
  let u, uv, k;

  for (let i = 0; i <= t; ++i) {
    c = 0;
    k = i;
    for (let j = 0; j <= n; ++j, ++k) {
      uv = result.digits[k] + x.digits[j] * y.digits[i] + c;
      result.digits[k] = uv & maxDigitVal;
      c = uv >>> biRadixBits;
    }
    result.digits[i + n + 1] = c;
  }
  // Someone give me a logical xor, please.
  result.isNeg = x.isNeg != y.isNeg;
  return result;
}

export function biMultiplyDigit(x: BigIntType, y: number): BigIntType {
  let result = createBigInt();
  let c = 0;
  let n;
  for (let i = 0; i < x.digits.length; ++i) {
    n = result.digits[i] + x.digits[i] * y + c;
    result.digits[i] = n & maxDigitVal;
    c = n >>> biRadixBits;
  }
  result.digits[x.digits.length] = c;
  result.isNeg = x.isNeg;
  return result;
}

export function arrayCopy(src: number[] | BigIntType, srcStart: number, dest: number[] | BigIntType, destStart: number, n: number): void {
  // Use type guards to handle different types
  const srcArray = Array.isArray(src) ? src : src.digits;
  const destArray = Array.isArray(dest) ? dest : dest.digits;
  
  let m = Math.min(srcStart + n, srcArray.length);
  for (let i = srcStart, j = destStart; i < m; ++i, ++j) {
    destArray[j] = srcArray[i];
  }
}

export function biShiftLeft(x: BigIntType, n: number): BigIntType {
  let result = createBigInt();
  arrayCopy(x.digits, 0, result.digits, 0, x.digits.length);
  let bits = n % bitsPerDigit;
  let leftBits = bitsPerDigit - bits;
  
  for (let i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
    result.digits[i1] |= (result.digits[i] & biHighBitMasks[bits]) >>> leftBits;
    result.digits[i] = (result.digits[i] & biLowBitMasks[bits]) << bits;
  }
  
  result.digits[result.digits.length - 1] = (result.digits[result.digits.length - 1] & biLowBitMasks[bits]) << bits;
  result.isNeg = x.isNeg;
  return result;
}

const biHighBitMasks = [0x0000, 0x8000, 0xc000, 0xe000, 0xf000, 0xf800, 0xfc00, 0xfe00, 0xff00, 0xff80, 0xffc0, 0xffe0, 0xfff0, 0xfff8, 0xfffc, 0xfffe, 0xffff];

const biLowBitMasks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000f, 0x001f, 0x003f, 0x007f, 0x00ff, 0x01ff, 0x03ff, 0x07ff, 0x0fff, 0x1fff, 0x3fff, 0x7fff, 0xffff];

export function biShiftRight(x: BigIntType, n: number): BigIntType {
  let result = createBigInt();
  arrayCopy(x.digits, 0, result.digits, 0, x.digits.length);
  let bits = n % bitsPerDigit;
  let rightBits = bitsPerDigit - bits;
  
  for (let i = 0, i1 = i + 1; i < result.digits.length - 1; ++i, ++i1) {
    result.digits[i] = (result.digits[i] >>> bits) | ((result.digits[i1] & biLowBitMasks[bits]) << rightBits);
  }
  
  result.digits[result.digits.length - 1] >>>= bits;
  result.isNeg = x.isNeg;
  return result;
}

export function biMultiplyByRadixPower(x: BigIntType, n: number): BigIntType {
  let result = createBigInt();
  arrayCopy(x.digits, 0, result.digits, n, result.digits.length - n);
  return result;
}

export function biDivideByRadixPower(x: BigIntType, n: number): BigIntType {
  let result = createBigInt();
  arrayCopy(x.digits, n, result.digits, 0, x.digits.length - n);
  return result;
}

export function biModuloByRadixPower(x: BigIntType, n: number): BigIntType {
  let result = createBigInt();
  arrayCopy(x.digits, 0, result.digits, 0, n);
  return result;
}

export function biCompare(x: BigIntType, y: BigIntType): number {
  if (x.isNeg !== y.isNeg) {
    return 1 - 2 * Number(x.isNeg);
  }
  for (let i = x.digits.length - 1; i >= 0; --i) {
    if (x.digits[i] !== y.digits[i]) {
      if (x.isNeg) {
        return 1 - 2 * Number(x.digits[i] > y.digits[i]);
      } else {
        return 1 - 2 * Number(x.digits[i] < y.digits[i]);
      }
    }
  }
  return 0;
}

export function biDivideModulo(x: BigIntType, y: BigIntType): [BigIntType, BigIntType] {
  let nb = biNumBits(x);
  let tb = biNumBits(y);
  let origYIsNeg = y.isNeg;
  let q, r;
  
  if (nb < tb) {
    // |x| < |y|
    if (x.isNeg) {
      q = createBigInt();
      q.isNeg = !y.isNeg;
      x.isNeg = false;
      y.isNeg = false;
      r = biSubtract(y, x);
      x.isNeg = true;
      y.isNeg = origYIsNeg;
    } else {
      q = createBigInt();
      r = createBigInt();
    }
    return [q, r];
  }
  
  q = createBigInt();
  r = createBigInt();
  
  // Normalize Y.
  let t = Math.ceil(tb / bitsPerDigit) - 1;
  let lambda = 0;
  while (y.digits[t] < biHalfRadix) {
    y = biShiftLeft(y, 1);
    ++lambda;
    ++tb;
    t = Math.ceil(tb / bitsPerDigit) - 1;
  }
  
  r = biShiftLeft(r, lambda);
  nb += lambda; // Update the bit count for x.
  let n = Math.ceil(nb / bitsPerDigit) - 1;
  
  let b = biMultiplyByRadixPower(y, n - t);
  while (biCompare(r, b) !== -1) {
    ++q.digits[n - t];
    r = biSubtract(r, b);
  }
  for (let i = n; i > t; --i) {
    let ri = (i >= r.digits.length) ? 0 : r.digits[i];
    let ri1 = (i - 1 >= r.digits.length) ? 0 : r.digits[i - 1];
    let ri2 = (i - 2 >= r.digits.length) ? 0 : r.digits[i - 2];
    let yt = (t >= y.digits.length) ? 0 : y.digits[t];
    let yt1 = (t - 1 >= y.digits.length) ? 0 : y.digits[t - 1];
    
    if (ri === yt) {
      q.digits[i - t - 1] = maxDigitVal;
    } else {
      q.digits[i - t - 1] = Math.floor((ri * biRadix + ri1) / yt);
    }
    
    let c1 = q.digits[i - t - 1] * ((yt * biRadix) + yt1);
    let c2 = (ri * biRadixSquared) + ((ri1 * biRadix) + ri2);
    
    while (c1 > c2) {
      --q.digits[i - t - 1];
      c1 = q.digits[i - t - 1] * ((yt * biRadix) | yt1);
      c2 = (ri * biRadix * biRadix) + ((ri1 * biRadix) + ri2);
    }
    
    b = biMultiplyByRadixPower(y, i - t - 1);
    r = biSubtract(r, biMultiplyDigit(b, q.digits[i - t - 1]));
    if (r.isNeg) {
      r = biAdd(r, b);
      --q.digits[i - t - 1];
    }
  }
  
  r = biShiftRight(r, lambda);
  // Fiddle with the signs and stuff to make sure that 0 <= r < y.
  q.isNeg = x.isNeg !== origYIsNeg;
  if (x.isNeg) {
    if (origYIsNeg) {
      q = biAdd(q, bigOne);
    } else {
      q = biSubtract(q, bigOne);
    }
    y = biShiftRight(y, lambda);
    r = biSubtract(y, r);
  }
  
  // Check for the unbelievably stupid degenerate case of r = 0.
  if (r.digits[0] === 0 && biHighIndex(r) === 0) r.isNeg = false;
  
  return [q, r];
}

export function biDivide(x: BigIntType, y: BigIntType): BigIntType {
  return biDivideModulo(x, y)[0];
}

export function biModulo(x: BigIntType, y: BigIntType): BigIntType {
  return biDivideModulo(x, y)[1];
}

export function biMultiplyMod(x: BigIntType, y: BigIntType, m: BigIntType): BigIntType {
  return biModulo(biMultiply(x, y), m);
}

export function biPow(x: BigIntType, y: number): BigIntType {
  let result = bigOne;
  let a = x;
  while (true) {
    if ((y & 1) !== 0) result = biMultiply(result, a);
    y >>= 1;
    if (y === 0) break;
    a = biMultiply(a, a);
  }
  return result;
}

export function biPowMod(x: BigIntType, y: BigIntType, m: BigIntType): BigIntType {
  let result = bigOne;
  let a = x;
  let k = y;
  while (true) {
    if ((k.digits[0] & 1) !== 0) result = biMultiplyMod(result, a, m);
    k = biShiftRight(k, 1);
    if (k.digits[0] === 0 && biHighIndex(k) === 0) break;
    a = biMultiplyMod(a, a, m);
  }
  return result;
} 
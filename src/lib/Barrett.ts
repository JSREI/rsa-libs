// BarrettMu, a class for performing Barrett modular reduction computations in
// TypeScript.
//
// Based on original JavaScript version by David Shapiro (2004-2005)
// Converted to TypeScript

import {
  BigIntType,
  biCopy,
  biHighIndex,
  biDivide,
  biModulo,
  biMultiply,
  biDivideByRadixPower,
  biModuloByRadixPower,
  biSubtract,
  biAdd,
  biCompare,
  biShiftRight,
  BigInt
} from './BigInt';

export interface BarrettMuType {
  modulus: BigIntType;
  k: number;
  mu: BigIntType;
  bkplus1: BigIntType;
  modulo: (x: BigIntType) => BigIntType;
  multiplyMod: (x: BigIntType, y: BigIntType) => BigIntType;
  powMod: (x: BigIntType, y: BigIntType) => BigIntType;
}

export function BarrettMu(m: BigIntType): BarrettMuType {
  const barrettMu: BarrettMuType = {
    modulus: biCopy(m),
    k: biHighIndex(m) + 1,
    mu: {} as BigIntType,
    bkplus1: {} as BigIntType,
    modulo: () => ({} as BigIntType),
    multiplyMod: () => ({} as BigIntType),
    powMod: () => ({} as BigIntType)
  };
  
  // Initialize properties
  const b2k = BigInt();
  b2k.digits[2 * barrettMu.k] = 1; // b2k = b^(2k)
  barrettMu.mu = biDivide(b2k, barrettMu.modulus);
  barrettMu.bkplus1 = BigInt();
  barrettMu.bkplus1.digits[barrettMu.k + 1] = 1; // bkplus1 = b^(k+1)
  
  // Set methods
  barrettMu.modulo = (x: BigIntType) => {
    return BarrettMu_modulo(barrettMu, x);
  };
  
  barrettMu.multiplyMod = (x: BigIntType, y: BigIntType) => {
    return BarrettMu_multiplyMod(barrettMu, x, y);
  };
  
  barrettMu.powMod = (x: BigIntType, y: BigIntType) => {
    return BarrettMu_powMod(barrettMu, x, y);
  };
  
  return barrettMu;
}

function BarrettMu_modulo(barrett: BarrettMuType, x: BigIntType): BigIntType {
  const q1 = biDivideByRadixPower(x, barrett.k - 1);
  const q2 = biMultiply(q1, barrett.mu);
  const q3 = biDivideByRadixPower(q2, barrett.k + 1);
  const r1 = biModuloByRadixPower(x, barrett.k + 1);
  const r2term = biMultiply(q3, barrett.modulus);
  const r2 = biModuloByRadixPower(r2term, barrett.k + 1);
  let r = biSubtract(r1, r2);
  
  if (r.isNeg) {
    r = biAdd(r, barrett.bkplus1);
  }
  
  let rgtem = biCompare(r, barrett.modulus) >= 0;
  while (rgtem) {
    r = biSubtract(r, barrett.modulus);
    rgtem = biCompare(r, barrett.modulus) >= 0;
  }
  
  return r;
}

function BarrettMu_multiplyMod(barrett: BarrettMuType, x: BigIntType, y: BigIntType): BigIntType {
  /*
  x = this.modulo(x);
  y = this.modulo(y);
  */
  const xy = biMultiply(x, y);
  return barrett.modulo(xy);
}

function BarrettMu_powMod(barrett: BarrettMuType, x: BigIntType, y: BigIntType): BigIntType {
  let result = BigInt();
  result.digits[0] = 1;
  let a = x;
  let k = y;
  
  while (true) {
    if ((k.digits[0] & 1) !== 0) result = barrett.multiplyMod(result, a);
    k = biShiftRight(k, 1);
    if (k.digits[0] === 0 && biHighIndex(k) === 0) break;
    a = barrett.multiplyMod(a, a);
  }
  
  return result;
} 
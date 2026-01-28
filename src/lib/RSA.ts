// RSA, a suite of routines for performing RSA public-key computations in
// TypeScript.
//
// Based on original JavaScript version by David Shapiro (1998-2005)
// Converted to TypeScript
//
// Requires BigInt.ts and Barrett.ts.

import { 
  BigIntType, 
  biFromHex, 
  biHighIndex,
  biToHex, 
  biToString,
  BigInt
} from './BigInt';
import { BarrettMu, BarrettMuType } from './Barrett';

export interface RSAKeyPairType {
  e: BigIntType;
  d: BigIntType;
  m: BigIntType;
  chunkSize: number;
  digitSize: number;
  radix: number;
  barrett: BarrettMuType;
}

export function RSAKeyPair(encryptionExponent: string, decryptionExponent: string, modulus: string): RSAKeyPairType {
  const key: RSAKeyPairType = {
    e: biFromHex(encryptionExponent),
    d: biFromHex(decryptionExponent),
    m: biFromHex(modulus),
    chunkSize: 0,
    digitSize: 0,
    radix: 16,
    barrett: {} as BarrettMuType
  };

  // Calculate digitSize and chunkSize
  key.digitSize = 2 * biHighIndex(key.m) + 2;
  key.chunkSize = key.digitSize - 11; // maximum, anything lower is fine

  // Initialize Barrett modulus
  key.barrett = BarrettMu(key.m);

  return key;
}

function twoDigit(n: number): string {
  return (n < 10 ? "0" : "") + String(n);
}

export function encryptedString(key: RSAKeyPairType, s: string): string {
  // Check if chunkSize is too large for the given digitSize
  if (key.chunkSize > key.digitSize - 11) {
    return "Error";
  }

  const a: number[] = [];
  const sl = s.length;

  let i = 0;
  while (i < sl) {
    a[i] = s.charCodeAt(i);
    i++;
  }

  const al = a.length;
  let result = "";
  let j: number, k: number;
  let block: BigIntType;
  
  for (i = 0; i < al; i += key.chunkSize) {
    block = BigInt();
    j = 0;

    // Add PKCS#1 v1.5 padding
    // 0x00 || 0x02 || PseudoRandomNonZeroBytes || 0x00 || Message
    // Variable a before padding must be of at most digitSize-11
    // That is for 3 marker bytes plus at least 8 random non-zero bytes
    let x: number;
    const msgLength = (i + key.chunkSize) > al ? al % key.chunkSize : key.chunkSize;

    // Variable b with 0x00 || 0x02 at the highest index.
    const b: number[] = [];
    for (x = 0; x < msgLength; x++) {
      b[x] = a[i + msgLength - 1 - x];
    }
    b[msgLength] = 0; // marker
    const paddedSize = Math.max(8, key.digitSize - 3 - msgLength);

    for (x = 0; x < paddedSize; x++) {
      b[msgLength + 1 + x] = Math.floor(Math.random() * 254) + 1; // [1,255]
    }
    // It can be asserted that msgLength+paddedSize == key.digitSize-3
    b[key.digitSize - 2] = 2; // marker
    b[key.digitSize - 1] = 0; // marker

    for (k = 0; k < key.digitSize; ++j) {
      block.digits[j] = b[k++];
      block.digits[j] += b[k++] << 8;
    }

    const crypt = key.barrett.powMod(block, key.e);
    const text = key.radix == 16 ? biToHex(crypt) : biToString(crypt, key.radix);
    result += text + " ";
  }
  
  return result.substring(0, result.length - 1); // Remove last space.
}

export function decryptedString(key: RSAKeyPairType, s: string): string {
  const blocks = s.split(" ");
  let result = "";
  let i: number, j: number;
  let block: BigIntType;
  
  for (i = 0; i < blocks.length; ++i) {
    let bi: BigIntType;
    if (key.radix == 16) {
      bi = biFromHex(blocks[i]);
    } else {
      bi = biFromHex(blocks[i]); // Default to hex
    }
    
    block = key.barrett.powMod(bi, key.d);
    
    for (j = 0; j <= biHighIndex(block); ++j) {
      result += String.fromCharCode(block.digits[j] & 255, block.digits[j] >> 8);
    }
  }
  
  // Remove trailing null, if any.
  if (result.charCodeAt(result.length - 1) == 0) {
    result = result.substring(0, result.length - 1);
  }
  
  return result;
}

// 添加PEM格式支持的函数
export function parsePEM(pem: string): string {
  // 移除头尾的标识和所有换行符
  let lines = pem.split('\n');
  // 移除第一行和最后一行（BEGIN/END标识）
  lines = lines.slice(1, lines.length - 1);
  // 合并所有行并返回
  return lines.join('');
}

// PEM格式转换为Hex格式
export function pemToHex(base64Str: string): string {
  // 使用window.atob转换base64为二进制字符串
  const binaryStr = atob(base64Str);
  // 将二进制字符串转换为十六进制
  let hexStr = '';
  for (let i = 0; i < binaryStr.length; i++) {
    const hex = binaryStr.charCodeAt(i).toString(16);
    // 确保每个字节有两个字符
    hexStr += hex.length === 1 ? '0' + hex : hex;
  }
  return hexStr;
} 
/**
 * RSA工具库辅助函数
 */

/**
 * 判断是否是base64编码的字符串
 */
export function isBase64String(str: string): boolean {
  if (!str) return false;
  
  // 移除空白字符
  const trimmed = str.trim();
  
  // Base64正则表达式
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  // 检查基本模式和长度是否符合Base64标准
  return base64Regex.test(trimmed) && trimmed.length % 4 === 0;
}

/**
 * 判断是否是16进制编码的字符串
 */
export function isHexString(str: string): boolean {
  if (!str) return false;
  
  // 移除空白字符
  const trimmed = str.trim();
  
  // 十六进制正则表达式
  const hexRegex = /^[0-9A-Fa-f]+$/;
  
  // 检查是否全部为十六进制字符且长度为偶数
  return hexRegex.test(trimmed) && trimmed.length % 2 === 0;
}

/**
 * 是否是PEM格式的公钥
 */
export function isPEMPublicKey(str: string): boolean {
  if (!str) return false;
  
  // PEM格式公钥正则表达式
  const pemPublicKeyRegex = /-----BEGIN PUBLIC KEY-----[\s\S]*?-----END PUBLIC KEY-----/;
  
  return pemPublicKeyRegex.test(str.trim());
}

/**
 * 是否是PEM格式的私钥
 */
export function isPEMPrivateKey(str: string): boolean {
  if (!str) return false;
  
  // PEM格式私钥正则表达式 - 支持多种格式
  const pemPrivateKeyRegex = /-----BEGIN (RSA )?PRIVATE KEY-----[\s\S]*?-----END (RSA )?PRIVATE KEY-----/;
  
  return pemPrivateKeyRegex.test(str.trim());
}

/**
 * 从PEM格式提取base64编码的内容
 */
export function extractBase64FromPEM(pemString: string): string {
  if (!pemString) return '';
  
  // 移除头尾的PEM标记、换行符和空格
  const base64Content = pemString
    .replace(/-----BEGIN (?:RSA )?(?:PUBLIC|PRIVATE) KEY-----/, '')
    .replace(/-----END (?:RSA )?(?:PUBLIC|PRIVATE) KEY-----/, '')
    .replace(/\s+/g, '');
  
  return base64Content;
}

/**
 * 将Base64转换为Hex格式
 */
export function base64ToHex(base64: string): string {
  const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let hex = '';
  let bits = 0;
  let buffer = 0;
  
  // 移除可能存在的填充符号
  const cleanBase64 = base64.replace(/=+$/, '');
  
  for (let i = 0; i < cleanBase64.length; i++) {
    const charValue = base64Chars.indexOf(cleanBase64.charAt(i));
    if (charValue === -1) continue; // 跳过非Base64字符
    
    buffer = (buffer << 6) | charValue;
    bits += 6;
    
    if (bits >= 8) {
      bits -= 8;
      const byte = (buffer >> bits) & 0xff;
      hex += byte.toString(16).padStart(2, '0');
    }
  }
  
  return hex;
}

/**
 * 自动检测密钥格式并转换为适合RSA库使用的格式
 * 支持PEM格式、Base64和Hex
 */
export function processKey(key: string, keyType: string): string {
  let processedKey = key.trim();
  
  if (keyType === 'base64') {
    processedKey = base64ToHex(processedKey);
  } else if (keyType === 'pem') {
    const base64Content = extractBase64FromPEM(processedKey);
    processedKey = base64ToHex(base64Content);
  }
  
  return processedKey;
}

/**
 * 生成随机测试消息
 */
export function generateRandomMessage(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'Test_';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Utils for RSA key handling

/**
 * Convert PEM formatted RSA key to components
 * @param pem PEM formatted RSA key string
 * @returns object with modulus and exponent in hex format
 */
export function pemToComponents(pem: string): { modulus: string, exponent: string } | null {
  // Remove headers, footers, and new lines
  let base64 = pem
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace('-----BEGIN RSA PUBLIC KEY-----', '')
    .replace('-----END RSA PUBLIC KEY-----', '')
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace('-----BEGIN RSA PRIVATE KEY-----', '')
    .replace('-----END RSA PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  try {
    // Convert from base64 to binary string
    const binary = window.atob(base64);
    // Convert binary string to hex
    const hex = Array.from(binary).map(char => ('00' + char.charCodeAt(0).toString(16)).slice(-2)).join('');
    
    // Extract modulus and exponent from ASN.1 DER encoded key
    // This is a simple implementation that works for most standard RSA keys
    // A complete ASN.1 parser would be more robust but much more complex
    
    // For public keys in PKCS#1 format
    if (pem.includes('RSA PUBLIC KEY')) {
      // Simple ASN.1 parsing for PKCS#1
      // Format: RSAPublicKey ::= SEQUENCE { modulus, publicExponent }
      const modulusStart = hex.indexOf('0201000202') + 10;
      const modulusLength = parseInt(hex.substr(modulusStart - 2, 2), 16) * 2;
      const modulus = hex.substr(modulusStart, modulusLength).replace(/^00/, '');
      
      const exponentStart = modulusStart + modulusLength + 4;
      const exponentLength = parseInt(hex.substr(exponentStart - 2, 2), 16) * 2;
      const exponent = hex.substr(exponentStart, exponentLength);
      
      return { modulus, exponent };
    }
    
    // For public keys in PKCS#8 format
    if (pem.includes('PUBLIC KEY')) {
      // Find the OID for RSA: 2a 86 48 86 f7 0d 01 01 01 (1.2.840.113549.1.1.1)
      const rsaOID = '2a864886f70d010101';
      const rsaOIDIndex = hex.indexOf(rsaOID);
      
      if (rsaOIDIndex === -1) {
        return null; // Not an RSA key
      }
      
      // Skip past OID and find the BIT STRING that contains the key data
      const bitStringIndex = hex.indexOf('03', rsaOIDIndex + rsaOID.length);
      if (bitStringIndex === -1) {
        return null;
      }
      
      // Skip the BIT STRING header and padding byte
      const keyDataStart = bitStringIndex + 4;
      
      // Parse the nested SEQUENCE that contains modulus and exponent
      const sequenceStart = keyDataStart + (hex.substr(keyDataStart, 2) === '00' ? 2 : 0);
      
      // Now parse as if it were a PKCS#1 key within this sequence
      const innerSequence = hex.substr(sequenceStart + 4); // Skip SEQUENCE header
      
      // Find modulus (INTEGER)
      let offset = 0;
      if (innerSequence.substr(offset, 2) !== '02') {
        return null; // Expected INTEGER tag
      }
      
      offset += 2;
      const modulusLengthBytes = parseInt(innerSequence.substr(offset, 2), 16);
      offset += 2;
      
      // If the high bit is set, there's an extra length byte
      let modulusLength;
      if (modulusLengthBytes > 128) {
        const numLengthBytes = modulusLengthBytes - 128;
        modulusLength = parseInt(innerSequence.substr(offset, numLengthBytes * 2), 16) * 2;
        offset += numLengthBytes * 2;
      } else {
        modulusLength = modulusLengthBytes * 2;
      }
      
      const modulus = innerSequence.substr(offset, modulusLength).replace(/^00/, '');
      offset += modulusLength;
      
      // Find exponent (INTEGER)
      if (innerSequence.substr(offset, 2) !== '02') {
        return null; // Expected INTEGER tag
      }
      
      offset += 2;
      const exponentLength = parseInt(innerSequence.substr(offset, 2), 16) * 2;
      offset += 2;
      const exponent = innerSequence.substr(offset, exponentLength);
      
      return { modulus, exponent };
    }
    
    return null;
  } catch (e) {
    console.error('Error parsing PEM key:', e);
    return null;
  }
}

/**
 * Extract the exponent and modulus as hex strings from an RSA public key in PEM format
 * @param publicKey Public key in PEM format
 * @returns Object with modulus and exponent in hex format
 */
export function getPublicKeyComponents(publicKey: string): { modulus: string, exponent: string } | null {
  return pemToComponents(publicKey);
}

/**
 * Generate a minimal PEM formatted public key from modulus and exponent
 * Note: This is a simplified implementation and may not work for all use cases
 * @param modulus The modulus in hex format
 * @param exponent The exponent in hex format
 * @returns A PEM formatted public key
 */
export function componentsToPem(modulus: string, exponent: string): string {
  // Convert hex to binary
  const hexToBinary = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  };
  
  // Encode integer in ASN.1 DER format
  const encodeInteger = (hex: string): Uint8Array => {
    const int = hexToBinary(hex);
    let encodedInt = new Uint8Array(int.length + 2);
    encodedInt[0] = 0x02; // INTEGER tag
    encodedInt[1] = int.length; // length
    encodedInt.set(int, 2); // value
    return encodedInt;
  };
  
  // Encode sequence in ASN.1 DER format
  const encodeSequence = (data: Uint8Array): Uint8Array => {
    const sequence = new Uint8Array(data.length + 2);
    sequence[0] = 0x30; // SEQUENCE tag
    sequence[1] = data.length; // length
    sequence.set(data, 2);
    return sequence;
  };
  
  // Convert binary to base64
  const binaryToBase64 = (data: Uint8Array): string => {
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    return window.btoa(binary);
  };
  
  // Create ASN.1 DER encoded components
  const modulusInt = encodeInteger(modulus);
  const exponentInt = encodeInteger(exponent);
  
  // Combine modulus and exponent into RSA key sequence
  const rsaKeyData = new Uint8Array(modulusInt.length + exponentInt.length);
  rsaKeyData.set(modulusInt, 0);
  rsaKeyData.set(exponentInt, modulusInt.length);
  
  // Encode as SEQUENCE
  const rsaKey = encodeSequence(rsaKeyData);
  
  // Convert to base64 and format as PEM
  const base64 = binaryToBase64(rsaKey);
  const pem = `-----BEGIN RSA PUBLIC KEY-----\n${base64.match(/.{1,64}/g)?.join('\n')}\n-----END RSA PUBLIC KEY-----`;
  
  return pem;
} 
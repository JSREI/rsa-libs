import React, { useState, useEffect } from 'react';
import { useRSA } from '../contexts/RSAContext';
import { encryptedString, decryptedString, RSAKeyPair } from '../lib/RSA';
import { isBase64String, isHexString, base64ToHex, isPEMPublicKey, isPEMPrivateKey, extractBase64FromPEM, processKey } from '../lib/utils';
import useLocalStorage from '../hooks/useLocalStorage';
import { useFormatUtils } from './RSAComponents/FormatUtils';
import PublicKeySection from './RSAComponents/PublicKeySection';
import PrivateKeySection from './RSAComponents/PrivateKeySection';
import CommonHeader from './RSAComponents/CommonHeader';

const RSAEncryption: React.FC = () => {
  const { keyPair, createKeyPairFromPublicKey } = useRSA();
  const { getKeyPlaceholder, getOperationPlaceholder, renderFormatBadge } = useFormatUtils();
  
  // 使用本地存储保存所有状态
  const [publicKey, setPublicKey] = useLocalStorage<string>('rsa-publicKey', '');
  const [publicKeyEncodeType, setPublicKeyEncodeType] = useLocalStorage<string>('rsa-publicKeyEncodeType', 'base64');
  const [publicEncryptInput, setPublicEncryptInput] = useLocalStorage<string>('rsa-publicEncryptInput', '');
  const [publicEncryptResult, setPublicEncryptResult] = useLocalStorage<string>('rsa-publicEncryptResult', '');
  const [publicDecryptInput, setPublicDecryptInput] = useLocalStorage<string>('rsa-publicDecryptInput', '');
  const [publicDecryptResult, setPublicDecryptResult] = useLocalStorage<string>('rsa-publicDecryptResult', '');
  
  const [privateKey, setPrivateKey] = useLocalStorage<string>('rsa-privateKey', '');
  const [privateKeyEncodeType, setPrivateKeyEncodeType] = useLocalStorage<string>('rsa-privateKeyEncodeType', 'base64');
  const [privateEncryptInput, setPrivateEncryptInput] = useLocalStorage<string>('rsa-privateEncryptInput', '');
  const [privateEncryptResult, setPrivateEncryptResult] = useLocalStorage<string>('rsa-privateEncryptResult', '');
  const [privateDecryptInput, setPrivateDecryptInput] = useLocalStorage<string>('rsa-privateDecryptInput', '');
  const [privateDecryptResult, setPrivateDecryptResult] = useLocalStorage<string>('rsa-privateDecryptResult', '');
  
  const [exponent, setExponent] = useLocalStorage<string>('rsa-exponent', '10001');
  const [publicError, setPublicError] = useState<string | null>(null);
  const [privateError, setPrivateError] = useState<string | null>(null);

  // 自动识别公钥编码类型
  useEffect(() => {
    if (!publicKey) return;
    
    const trimmedKey = publicKey.trim();
    if (isPEMPublicKey(trimmedKey)) {
      setPublicKeyEncodeType('pem');
    } else if (isHexString(trimmedKey)) {
      setPublicKeyEncodeType('hex');
    } else if (isBase64String(trimmedKey)) {
      setPublicKeyEncodeType('base64');
    }
  }, [publicKey, setPublicKeyEncodeType]);

  // 自动识别私钥编码类型
  useEffect(() => {
    if (!privateKey) return;
    
    const trimmedKey = privateKey.trim();
    if (isPEMPrivateKey(trimmedKey)) {
      setPrivateKeyEncodeType('pem');
    } else if (isHexString(trimmedKey)) {
      setPrivateKeyEncodeType('hex');
    } else if (isBase64String(trimmedKey)) {
      setPrivateKeyEncodeType('base64');
    }
  }, [privateKey, setPrivateKeyEncodeType]);

  // 处理密钥格式
  const processKeyFormat = (key: string, keyType: string) => {
    let processedKey = key.trim();
    if (keyType === 'base64') {
      processedKey = base64ToHex(processedKey);
    } else if (keyType === 'pem') {
      const base64Content = extractBase64FromPEM(processedKey);
      processedKey = base64ToHex(base64Content);
    }
    return processedKey;
  };

  // 使用公钥加密
  const handlePublicEncrypt = () => {
    console.log("公钥加密被调用", { publicKey, publicEncryptInput });
    try {
      setPublicError(null);
      
      if (!publicKey.trim()) {
        throw new Error('请输入公钥');
      }
      if (!publicEncryptInput.trim()) {
        throw new Error('请输入要加密的内容');
      }
      
      // 验证公钥长度
      if (publicKey.length < 64) {
        throw new Error('公钥长度不足，请检查格式是否正确');
      }
      
      // 验证指数是否为有效的十六进制值
      const validHex = /^[0-9A-Fa-f]+$/.test(exponent);
      if (!validHex) {
        throw new Error('指数必须是有效的十六进制值');
      }

      const processedPublicKey = processKeyFormat(publicKey, publicKeyEncodeType);
      
      // 如果内容过长，警告用户
      if (publicEncryptInput.length > 50) {
        console.warn("加密内容较长，可能需要较长处理时间");
      }
      
      // 设置超时，防止无限计算
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('加密操作超时，请检查密钥格式或尝试较短的输入')), 3000);
      });
      
      const encryptPromise = new Promise<string>((resolve) => {
        // 使用setTimeout将加密操作放入下一个事件循环，避免UI阻塞
        setTimeout(() => {
          try {
            // 创建RSA密钥对
            const rsaKeyPair = RSAKeyPair(exponent, '0', processedPublicKey);
            
            // 加密
            const encrypted = encryptedString(rsaKeyPair, publicEncryptInput);
            resolve(encrypted);
          } catch (error) {
            console.error("加密过程中出错:", error);
            throw error;
          }
        }, 0);
      });
      
      // 使用Promise.race实现超时控制
      Promise.race([encryptPromise, timeoutPromise])
        .then((result) => {
          if (typeof result === 'string') {
            console.log("加密成功完成");
            setPublicEncryptResult(result);
          }
        })
        .catch((error) => {
          setPublicError(`公钥加密失败: ${error.message}`);
        });
    } catch (err) {
      console.error("公钥加密失败:", err);
      setPublicError(`公钥加密失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 使用公钥解密（验证）
  const handlePublicDecrypt = () => {
    try {
      setPublicError(null);
      
      if (!publicKey.trim()) {
        throw new Error('请输入公钥');
      }
      if (!publicDecryptInput.trim()) {
        throw new Error('请输入要解密的内容');
      }

      const processedPublicKey = processKeyFormat(publicKey, publicKeyEncodeType);
      
      // 创建RSA密钥对用于验证
      const rsaKeyPair = RSAKeyPair(exponent, '0', processedPublicKey);
      
      // 解密（验证）
      const decrypted = decryptedString(rsaKeyPair, publicDecryptInput);
      setPublicDecryptResult(decrypted);
    } catch (err) {
      setPublicError(`公钥解密失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 使用私钥加密（签名）
  const handlePrivateEncrypt = () => {
    console.log("私钥加密被调用", { privateKey, privateEncryptInput });
    try {
      setPrivateError(null);
      
      if (!privateKey.trim()) {
        throw new Error('请输入私钥');
      }
      if (!publicKey.trim()) {
        throw new Error('需要同时提供公钥以确保正确格式');
      }
      if (!privateEncryptInput.trim()) {
        throw new Error('请输入要加密的内容');
      }
      
      // 验证私钥长度
      if (privateKey.length < 64) {
        throw new Error('私钥长度不足，请检查格式是否正确');
      }
      
      // 验证指数是否为有效的十六进制值
      const validHex = /^[0-9A-Fa-f]+$/.test(exponent);
      if (!validHex) {
        throw new Error('指数必须是有效的十六进制值');
      }

      const processedPublicKey = processKeyFormat(publicKey, publicKeyEncodeType);
      const processedPrivateKey = processKeyFormat(privateKey, privateKeyEncodeType);
      
      // 如果内容过长，警告用户
      if (privateEncryptInput.length > 50) {
        console.warn("加密内容较长，可能需要较长处理时间");
      }
      
      // 设置超时，防止无限计算
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('加密操作超时，请检查密钥格式或尝试较短的输入')), 3000);
      });
      
      const encryptPromise = new Promise<string>((resolve) => {
        // 使用setTimeout将加密操作放入下一个事件循环，避免UI阻塞
        setTimeout(() => {
          try {
            // 创建RSA密钥对用于签名
            const rsaKeyPair = RSAKeyPair(exponent, processedPrivateKey, processedPublicKey);
            
            // 加密（签名）
            const encrypted = encryptedString(rsaKeyPair, privateEncryptInput);
            resolve(encrypted);
          } catch (error) {
            console.error("加密过程中出错:", error);
            throw error;
          }
        }, 0);
      });
      
      // 使用Promise.race实现超时控制
      Promise.race([encryptPromise, timeoutPromise])
        .then((result) => {
          if (typeof result === 'string') {
            console.log("加密成功完成");
            setPrivateEncryptResult(result);
          }
        })
        .catch((error) => {
          setPrivateError(`私钥加密失败: ${error.message}`);
        });
    } catch (err) {
      console.error("私钥加密失败:", err);
      setPrivateError(`私钥加密失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 使用私钥解密
  const handlePrivateDecrypt = () => {
    try {
      setPrivateError(null);
      
      if (!privateKey.trim()) {
        throw new Error('请输入私钥');
      }
      if (!publicKey.trim()) {
        throw new Error('需要同时提供公钥以确保正确格式');
      }
      if (!privateDecryptInput.trim()) {
        throw new Error('请输入要解密的内容');
      }

      const processedPublicKey = processKeyFormat(publicKey, publicKeyEncodeType);
      const processedPrivateKey = processKeyFormat(privateKey, privateKeyEncodeType);
      
      // 创建RSA密钥对用于解密
      const rsaKeyPair = RSAKeyPair(exponent, processedPrivateKey, processedPublicKey);
      
      // 解密
      const decrypted = decryptedString(rsaKeyPair, privateDecryptInput);
      setPrivateDecryptResult(decrypted);
    } catch (err) {
      setPrivateError(`私钥解密失败: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // 清除公钥区域
  const clearPublicArea = () => {
    setPublicEncryptInput('');
    setPublicEncryptResult('');
    setPublicDecryptInput('');
    setPublicDecryptResult('');
    setPublicError(null);
  };

  // 清除私钥区域
  const clearPrivateArea = () => {
    setPrivateEncryptInput('');
    setPrivateEncryptResult('');
    setPrivateDecryptInput('');
    setPrivateDecryptResult('');
    setPrivateError(null);
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg">
      <CommonHeader exponent={exponent} setExponent={setExponent} />

      {/* 左右布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* 左侧：公钥操作 */}
        <PublicKeySection 
          publicKey={publicKey}
          setPublicKey={setPublicKey}
          publicKeyEncodeType={publicKeyEncodeType}
          setPublicKeyEncodeType={setPublicKeyEncodeType}
          publicEncryptInput={publicEncryptInput}
          setPublicEncryptInput={setPublicEncryptInput}
          publicEncryptResult={publicEncryptResult}
          setPublicEncryptResult={setPublicEncryptResult}
          publicDecryptInput={publicDecryptInput}
          setPublicDecryptInput={setPublicDecryptInput}
          publicDecryptResult={publicDecryptResult}
          setPublicDecryptResult={setPublicDecryptResult}
          publicError={publicError}
          setPublicError={setPublicError}
          handlePublicEncrypt={handlePublicEncrypt}
          handlePublicDecrypt={handlePublicDecrypt}
          clearPublicArea={clearPublicArea}
          getKeyPlaceholder={getKeyPlaceholder}
          getOperationPlaceholder={getOperationPlaceholder}
          renderFormatBadge={renderFormatBadge}
        />

        {/* 右侧：私钥操作 */}
        <PrivateKeySection 
          privateKey={privateKey}
          setPrivateKey={setPrivateKey}
          privateKeyEncodeType={privateKeyEncodeType}
          setPrivateKeyEncodeType={setPrivateKeyEncodeType}
          privateEncryptInput={privateEncryptInput}
          setPrivateEncryptInput={setPrivateEncryptInput}
          privateEncryptResult={privateEncryptResult}
          setPrivateEncryptResult={setPrivateEncryptResult}
          privateDecryptInput={privateDecryptInput}
          setPrivateDecryptInput={setPrivateDecryptInput}
          privateDecryptResult={privateDecryptResult}
          setPrivateDecryptResult={setPrivateDecryptResult}
          privateError={privateError}
          setPrivateError={setPrivateError}
          handlePrivateEncrypt={handlePrivateEncrypt}
          handlePrivateDecrypt={handlePrivateDecrypt}
          clearPrivateArea={clearPrivateArea}
          getKeyPlaceholder={getKeyPlaceholder}
          getOperationPlaceholder={getOperationPlaceholder}
          renderFormatBadge={renderFormatBadge}
        />
      </div>

      {/* 底部信息 */}
      <div className="mt-10 text-center text-gray-500 text-xs">
        <p>RSA 加密/解密工具 • 支持PEM、Base64和Hex格式密钥</p>
        <p className="mt-1">使用TypeScript和React构建 • 密钥格式自动识别</p>
      </div>
    </div>
  );
};

export default RSAEncryption; 
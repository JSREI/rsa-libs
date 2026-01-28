import React, { useState, useEffect } from 'react';
import { TextArea, Button, Select, Input } from './common/FormElements';
import { RSAKeyPair } from '../lib/RSA';
import { getPublicKeyComponents } from '../lib/utils';
import { encryptedString, decryptedString } from '../lib/RSA';
import { biFromHex } from '../lib/BigInt';
import { 
  isBase64String, 
  isHexString, 
  base64ToHex, 
  generateRandomMessage, 
  isPEMPublicKey, 
  isPEMPrivateKey, 
  extractBase64FromPEM 
} from '../lib/utils';
import useLocalStorage from '../hooks/useLocalStorage';

const RSAKeyPairVerifier: React.FC = () => {
  const [publicKey, setPublicKey] = useLocalStorage<string>('verify-publicKey', '');
  const [publicKeyEncodeType, setPublicKeyEncodeType] = useLocalStorage<string>('verify-publicKeyEncodeType', 'base64');
  const [exponent, setExponent] = useLocalStorage<string>('verify-exponent', '10001');
  const [privateKey, setPrivateKey] = useLocalStorage<string>('verify-privateKey', '');
  const [privateKeyEncodeType, setPrivateKeyEncodeType] = useLocalStorage<string>('verify-privateKeyEncodeType', 'base64');
  const [testMessage, setTestMessage] = useState<string>('This is a test message to verify RSA key pair');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const verifyKeyPair = async () => {
    try {
      setIsLoading(true);
      setResult(null);

      // 检查必填字段
      if (!publicKey.trim()) {
        throw new Error('公钥不能为空');
      }

      if (!privateKey.trim()) {
        throw new Error('私钥不能为空');
      }

      // 处理公钥私钥格式
      let processedPublicKey = publicKey.trim();
      if (publicKeyEncodeType === 'base64') {
        processedPublicKey = base64ToHex(processedPublicKey);
      } else if (publicKeyEncodeType === 'pem') {
        const base64Content = extractBase64FromPEM(processedPublicKey);
        processedPublicKey = base64ToHex(base64Content);
      }

      let processedPrivateKey = privateKey.trim();
      if (privateKeyEncodeType === 'base64') {
        processedPrivateKey = base64ToHex(processedPrivateKey);
      } else if (privateKeyEncodeType === 'pem') {
        const base64Content = extractBase64FromPEM(processedPrivateKey);
        processedPrivateKey = base64ToHex(base64Content);
      }

      // 获取公钥组件
      const publicComponents = getPublicKeyComponents(publicKey);
      if (!publicComponents) {
        throw new Error('解析公钥失败');
      }
      
      // 创建用于加密的密钥对
      const encryptKeyPair = RSAKeyPair(
        exponent || publicComponents.exponent, 
        '0', 
        processedPublicKey
      );
      
      // 生成随机测试消息
      const randomTestMessage = generateRandomMessage(10);
      
      // 加密测试消息
      const encrypted = encryptedString(encryptKeyPair, randomTestMessage);
      
      // 创建用于解密的密钥对
      const decryptKeyPair = RSAKeyPair(
        exponent || publicComponents.exponent, 
        processedPrivateKey, 
        processedPublicKey
      );
      
      // 尝试解密
      let decrypted: string;
      try {
        decrypted = decryptedString(decryptKeyPair, encrypted);
      } catch (error) {
        throw new Error('解密失败。密钥可能不匹配。');
      }
      
      // 检查解密结果是否与原始消息匹配
      if (decrypted === randomTestMessage) {
        setResult({
          success: true,
          message: '成功！公钥和私钥是匹配的RSA密钥对。'
        });
      } else {
        setResult({
          success: false,
          message: '密钥不匹配。解密结果与原始消息不一致。'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '验证过程中出现未知错误'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearFields = () => {
    setPublicKey('');
    setPrivateKey('');
    setResult(null);
  };

  // 渲染格式标识
  const renderFormatBadge = (format: string) => {
    let bgColor = "bg-gray-100";
    let textColor = "text-gray-700";
    
    switch(format) {
      case 'pem':
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        break;
      case 'base64':
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case 'hex':
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
    }
    
    return (
      <span className={`${bgColor} ${textColor} text-xs font-semibold px-2.5 py-0.5 rounded ml-2`}>
        {format.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-8 rounded-xl shadow-lg">
      
      {/* 操作提示 */}
      <div className="max-w-4xl mx-auto mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          验证说明
        </h4>
        <p className="text-sm text-blue-700 mb-2">
          此工具用于验证RSA公钥和私钥是否匹配。系统将生成随机测试消息，使用公钥加密后再用私钥解密，验证是否能还原原始消息。
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>粘贴公钥或私钥时会自动识别编码格式</li>
          <li>支持PEM、Base64和Hex三种编码格式</li>
          <li>验证结果将立即显示</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {/* 左侧：公钥区域 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
          <h3 className="text-xl font-bold mb-6 pb-3 border-b text-blue-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            公钥信息
          </h3>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                公钥 (Public Key)
              </label>
              {renderFormatBadge(publicKeyEncodeType)}
              <div className="flex-grow"></div>
              <Select
                label=""
                value={publicKeyEncodeType}
                onChange={setPublicKeyEncodeType}
                options={[
                  { value: 'pem', label: 'PEM' },
                  { value: 'base64', label: 'BASE64' },
                  { value: 'hex', label: 'HEX' }
                ]}
                className="w-32 mb-0"
              />
            </div>
            <textarea
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="在此粘贴RSA公钥，支持PEM格式、Base64或Hex编码..."
              rows={12}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm max-h-96 overflow-y-auto"
            />
            <div className="text-xs text-gray-500 mt-1">
              系统会自动识别粘贴内容的格式并更新编码类型
            </div>
          </div>

          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-blue-700 mb-2">
              公钥指数 (Exponent)
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={exponent}
                onChange={(e) => setExponent(e.target.value)}
                placeholder="默认: 10001 (十六进制)"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
              <div className="ml-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                常用值: 10001
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：私钥区域 */}
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
          <h3 className="text-xl font-bold mb-6 pb-3 border-b text-green-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            私钥信息
          </h3>
          
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <label className="block text-gray-700 text-sm font-bold">
                私钥 (Private Key)
              </label>
              {renderFormatBadge(privateKeyEncodeType)}
              <div className="flex-grow"></div>
              <Select
                label=""
                value={privateKeyEncodeType}
                onChange={setPrivateKeyEncodeType}
                options={[
                  { value: 'pem', label: 'PEM' },
                  { value: 'base64', label: 'BASE64' },
                  { value: 'hex', label: 'HEX' }
                ]}
                className="w-32 mb-0"
              />
            </div>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="在此粘贴RSA私钥，支持PEM格式、Base64或Hex编码..."
              rows={12}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm max-h-96 overflow-y-auto"
            />
            <div className="text-xs text-gray-500 mt-1">
              系统会自动识别粘贴内容的格式并更新编码类型
            </div>
          </div>

          <div className="flex space-x-4 mb-4">
            <Button
              text={isLoading ? '验证中...' : '验证密钥对'}
              onClick={verifyKeyPair}
              disabled={isLoading || !publicKey || !privateKey}
              className="bg-purple-600 hover:bg-purple-700 w-full py-3 text-lg"
            />
          </div>
        </div>
      </div>

      {/* 结果显示区域 */}
      {result && (
        <div className="mt-8 max-w-4xl mx-auto">
          <div
            className={`p-6 rounded-lg shadow-md ${
              result.success
                ? 'bg-green-50 border-l-4 border-green-500'
                : 'bg-red-50 border-l-4 border-red-500'
            }`}
          >
            <h3 className={`text-xl font-bold mb-2 flex items-center ${
              result.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {result.success ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              验证结果
            </h3>
            <p className={`text-lg ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.message}
            </p>
            {result.success && (
              <p className="mt-2 text-sm text-green-600">
                加密和解密测试均成功完成，确认公钥和私钥是一对有效的RSA密钥对。
              </p>
            )}
            {!result.success && (
              <div className="mt-2 text-sm text-red-600">
                <p>可能的原因:</p>
                <ul className="list-disc list-inside ml-2 mt-1">
                  <li>公钥和私钥不匹配</li>
                  <li>密钥格式错误或被损坏</li>
                  <li>指数值与密钥不兼容</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Button 
              text="清除结果" 
              onClick={clearFields} 
              className="bg-gray-500 hover:bg-gray-600"
            />
          </div>
        </div>
      )}

      {/* 底部信息 */}
      <div className="mt-10 text-center text-gray-500 text-xs">
        <p>RSA 密钥对验证工具 • 支持PEM、Base64和Hex格式密钥</p>
        <p className="mt-1">使用TypeScript和React构建 • 密钥格式自动识别</p>
      </div>
    </div>
  );
};

export default RSAKeyPairVerifier; 
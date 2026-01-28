import React, { useCallback } from 'react';

export const useFormatUtils = () => {
  // 获取相应编码类型的示例格式和提示
  const getFormatExample = useCallback((type: string, isPublic: boolean = true) => {
    switch(type) {
      case 'pem':
        return isPublic 
          ? "-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNAD...\n-----END PUBLIC KEY-----" 
          : "-----BEGIN PRIVATE KEY-----\nMIICdgIBADANBgkqhkiG9w0BAQEF...\n-----END PRIVATE KEY-----";
      case 'base64':
        return "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQK...";
      case 'hex':
        return "30819f300d06092a864886f70d01010105...";
      default:
        return "";
    }
  }, []);

  // 获取密钥提示文本
  const getKeyPlaceholder = useCallback((type: string, isPublic: boolean = true) => {
    const keyType = isPublic ? "公钥" : "私钥";
    const example = getFormatExample(type, isPublic);
    return `在此粘贴RSA${keyType}，${type.toUpperCase()}格式...\n示例: ${example}`;
  }, [getFormatExample]);

  // 获取加密/解密结果格式提示
  const getOperationPlaceholder = useCallback((operation: string, isPublic: boolean = true) => {
    if (operation === 'encrypt') {
      return `输入要用${isPublic ? "公钥" : "私钥"}加密的文本...`;
    } else {
      const encryptedBy = isPublic ? "私钥" : "公钥";
      return `输入要用${isPublic ? "公钥" : "私钥"}解密的文本（通常是用${encryptedBy}加密的内容）...`;
    }
  }, []);

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

  return {
    getFormatExample,
    getKeyPlaceholder,
    getOperationPlaceholder,
    renderFormatBadge
  };
};

export default useFormatUtils; 
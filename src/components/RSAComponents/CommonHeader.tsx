import React from 'react';

interface CommonHeaderProps {
  exponent: string;
  setExponent: (value: string) => void;
}

const CommonHeader: React.FC<CommonHeaderProps> = ({
  exponent,
  setExponent
}) => {
  return (
    <>
      {/* 顶部公共区域：指数设置 - 简化版 */}
      <div className="max-w-md mx-auto mb-6 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium text-gray-700">RSA指数:</div>
          <input
            type="text"
            value={exponent}
            onChange={(e) => setExponent(e.target.value)}
            placeholder="10001 (默认)"
            className="shadow-sm border border-gray-300 rounded-md px-3 py-1 text-sm w-28"
          />
          <div className="text-xs text-gray-500">
            <span className="bg-yellow-50 text-yellow-700 text-xs px-1.5 py-0.5 rounded">默认值: 10001 (十进制65537)</span>
          </div>
        </div>
      </div>

      {/* 操作提示 */}
      <div className="max-w-4xl mx-auto mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          使用说明
        </h4>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>粘贴公钥或私钥时会自动识别编码格式</li>
          <li>公钥加密的内容只能用私钥解密</li>
          <li>私钥加密的内容可用公钥解密</li>
          <li>支持PEM、Base64和Hex三种编码格式</li>
        </ul>
      </div>
    </>
  );
};

export default CommonHeader; 
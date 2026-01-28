import React from 'react';
import { TextArea, Button, Select } from '../common/FormElements';

interface PrivateKeySectionProps {
  privateKey: string;
  setPrivateKey: (value: string) => void;
  privateKeyEncodeType: string;
  setPrivateKeyEncodeType: (value: string) => void;
  privateEncryptInput: string;
  setPrivateEncryptInput: (value: string) => void;
  privateEncryptResult: string;
  setPrivateEncryptResult: (value: string) => void;
  privateDecryptInput: string;
  setPrivateDecryptInput: (value: string) => void;
  privateDecryptResult: string;
  setPrivateDecryptResult: (value: string) => void;
  privateError: string | null;
  setPrivateError: (value: string | null) => void;
  handlePrivateEncrypt: () => void;
  handlePrivateDecrypt: () => void;
  clearPrivateArea: () => void;
  getKeyPlaceholder: (type: string, isPublic: boolean) => string;
  getOperationPlaceholder: (operation: string, isPublic: boolean) => string;
  renderFormatBadge: (format: string) => JSX.Element;
}

const PrivateKeySection: React.FC<PrivateKeySectionProps> = ({
  privateKey,
  setPrivateKey,
  privateKeyEncodeType,
  setPrivateKeyEncodeType,
  privateEncryptInput,
  setPrivateEncryptInput,
  privateEncryptResult,
  setPrivateEncryptResult,
  privateDecryptInput,
  setPrivateDecryptInput,
  privateDecryptResult,
  setPrivateDecryptResult,
  privateError,
  setPrivateError,
  handlePrivateEncrypt,
  handlePrivateDecrypt,
  clearPrivateArea,
  getKeyPlaceholder,
  getOperationPlaceholder,
  renderFormatBadge
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
      <h3 className="text-xl font-bold mb-6 pb-3 border-b text-green-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        私钥操作
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
          placeholder={getKeyPlaceholder(privateKeyEncodeType, false)}
          rows={12}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm max-h-96 overflow-y-auto"
        />
        <div className="text-xs text-gray-500 mt-1">
          系统会自动识别粘贴内容的格式并更新编码类型
        </div>
      </div>

      {/* 私钥加密区域 */}
      <div className="mb-8 p-5 bg-green-50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 text-green-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          私钥加密
          <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded">
            使用私钥加密内容
          </span>
        </h4>
        
        <TextArea
          label="待加密内容"
          value={privateEncryptInput}
          onChange={setPrivateEncryptInput}
          placeholder={getOperationPlaceholder('encrypt', false)}
          rows={5}
        />

        <div className="mt-4 mb-4">
          <Button 
            text="私钥加密" 
            onClick={handlePrivateEncrypt} 
            disabled={!privateKey || !privateEncryptInput} 
            className="bg-green-600 hover:bg-green-700"
          />
        </div>

        {privateEncryptResult && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2 text-green-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              加密结果 (Hex编码):
            </h5>
            <div className="bg-white p-4 rounded-lg border border-green-200 break-all max-h-48 overflow-y-auto text-sm font-mono">
              {privateEncryptResult}
            </div>
            <div className="text-xs text-green-600 mt-1">
              此结果可以复制到左侧"公钥解密"区域进行解密
            </div>
          </div>
        )}
      </div>

      {/* 私钥解密区域 */}
      <div className="mb-6 p-5 bg-green-50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 text-green-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
          </svg>
          私钥解密
          <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded">
            解密公钥加密内容
          </span>
        </h4>
        
        <TextArea
          label="待解密内容"
          value={privateDecryptInput}
          onChange={setPrivateDecryptInput}
          placeholder={getOperationPlaceholder('decrypt', false)}
          rows={5}
        />

        <div className="mt-4 mb-4">
          <Button 
            text="私钥解密" 
            onClick={handlePrivateDecrypt} 
            disabled={!privateKey || !privateDecryptInput} 
            className="bg-green-600 hover:bg-green-700"
          />
        </div>

        {privateDecryptResult && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2 text-green-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              解密结果:
            </h5>
            <div className="bg-white p-4 rounded-lg border border-green-200 break-all max-h-48 overflow-y-auto text-sm">
              {privateDecryptResult}
            </div>
          </div>
        )}
      </div>

      {privateError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">错误</p>
              <p className="text-sm">{privateError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button 
          text="清除私钥区域" 
          onClick={clearPrivateArea} 
          className="bg-gray-500 hover:bg-gray-600"
        />
      </div>
    </div>
  );
};

export default PrivateKeySection; 
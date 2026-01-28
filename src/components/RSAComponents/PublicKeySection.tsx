import React from 'react';
import { TextArea, Button, Select } from '../common/FormElements';

interface PublicKeySectionProps {
  publicKey: string;
  setPublicKey: (value: string) => void;
  publicKeyEncodeType: string;
  setPublicKeyEncodeType: (value: string) => void;
  publicEncryptInput: string;
  setPublicEncryptInput: (value: string) => void;
  publicEncryptResult: string;
  setPublicEncryptResult: (value: string) => void;
  publicDecryptInput: string;
  setPublicDecryptInput: (value: string) => void;
  publicDecryptResult: string;
  setPublicDecryptResult: (value: string) => void;
  publicError: string | null;
  setPublicError: (value: string | null) => void;
  handlePublicEncrypt: () => void;
  handlePublicDecrypt: () => void;
  clearPublicArea: () => void;
  getKeyPlaceholder: (type: string, isPublic: boolean) => string;
  getOperationPlaceholder: (operation: string, isPublic: boolean) => string;
  renderFormatBadge: (format: string) => JSX.Element;
}

const PublicKeySection: React.FC<PublicKeySectionProps> = ({
  publicKey,
  setPublicKey,
  publicKeyEncodeType,
  setPublicKeyEncodeType,
  publicEncryptInput,
  setPublicEncryptInput,
  publicEncryptResult,
  setPublicEncryptResult,
  publicDecryptInput,
  setPublicDecryptInput,
  publicDecryptResult,
  setPublicDecryptResult,
  publicError,
  setPublicError,
  handlePublicEncrypt,
  handlePublicDecrypt,
  clearPublicArea,
  getKeyPlaceholder,
  getOperationPlaceholder,
  renderFormatBadge
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
      <h3 className="text-xl font-bold mb-6 pb-3 border-b text-blue-700 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        公钥操作
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
          placeholder={getKeyPlaceholder(publicKeyEncodeType, true)}
          rows={12}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline font-mono text-sm max-h-96 overflow-y-auto"
        />
        <div className="text-xs text-gray-500 mt-1">
          系统会自动识别粘贴内容的格式并更新编码类型
        </div>
      </div>

      {/* 公钥加密区域 */}
      <div className="mb-8 p-5 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          公钥加密
          <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
            只能用私钥解密
          </span>
        </h4>
        
        <TextArea
          label="待加密内容"
          value={publicEncryptInput}
          onChange={setPublicEncryptInput}
          placeholder={getOperationPlaceholder('encrypt', true)}
          rows={5}
        />

        <div className="mt-4 mb-4">
          <Button 
            text="公钥加密" 
            onClick={handlePublicEncrypt} 
            disabled={!publicKey || !publicEncryptInput} 
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>

        {publicEncryptResult && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2 text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              加密结果 (Hex编码):
            </h5>
            <div className="bg-white p-4 rounded-lg border border-blue-200 break-all max-h-48 overflow-y-auto text-sm font-mono">
              {publicEncryptResult}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              此结果可以复制到右侧"私钥解密"区域进行解密
            </div>
          </div>
        )}
      </div>

      {/* 公钥解密区域 */}
      <div className="mb-6 p-5 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-lg mb-4 text-blue-700 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
          </svg>
          公钥解密
          <span className="ml-2 text-xs font-normal text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
            解密私钥加密的内容
          </span>
        </h4>
        
        <TextArea
          label="待解密内容"
          value={publicDecryptInput}
          onChange={setPublicDecryptInput}
          placeholder={getOperationPlaceholder('decrypt', true)}
          rows={5}
        />

        <div className="mt-4 mb-4">
          <Button 
            text="公钥解密" 
            onClick={handlePublicDecrypt} 
            disabled={!publicKey || !publicDecryptInput} 
            className="bg-blue-600 hover:bg-blue-700"
          />
        </div>

        {publicDecryptResult && (
          <div className="mt-4">
            <h5 className="font-semibold mb-2 text-blue-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              解密结果:
            </h5>
            <div className="bg-white p-4 rounded-lg border border-blue-200 break-all max-h-48 overflow-y-auto text-sm">
              {publicDecryptResult}
            </div>
          </div>
        )}
      </div>

      {publicError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">错误</p>
              <p className="text-sm">{publicError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Button 
          text="清除公钥区域" 
          onClick={clearPublicArea} 
          className="bg-gray-500 hover:bg-gray-600"
        />
      </div>
    </div>
  );
};

export default PublicKeySection; 
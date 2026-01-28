import React, { createContext, useContext, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

// 定义存储的所有值的类型
interface StorageState {
  // 公钥相关
  publicKey: string;
  publicKeyEncodeType: string;
  publicEncryptInput: string;
  publicEncryptResult: string;
  publicDecryptInput: string;
  publicDecryptResult: string;
  
  // 私钥相关
  privateKey: string;
  privateKeyEncodeType: string;
  privateEncryptInput: string;
  privateEncryptResult: string;
  privateDecryptInput: string;
  privateDecryptResult: string;
  
  // 通用状态
  exponent: string;
  
  // 密钥对验证相关
  verifierModulus: string;
  verifierExponent: string;
  verifierMessage: string;
  verifierResult: string;
}

// 上下文接口定义
interface LocalStorageContextType {
  state: StorageState;
  updateState: <K extends keyof StorageState>(key: K, value: StorageState[K]) => void;
}

// 创建上下文
const LocalStorageContext = createContext<LocalStorageContextType | undefined>(undefined);

// 上下文提供者组件的属性
interface LocalStorageProviderProps {
  children: ReactNode;
}

// 本地存储上下文提供者组件
export const LocalStorageProvider: React.FC<LocalStorageProviderProps> = ({ children }) => {
  // 为每个状态创建本地存储
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
  
  const [verifierModulus, setVerifierModulus] = useLocalStorage<string>('rsa-verifierModulus', '');
  const [verifierExponent, setVerifierExponent] = useLocalStorage<string>('rsa-verifierExponent', '10001');
  const [verifierMessage, setVerifierMessage] = useLocalStorage<string>('rsa-verifierMessage', '');
  const [verifierResult, setVerifierResult] = useLocalStorage<string>('rsa-verifierResult', '');

  // 组合所有状态
  const state: StorageState = {
    publicKey,
    publicKeyEncodeType,
    publicEncryptInput,
    publicEncryptResult,
    publicDecryptInput,
    publicDecryptResult,
    
    privateKey,
    privateKeyEncodeType,
    privateEncryptInput,
    privateEncryptResult,
    privateDecryptInput,
    privateDecryptResult,
    
    exponent,
    
    verifierModulus,
    verifierExponent,
    verifierMessage,
    verifierResult
  };

  // 根据键更新特定状态的函数
  const updateState = <K extends keyof StorageState>(key: K, value: StorageState[K]) => {
    switch (key) {
      case 'publicKey':
        setPublicKey(value as string);
        break;
      case 'publicKeyEncodeType':
        setPublicKeyEncodeType(value as string);
        break;
      case 'publicEncryptInput':
        setPublicEncryptInput(value as string);
        break;
      case 'publicEncryptResult':
        setPublicEncryptResult(value as string);
        break;
      case 'publicDecryptInput':
        setPublicDecryptInput(value as string);
        break;
      case 'publicDecryptResult':
        setPublicDecryptResult(value as string);
        break;
        
      case 'privateKey':
        setPrivateKey(value as string);
        break;
      case 'privateKeyEncodeType':
        setPrivateKeyEncodeType(value as string);
        break;
      case 'privateEncryptInput':
        setPrivateEncryptInput(value as string);
        break;
      case 'privateEncryptResult':
        setPrivateEncryptResult(value as string);
        break;
      case 'privateDecryptInput':
        setPrivateDecryptInput(value as string);
        break;
      case 'privateDecryptResult':
        setPrivateDecryptResult(value as string);
        break;
        
      case 'exponent':
        setExponent(value as string);
        break;
        
      case 'verifierModulus':
        setVerifierModulus(value as string);
        break;
      case 'verifierExponent':
        setVerifierExponent(value as string);
        break;
      case 'verifierMessage':
        setVerifierMessage(value as string);
        break;
      case 'verifierResult':
        setVerifierResult(value as string);
        break;
    }
  };

  return (
    <LocalStorageContext.Provider value={{ state, updateState }}>
      {children}
    </LocalStorageContext.Provider>
  );
};

// 自定义钩子，用于访问上下文
export const useLocalStorageContext = () => {
  const context = useContext(LocalStorageContext);
  if (context === undefined) {
    throw new Error('useLocalStorageContext must be used within a LocalStorageProvider');
  }
  return context;
}; 
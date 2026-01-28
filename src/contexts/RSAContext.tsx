import React, { createContext, useState, useContext, ReactNode } from 'react';
import { RSAKeyPair, RSAKeyPairType } from '../lib/RSA';
import { getPublicKeyComponents } from '../lib/utils';

interface RSAContextType {
  publicKey: string;
  privateKey: string;
  keyPair: RSAKeyPairType | null;
  setPublicKey: (key: string) => void;
  setPrivateKey: (key: string) => void;
  generateKeyPair: (modulus: string, publicExponent: string, privateExponent: string) => boolean;
  createKeyPairFromPublicKey: (publicKey: string, exponent?: string) => RSAKeyPairType | null;
  encrypted: string;
  decrypted: string;
  setEncrypted: (value: string) => void;
  setDecrypted: (value: string) => void;
}

const defaultContext: RSAContextType = {
  publicKey: '',
  privateKey: '',
  keyPair: null,
  setPublicKey: () => {},
  setPrivateKey: () => {},
  generateKeyPair: () => false,
  createKeyPairFromPublicKey: () => null,
  encrypted: '',
  decrypted: '',
  setEncrypted: () => {},
  setDecrypted: () => {}
};

const RSAContext = createContext<RSAContextType>(defaultContext);

export const useRSA = () => useContext(RSAContext);

export const RSAProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string>('');
  const [privateKey, setPrivateKey] = useState<string>('');
  const [keyPair, setKeyPair] = useState<RSAKeyPairType | null>(null);
  const [encrypted, setEncrypted] = useState<string>('');
  const [decrypted, setDecrypted] = useState<string>('');

  const generateKeyPair = (modulus: string, publicExponent: string, privateExponent: string): boolean => {
    try {
      // Create an RSA key pair using the provided components
      const newKeyPair = RSAKeyPair(publicExponent, privateExponent, modulus);
      setKeyPair(newKeyPair);
      return true;
    } catch (error) {
      console.error('Error generating RSA key pair:', error);
      return false;
    }
  };

  const createKeyPairFromPublicKey = (publicKeyValue: string, exponent: string = '10001'): RSAKeyPairType | null => {
    try {
      // 如果提供了组件，直接使用
      // 否则，尝试提取组件
      let modulus = publicKeyValue;
      let rsaExponent = exponent;

      const components = getPublicKeyComponents(publicKeyValue);
      if (components) {
        modulus = components.modulus;
        rsaExponent = components.exponent || exponent;
      }

      // 创建RSA密钥对（仅具有公钥组件）
      const newKeyPair = RSAKeyPair(
        rsaExponent, 
        '0', // 空私钥指数，因为我们只有公钥
        modulus
      );
      
      setKeyPair(newKeyPair);
      setPublicKey(publicKeyValue);
      return newKeyPair;
    } catch (error) {
      console.error('Error creating RSA key pair from public key:', error);
      return null;
    }
  };

  const value = {
    publicKey,
    privateKey,
    keyPair,
    setPublicKey,
    setPrivateKey,
    generateKeyPair,
    createKeyPairFromPublicKey,
    encrypted,
    decrypted,
    setEncrypted,
    setDecrypted
  };

  return <RSAContext.Provider value={value}>{children}</RSAContext.Provider>;
}; 
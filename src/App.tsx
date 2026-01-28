import React from 'react';
import './App.css';
import { RSAProvider } from './contexts/RSAContext';
import { LocalStorageProvider } from './contexts/LocalStorageContext';
import RSAEncryption from './components/RSAEncryption';
import RSAKeyPairVerifier from './components/RSAKeyPairVerifier';
import NavBar from './components/common/NavBar';

function App() {
  // 设置导航页内容
  const navItems = [
    {
      id: 'encryption',
      label: 'RSA 加密/解密',
      content: <RSAEncryption />
    },
    {
      id: 'verification',
      label: 'RSA 密钥对验证',
      content: <RSAKeyPairVerifier />
    }
  ];

  return (
    <LocalStorageProvider>
      <RSAProvider>
        <div className="min-h-screen bg-gray-100">
          <div className="max-w-5xl mx-auto">
            <NavBar items={navItems} />
            
            <footer className="mt-12 text-center text-gray-500 text-sm py-6">
              <p>RSA Tools - 支持PEM格式密钥</p>
              <p className="mt-1">使用TypeScript和React构建</p>
            </footer>
          </div>
        </div>
      </RSAProvider>
    </LocalStorageProvider>
  );
}

export default App;

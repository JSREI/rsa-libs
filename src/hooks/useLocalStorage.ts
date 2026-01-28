import { useState, useEffect } from 'react';

// 自定义钩子，用于在本地存储中保存和获取数据
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 状态用于存储当前值
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // 从localStorage获取值
      const item = window.localStorage.getItem(key);
      // 如果有值则解析并返回，否则返回初始值
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // 如果出错（如JSON解析错误），返回初始值
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return initialValue;
    }
  });

  // 更新本地存储和状态的函数
  const setValue = (value: T) => {
    try {
      // 保存状态
      setStoredValue(value);
      // 保存到localStorage
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // 记录可能的错误
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  return [storedValue, setValue];
}

export default useLocalStorage; 
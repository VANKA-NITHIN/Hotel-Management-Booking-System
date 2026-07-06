import { useState, useEffect } from 'react';

export function usePersistentState<T>(
  key: string,
  initialValue: T,
  storage: Storage = sessionStorage
): [T, (value: T | ((val: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading storage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (state === undefined) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(state));
      }
    } catch (error) {
      console.warn(`Error setting storage key "${key}":`, error);
    }
  }, [key, state, storage]);

  return [state, setState];
}

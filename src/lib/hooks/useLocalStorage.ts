import { useState, useEffect } from 'react';

export type HistoryItem = {
  id: string;
  original: string;
  enhanced: string;
  improvements: string[];
};

export type ApiResponse = {
  enhancedPrompt: string;
  improvements: string[];
};

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Initialize with the initial value to ensure server/client consistency
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage only after component mounts (client-side only)
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        }
      } catch (error) {
        console.error(`Error loading localStorage key "${key}":`, error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadFromStorage();
  }, [key]);

  // Save to localStorage whenever the value changes (but only after hydration)
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      // Only write to localStorage after hydration is complete
      if (isHydrated) {
        localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

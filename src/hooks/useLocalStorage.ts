import { useEffect, useState } from "react";

/**
 * A React hook that uses localStorage to persist state.
 * It works similarly to useState, but the state is saved in localStorage.
 * When rendered on the server, it returns the initial value. When hydrated,
 * it updates to the value from localStorage after the first render.
 *
 * @param key The key to use in localStorage.
 * @param initialValue The initial value to use if there is no value in localStorage.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prevState: T) => T)) => void] {
  const isServer = typeof window === "undefined";
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const setValue = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (!isServer) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Sync state with localStorage changes (e.g., from other tabs)
  useEffect(() => {
    if (isServer) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item) as T);
      } else {
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      setStoredValue(initialValue);
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue
            ? (JSON.parse(event.newValue) as T)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.warn(
            `Error parsing localStorage key "${key}" on storage event:`,
            error
          );
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, JSON.stringify(initialValue), isServer]);

  return [storedValue, setValue];
}
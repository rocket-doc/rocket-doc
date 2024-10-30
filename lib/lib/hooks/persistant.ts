import { useState, useEffect } from 'react';

function usePersistentState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const storedValue = localStorage.getItem(key);
  const [state, setState] = useState<T>(
    storedValue ? JSON.parse(storedValue) : initialValue
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;

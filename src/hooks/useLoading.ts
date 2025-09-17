import { useState, useCallback } from 'react';

export const useLoading = (initialState: boolean = false) => {
  const [loading, setLoading] = useState(initialState);

  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);
  
  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T | null> => {
    startLoading();
    try {
      return await operation();
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading
  };
};

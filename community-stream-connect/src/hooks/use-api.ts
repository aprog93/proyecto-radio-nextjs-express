import { useState, useCallback, useEffect, useRef } from 'react';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface UseApiOptions {
  /**
   * Auto-fetch on mount
   * @default true
   */
  autoFetch?: boolean;
  /**
   * Dependency array to re-fetch
   */
  deps?: React.DependencyList;
}

/**
 * Generic hook for API calls with loading and error states
 * @param asyncFn - Async function that fetches data
 * @param options - Hook options
 * @returns {object} { data, loading, error, fetch, refetch }
 */
export const useApi = <T,>(
  asyncFn: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & {
  fetch: () => Promise<void>;
  refetch: () => Promise<void>;
} => {
  const { autoFetch = true } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetch = useCallback(async () => {
    if (!isMountedRef.current) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await asyncFn();
      if (isMountedRef.current) {
        setState({ data: result, loading: false, error: null });
      }
    } catch (err) {
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: err instanceof Error ? err : new Error('Unknown error'),
        });
      }
    }
  }, [asyncFn]);

  const refetch = useCallback(async () => {
    await fetch();
  }, [fetch]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [autoFetch, fetch]);

  return {
    ...state,
    fetch,
    refetch,
  };
};

export default useApi;


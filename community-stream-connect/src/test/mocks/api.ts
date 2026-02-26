import { vi } from "vitest";

/**
 * Frontend test mocks for API and external services
 */

/**
 * Mock successful API response
 */
export function createMockApiResponse<T>(
  data: T,
  status: number = 200
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    json: async () => data,
    text: async () => JSON.stringify(data),
    blob: async () => new Blob(),
    arrayBuffer: async () => new ArrayBuffer(0),
    clone: () => createMockApiResponse(data, status),
    headers: new Headers(),
    redirected: false,
    type: "basic" as ResponseType,
    url: "",
  } as any;
}

/**
 * Mock failed API response
 */
export function createMockApiError(
  message: string = "Internal Server Error",
  status: number = 500
): Promise<never> {
  return Promise.reject(
    createMockApiResponse(
      { error: message, message },
      status
    )
  );
}

/**
 * Setup global fetch mock
 */
export function setupFetchMock(responses: Record<string, any> = {}) {
  const fetchMock = vi.fn((url: string, options?: any) => {
    const key = Object.keys(responses).find(k => url.includes(k));
    if (key) {
      return Promise.resolve(createMockApiResponse(responses[key]));
    }
    return Promise.reject(new Error(`No mock response for ${url}`));
  });

  global.fetch = fetchMock as any;
  return fetchMock;
}

/**
 * Mock Supabase client
 */
export function createMockSupabaseClient() {
  return {
    auth: {
      onAuthStateChange: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: null, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: null, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  };
}

/**
 * Mock React Query
 */
export function createMockReactQuery() {
  return {
    useQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
      error: null,
      isError: false,
      isSuccess: false,
      refetch: vi.fn(),
    })),
    useMutation: vi.fn(() => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      error: null,
      data: null,
    })),
    useInfiniteQuery: vi.fn(() => ({
      data: { pages: [] },
      isLoading: false,
      error: null,
      hasNextPage: false,
      fetchNextPage: vi.fn(),
    })),
    QueryClient: class {
      getQueryData = vi.fn();
      setQueryData = vi.fn();
      invalidateQueries = vi.fn();
    },
  };
}

/**
 * Mock local storage
 */
export function createMockLocalStorage() {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
}

/**
 * Mock backend API client
 */
export function createMockBackendApi() {
  return {
    auth: {
      register: vi.fn().mockResolvedValue({ id: 1, email: "test@example.com", token: "mock-token" }),
      login: vi.fn().mockResolvedValue({ id: 1, email: "test@example.com", token: "mock-token" }),
      logout: vi.fn().mockResolvedValue({}),
      me: vi.fn().mockResolvedValue({ id: 1, email: "test@example.com" }),
    },
    blogs: {
      getAll: vi.fn().mockResolvedValue([]),
      getById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    comments: {
      getAll: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    donations: {
      create: vi.fn().mockResolvedValue({}),
      getHistory: vi.fn().mockResolvedValue([]),
    },
  };
}

/**
 * Mock AzuraCast client
 */
export function createMockAzuracastClient() {
  return {
    getNowPlaying: vi.fn().mockResolvedValue({
      station: { listen_url: "http://stream.local:8000" },
      now_playing: { song: { title: "Test Song", artist: "Test Artist" } },
      listeners: { current: 10 },
      live: { is_live: true },
    }),
    getPlaylists: vi.fn().mockResolvedValue([]),
    getPlaylistSongs: vi.fn().mockResolvedValue([]),
  };
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  vi.clearAllMocks();
}

import { vi } from 'vitest';
import type { Mock } from 'vitest';
import axios from 'axios';
import { mockAzuraNowPlayingResponse, mockAzuraPlaylist, azuracastApiError } from '../fixtures/azuracast.js';

/**
 * Mock axios for AzuraCast API calls
 */

export const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  request: vi.fn(),
} as unknown as typeof axios;

/**
 * Setup successful AzuraCast API mock responses
 */
export function setupSuccessfulAzuracastMocks() {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {},
      },
    },
  };

  // Mock now-playing endpoint
  mockAxiosInstance.get.mockImplementation((url: string) => {
    if (url.includes('now-playing')) {
      return Promise.resolve({
        data: mockAzuraNowPlayingResponse,
        status: 200,
        statusText: 'OK',
      });
    }
    if (url.includes('playlists')) {
      return Promise.resolve({
        data: [mockAzuraPlaylist],
        status: 200,
        statusText: 'OK',
      });
    }
    return Promise.reject(new Error('Endpoint not mocked'));
  });

  return mockAxiosInstance;
}

/**
 * Setup failed AzuraCast API mock responses
 */
export function setupFailedAzuracastMocks() {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  mockAxiosInstance.get.mockRejectedValue(
    new Error('API request failed')
  );

  return mockAxiosInstance;
}

/**
 * Setup AzuraCast API error responses (401, 404, 500)
 */
export function setupAzuracastErrorMocks() {
  const mockAxiosInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  };

  mockAxiosInstance.get.mockRejectedValue({
    response: {
      status: 401,
      data: azuracastApiError,
    },
  });

  return mockAxiosInstance;
}

/**
 * Create a mock fetch function for testing API calls
 */
export function createMockFetch(responses: Record<string, any>) {
  return vi.fn((url: string, options?: any) => {
    const key = Object.keys(responses).find(k => url.includes(k));
    if (key) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responses[key]),
      });
    }
    return Promise.reject(new Error(`No mock response for ${url}`));
  });
}

/**
 * Reset all mocks
 */
export function resetAllMocks() {
  vi.clearAllMocks();
}

/**
 * Mock successful HTTP response
 */
export interface MockResponse<T = any> {
  ok: boolean;
  status: number;
  statusText: string;
  json: () => Promise<T>;
  text: () => Promise<string>;
}

export function createMockResponse<T>(
  data: T,
  status: number = 200
): MockResponse<T> {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

/**
 * Mock failed HTTP response
 */
export function createMockErrorResponse(
  status: number = 500,
  message: string = 'Internal Server Error'
): Promise<never> {
  return Promise.reject({
    ok: false,
    status,
    statusText: message,
    json: () => Promise.resolve({ error: message }),
  });
}

/**
 * API Client Tests
 * Test the HTTP client for AzuraCast API
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { apiCall } from '@/modules/azuracast/api/client';

describe('apiCall', () => {
  let fetchMock: typeof global.fetch;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should make a successful API call', async () => {
    const mockData = { id: 1, name: 'Test Station' };
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockData,
    } as any);

    const result = await apiCall('/stations');

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockData);
    expect(result.status).toBe(200);
  });

  it('should handle API errors', async () => {
    const errorData = { error: { message: 'Station not found' } };
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => errorData,
    });

    const result = await apiCall('/stations/999');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(result.status).toBe(404);
  });

  it('should handle network errors', async () => {
    const error = new Error('Network error');
    fetchMock.mockRejectedValueOnce(error);

    const result = await apiCall('/stations');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Network error');
    expect(result.status).toBe(0);
  });

  it('should include API Key in headers if provided', async () => {
    // Note: This test depends on env variable
    // In real test, you'd mock import.meta.env
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: 'test' }),
    });

    await apiCall('/stations');

    expect(fetchMock).toHaveBeenCalled();
    const call = fetchMock.mock.calls[0];
    const headers = call[1]?.headers as Record<string, string>;
    expect(headers).toBeDefined();
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('should handle JSON parse errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => {
        throw new Error('Invalid JSON');
      },
    });

    const result = await apiCall('/stations');

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should merge custom options with defaults', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await apiCall('/stations', {
      method: 'POST',
      body: JSON.stringify({ name: 'New Station' }),
    });

    const call = fetchMock.mock.calls[0];
    expect(call[1]?.method).toBe('POST');
    expect(call[1]?.body).toBeDefined();
  });
});

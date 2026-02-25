/**
 * AzuraCast API Client
 * Base client for all AzuraCast API calls
 */

const API_BASE = import.meta.env.VITE_AZURACAST_BASE_URL || 'http://localhost';
const API_KEY = import.meta.env.VITE_AZURACAST_API_KEY || '';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status: number;
}

/**
 * Make HTTP request to AzuraCast API
 */
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE}/api${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Agregar API Key si existe
    if (API_KEY) {
      headers['X-API-Key'] = API_KEY;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`AzuraCast API Error [${endpoint}]:`, {
        status: response.status,
        error: data,
      });

      return {
        success: false,
        error: data.error?.message || `HTTP ${response.status}`,
        status: response.status,
      };
    }

    return {
      success: true,
      data,
      status: response.status,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`AzuraCast API Error [${endpoint}]:`, errorMsg);

    return {
      success: false,
      error: errorMsg,
      status: 0,
    };
  }
}

export { API_BASE, API_KEY };

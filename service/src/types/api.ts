/**
 * API response wrapper
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;
}

export function success<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function error(message: string, code?: string): ApiResponse<null> {
  return {
    success: false,
    error: { message, code },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Environment configuration
 */

import 'dotenv/config';

export const env = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: (process.env.NODE_ENV || 'development') as 'development' | 'production' | 'test',
  
  // AzuraCast
  AZURACAST_BASE_URL: process.env.AZURACAST_BASE_URL || 'https://demo.azuracast.com',
  AZURACAST_STATION_ID: process.env.AZURACAST_STATION_ID || '1',
  AZURACAST_API_KEY: process.env.AZURACAST_API_KEY || '',
  
  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Cache
  CACHE_TTL_SECONDS: parseInt(process.env.CACHE_TTL_SECONDS || '60', 10),
} as const;

// Validate critical env vars in production
if (env.NODE_ENV === 'production') {
  const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

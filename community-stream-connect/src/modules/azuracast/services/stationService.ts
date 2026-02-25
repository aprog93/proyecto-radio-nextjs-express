/**
 * AzuraCast Station Service
 * Operaciones relacionadas con estaciones de radio
 * Now uses backend BFF instead of direct AzuraCast calls
 */

import { apiCall } from '@/lib/backend-api';
import type { Station, StationInfo, NowPlaying } from '../types/azuracast';

/**
 * Obtener todas las estaciones
 */
export async function getStations(): Promise<Station[]> {
  const response = await apiCall<Station[]>('/stations');

  if (!response.success) {
    console.error('Failed to fetch stations:', response.error);
    return [];
  }

  return response.data || [];
}

/**
 * Obtener información de una estación específica
 */
export async function getStationInfo(stationId: number): Promise<Station | null> {
  const response = await apiCall<Station>(`/stations/${stationId}`);

  if (!response.success) {
    console.error(`Failed to fetch station ${stationId}:`, response.error);
    return null;
  }

  return response.data || null;
}

/**
 * Obtener estado actual de una estación
 */
export async function getStationStatus(stationId: number): Promise<StationInfo | null> {
  const response = await apiCall<StationInfo>(`/stations/${stationId}/status`);

  if (!response.success) {
    console.error(`Failed to fetch station status ${stationId}:`, response.error);
    return null;
  }

  return response.data || null;
}

/**
 * Obtener canción actual y datos en tiempo real
 * Proxied through backend for caching and security
 */
export async function getNowPlaying(stationId: number): Promise<NowPlaying | null> {
  const response = await apiCall<NowPlaying>('/station/now-playing');

  if (!response.success) {
    console.error(`Failed to fetch now playing:`, response.error);
    return null;
  }

  return response.data || null;
}

/**
 * Obtener oyentes conectados
 */
export async function getListeners(stationId: number): Promise<number> {
  try {
    const nowPlaying = await getNowPlaying(stationId);
    return nowPlaying?.listeners.total || 0;
  } catch (err) {
    console.error('Failed to fetch listeners:', err);
    return 0;
  }
}

/**
 * Obtener información de un mount point específico
 */
export async function getMountInfo(
  stationId: number,
  mountName: string
): Promise<any> {
  const response = await apiCall(`/stations/${stationId}/mount/${mountName}`);

  if (!response.success) {
    console.error(`Failed to fetch mount ${mountName}:`, response.error);
    return null;
  }

  return response.data || null;
}

// Export all as service object
export const stationService = {
  getStations,
  getStationInfo,
  getStationStatus,
  getNowPlaying,
  getListeners,
  getMountInfo,
};

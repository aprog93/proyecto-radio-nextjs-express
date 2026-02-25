/**
 * AzuraCast History & Requests Service
 * Operaciones relacionadas con historial de canciones y solicitudes
 */

import { apiCall } from '../api/client';
import type { Song } from '../types/azuracast';

export interface HistoryItem {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: Song;
}

export interface RequestItem {
  request_id: number;
  song_id: number;
  song: Song;
  ip: string;
  timestamp: number;
}

/**
 * Obtener historial de canciones reproducidasde una estación
 */
export async function getHistory(
  stationId: number,
  limit: number = 50
): Promise<HistoryItem[]> {
  const response = await apiCall<HistoryItem[]>(
    `/stations/${stationId}/history?limit=${limit}`
  );

  if (!response.success) {
    console.error(`Failed to fetch history for station ${stationId}:`, response.error);
    return [];
  }

  return response.data || [];
}

/**
 * Obtener canciones que pueden ser solicitadas
 */
export async function getRequestableSongs(stationId: number): Promise<Song[]> {
  const response = await apiCall<Song[]>(`/stations/${stationId}/requests`);

  if (!response.success) {
    console.error(`Failed to fetch requestable songs for station ${stationId}:`, response.error);
    return [];
  }

  return response.data || [];
}

/**
 * Solicitar una canción específica
 */
export async function requestSong(
  stationId: number,
  songId: number
): Promise<RequestItem | null> {
  const response = await apiCall<RequestItem>(
    `/stations/${stationId}/request/${songId}`,
    {
      method: 'POST',
    }
  );

  if (!response.success) {
    console.error(`Failed to request song ${songId}:`, response.error);
    return null;
  }

  return response.data || null;
}

/**
 * Obtener solicitudes pendientes
 */
export async function getPendingRequests(stationId: number): Promise<RequestItem[]> {
  const response = await apiCall<RequestItem[]>(
    `/stations/${stationId}/requests/pending`
  );

  if (!response.success) {
    console.error(`Failed to fetch pending requests:`, response.error);
    return [];
  }

  return response.data || [];
}

// Export all as service object
export const historyService = {
  getHistory,
  getRequestableSongs,
  requestSong,
  getPendingRequests,
};

/**
 * AzuraCast Playlist Service
 * Operaciones relacionadas con playlists y canciones
 * Now uses backend BFF instead of direct AzuraCast calls
 */

import { apiCall } from '@/lib/backend-api';
import type { Playlist, Song, PlaylistItem, SongDetails } from '../types/azuracast';

/**
 * Obtener todas las playlists de una estación
 * Proxied through backend for caching
 */
export async function getPlaylists(stationId: number): Promise<Playlist[]> {
  const response = await apiCall<Playlist[]>('/station/playlists');

  if (!response.success) {
    console.error(`Failed to fetch playlists:`, response.error);
    return [];
  }

  return response.data || [];
}

/**
 * Obtener canciones de una playlist específica
 * Proxied through backend for caching
 */
export async function getPlaylistSongs(
  stationId: number,
  playlistId: number,
  limit: number = 50
): Promise<PlaylistItem[]> {
  const response = await apiCall<PlaylistItem[]>(
    `/station/playlists/${playlistId}/songs?limit=${limit}`
  );

  if (!response.success) {
    console.error(
      `Failed to fetch songs for playlist ${playlistId}:`,
      response.error
    );
    return [];
  }

  return response.data || [];
}

/**
 * Obtener detalles de una canción específica
 */
export async function getSongDetails(
  stationId: number,
  songId: string
): Promise<SongDetails | null> {
  const response = await apiCall<SongDetails>(`/stations/${stationId}/song/${songId}`);

  if (!response.success) {
    console.error(`Failed to fetch song details for ${songId}:`, response.error);
    return null;
  }

  return response.data || null;
}

/**
 * Obtener playlists habilitadas (activas)
 */
export async function getEnabledPlaylists(stationId: number): Promise<Playlist[]> {
  const playlists = await getPlaylists(stationId);
  return playlists.filter((p) => p.isEnabled);
}

/**
 * Obtener cantidad total de canciones en una playlist
 */
export function getPlaylistSongCount(playlist: Playlist): number {
  return playlist.songCount || 0;
}

/**
 * Filtrar playlists por tipo
 */
export function filterPlaylistsByType(
  playlists: Playlist[],
  type: string
): Playlist[] {
  return playlists.filter((p) => p.type === type);
}

// Export all as service object
export const playlistService = {
  getPlaylists,
  getPlaylistSongs,
  getSongDetails,
  getEnabledPlaylists,
  getPlaylistSongCount,
  filterPlaylistsByType,
};

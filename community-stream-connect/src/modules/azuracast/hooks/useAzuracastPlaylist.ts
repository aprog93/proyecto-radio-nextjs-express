/**
 * useAzuracastPlaylist Hook
 * Custom hook para obtener datos de playlists
 *
 * Ejemplo de uso:
 * const { playlists, songs, isLoading, error } = useAzuracastPlaylist(1);
 */

import { useState, useEffect, useCallback } from 'react';
import { playlistService } from '../services/playlistService';
import type { Playlist, PlaylistItem } from '../types/azuracast';

export interface UseAzuracastPlaylistReturn {
  playlists: Playlist[];
  enabledPlaylists: Playlist[];
  currentPlaylistSongs: PlaylistItem[];
  selectedPlaylistId: number | null;
  isLoading: boolean;
  error: string | null;
  selectPlaylist: (playlistId: number) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener datos de playlists de una estación
 * @param stationId - ID de la estación
 * @param autoLoad - Cargar playlists automáticamente (default: true)
 */
export function useAzuracastPlaylist(
  stationId: number,
  autoLoad: boolean = true
): UseAzuracastPlaylistReturn {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylistSongs, setCurrentPlaylistSongs] = useState<PlaylistItem[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener todas las playlists
  const fetchPlaylists = useCallback(async () => {
    try {
      setError(null);
      const data = await playlistService.getPlaylists(stationId);
      setPlaylists(data);

      if (data.length === 0) {
        setError('No playlists found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('useAzuracastPlaylist error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stationId]);

  // Función para seleccionar una playlist y cargar sus canciones
  const selectPlaylist = useCallback(
    async (playlistId: number) => {
      try {
        setError(null);
        setSelectedPlaylistId(playlistId);
        setIsLoading(true);

        const songs = await playlistService.getPlaylistSongs(stationId, playlistId);
        setCurrentPlaylistSongs(songs);

        if (songs.length === 0) {
          console.warn(`Playlist ${playlistId} has no songs`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('selectPlaylist error:', errorMessage);
        setCurrentPlaylistSongs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [stationId]
  );

  // Fetch inicial
  useEffect(() => {
    if (autoLoad) {
      fetchPlaylists();
    }
  }, [autoLoad, fetchPlaylists]);

  // Obtener playlists habilitadas (filtrado)
  const enabledPlaylists = playlists.filter((p) => p.isEnabled);

  return {
    playlists,
    enabledPlaylists,
    currentPlaylistSongs,
    selectedPlaylistId,
    isLoading,
    error,
    selectPlaylist,
    refetch: fetchPlaylists,
  };
}

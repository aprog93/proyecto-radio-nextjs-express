/**
 * useAzuracastStation Hook
 * Custom hook para obtener datos de una estación con polling automático
 *
 * Ejemplo de uso:
 * const { station, nowPlaying, isLoading, error } = useAzuracastStation(1);
 */

import { useState, useEffect, useCallback } from 'react';
import { stationService } from '../services/stationService';
import type { Station, NowPlaying, StationInfo } from '../types/azuracast';

const POLLING_INTERVAL = import.meta.env.VITE_AZURACAST_POLLING_INTERVAL
  ? parseInt(import.meta.env.VITE_AZURACAST_POLLING_INTERVAL)
  : 15000; // 15 segundos por defecto

export interface UseAzuracastStationReturn {
  station: Station | null;
  nowPlaying: NowPlaying | null;
  stationInfo: StationInfo | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener datos de una estación con polling automático
 * @param stationId - ID de la estación
 * @param autoPolling - Habilitar polling automático (default: true)
 * @param pollInterval - Intervalo de polling en ms (default: 15000)
 */
export function useAzuracastStation(
  stationId: number,
  autoPolling: boolean = true,
  pollInterval: number = POLLING_INTERVAL
): UseAzuracastStationReturn {
  const [station, setStation] = useState<Station | null>(null);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [stationInfo, setStationInfo] = useState<StationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener todos los datos
  const fetchStationData = useCallback(async () => {
    try {
      setError(null);

      // Obtener datos en paralelo
      const [stationData, nowPlayingData, statusData] = await Promise.all([
        stationService.getStationInfo(stationId),
        stationService.getNowPlaying(stationId),
        stationService.getStationStatus(stationId),
      ]);

      if (stationData) setStation(stationData);
      if (nowPlayingData) setNowPlaying(nowPlayingData);
      if (statusData) setStationInfo(statusData);

      // Si todos fallaron, establecer error
      if (!stationData && !nowPlayingData && !statusData) {
        setError('Failed to load station data');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('useAzuracastStation error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stationId]);

  // Fetch inicial
  useEffect(() => {
    fetchStationData();
  }, [fetchStationData]);

  // Polling automático
  useEffect(() => {
    if (!autoPolling) return;

    const interval = setInterval(() => {
      fetchStationData();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [autoPolling, pollInterval, fetchStationData]);

  return {
    station,
    nowPlaying,
    stationInfo,
    isLoading,
    error,
    refetch: fetchStationData,
  };
}

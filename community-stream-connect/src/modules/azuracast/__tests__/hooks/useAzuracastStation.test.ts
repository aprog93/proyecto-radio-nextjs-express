/**
 * useAzuracastStation Hook Tests
 * Test station hook with polling and error handling
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAzuracastStation } from '@/modules/azuracast/hooks/useAzuracastStation';
import * as stationService from '@/modules/azuracast/services/stationService';

vi.mock('@/modules/azuracast/services/stationService');

const mockStationService = stationService as any;

describe('useAzuracastStation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch station data on mount', async () => {
    const mockStation = { id: 1, name: 'Test', shortcode: 'test', description: '', listenUrl: '', isPublic: true, hlsEnabled: false };
    const mockNowPlaying = {
      station: mockStation,
      nowPlaying: { song: { id: '', title: 'Song', artist: 'Artist', album: '', art: '', duration: 180 }, elapsed: 0, remaining: 180, duration: 180 },
      listeners: { total: 42, unique: 30 },
      live: { isLive: false },
    };
    const mockStatus = { uptime: 86400, listeners: 42, hlsListeners: 5, isOnline: true };

    mockStationService.getStationInfo.mockResolvedValueOnce(mockStation);
    mockStationService.getNowPlaying.mockResolvedValueOnce(mockNowPlaying);
    mockStationService.getStationStatus.mockResolvedValueOnce(mockStatus);

    const { result } = renderHook(() => useAzuracastStation(1, false));

    expect(result.current.isLoading).toBe(true);

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.station).toEqual(mockStation);
    expect(result.current.nowPlaying).toEqual(mockNowPlaying);
    expect(result.current.stationInfo).toEqual(mockStatus);
    expect(result.current.error).toBeNull();
  }, 10000);

  it('should handle errors gracefully', async () => {
    mockStationService.getStationInfo.mockResolvedValueOnce(null);
    mockStationService.getNowPlaying.mockResolvedValueOnce(null);
    mockStationService.getStationStatus.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAzuracastStation(1, false));

    await waitFor(
      () => {
        expect(result.current.isLoading).toBe(false);
      },
      { timeout: 3000 }
    );

    expect(result.current.error).toBeDefined();
    expect(result.current.station).toBeNull();
  }, 10000);

  it('should allow manual refetch', async () => {
    const mockStation = { id: 1, name: 'Test', shortcode: 'test', description: '', listenUrl: '', isPublic: true, hlsEnabled: false };
    mockStationService.getStationInfo.mockResolvedValue(mockStation);
    mockStationService.getNowPlaying.mockResolvedValue(null);
    mockStationService.getStationStatus.mockResolvedValue(null);

    const { result } = renderHook(() => useAzuracastStation(1, false));

    await waitFor(
      () => {
        expect(result.current.station).toEqual(mockStation);
      },
      { timeout: 3000 }
    );

    expect(mockStationService.getStationInfo).toHaveBeenCalledTimes(1);

    // Manual refetch
    result.current.refetch();

    await waitFor(
      () => {
        expect(mockStationService.getStationInfo).toHaveBeenCalledTimes(2);
      },
      { timeout: 3000 }
    );
  }, 10000);

  it('should disable polling when autoPolling is false', async () => {
    mockStationService.getStationInfo.mockResolvedValue(null);
    mockStationService.getNowPlaying.mockResolvedValue(null);
    mockStationService.getStationStatus.mockResolvedValue(null);

    renderHook(() => useAzuracastStation(1, false, 5000));

    await waitFor(
      () => {
        expect(mockStationService.getStationInfo).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );

    // Wait a bit more - should not fetch again
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(mockStationService.getStationInfo).toHaveBeenCalledTimes(1);
  }, 10000);
});

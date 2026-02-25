/**
 * useAzuracastPlaylist Hook Tests
 * Test playlist hook with dynamic loading
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAzuracastPlaylist } from '@/modules/azuracast/hooks/useAzuracastPlaylist';
import * as playlistService from '@/modules/azuracast/services/playlistService';

vi.mock('@/modules/azuracast/services/playlistService');

const mockPlaylistService = playlistService as any;

describe('useAzuracastPlaylist', () => {
  const mockPlaylists = [
    { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 },
    { id: 2, name: 'Chill', type: 'standard', source: 'songs', isEnabled: true, songCount: 32 },
    { id: 3, name: 'Disabled', type: 'standard', source: 'songs', isEnabled: false, songCount: 10 },
  ];

  const mockSongs = [
    {
      id: 1,
      playlistId: 1,
      song: { id: 'song1', title: 'Song 1', artist: 'Artist 1', album: 'Album', art: '', duration: 180 },
      weight: 1,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load playlists on mount with autoLoad', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValueOnce(mockPlaylists);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.playlists).toEqual(mockPlaylists);
    expect(result.current.enabledPlaylists).toHaveLength(2);
    expect(mockPlaylistService.getPlaylists).toHaveBeenCalledWith(1);
  });

  it('should not load playlists when autoLoad is false', async () => {
    const { result } = renderHook(() => useAzuracastPlaylist(1, false));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.playlists).toEqual([]);
    expect(mockPlaylistService.getPlaylists).not.toHaveBeenCalled();
  });

  it('should load songs when selecting a playlist', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValueOnce(mockPlaylists);
    mockPlaylistService.getPlaylistSongs.mockResolvedValueOnce(mockSongs);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Select a playlist
    act(() => {
      result.current.selectPlaylist(1);
    });

    await waitFor(() => {
      expect(result.current.selectedPlaylistId).toBe(1);
    });

    expect(result.current.currentPlaylistSongs).toEqual(mockSongs);
    expect(mockPlaylistService.getPlaylistSongs).toHaveBeenCalledWith(1, 1);
  });

  it('should handle errors when selecting playlist', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValueOnce(mockPlaylists);
    mockPlaylistService.getPlaylistSongs.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Select a playlist
    act(() => {
      result.current.selectPlaylist(999);
    });

    await waitFor(() => {
      expect(result.current.currentPlaylistSongs).toEqual([]);
    });
  });

  it('should filter enabled playlists correctly', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValueOnce(mockPlaylists);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.enabledPlaylists).toHaveLength(2);
    expect(result.current.enabledPlaylists.every((p) => p.isEnabled)).toBe(true);
    expect(result.current.playlists).toHaveLength(3);
  });

  it('should allow manual refetch', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValue(mockPlaylists);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockPlaylistService.getPlaylists).toHaveBeenCalledTimes(1);

    // Manual refetch
    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(mockPlaylistService.getPlaylists).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle API errors', async () => {
    mockPlaylistService.getPlaylists.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.playlists).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should clear songs when selecting different playlist', async () => {
    const mockSongs2 = [
      {
        id: 2,
        playlistId: 2,
        song: { id: 'song2', title: 'Song 2', artist: 'Artist 2', album: 'Album', art: '', duration: 220 },
        weight: 1,
      },
    ];

    mockPlaylistService.getPlaylists.mockResolvedValueOnce(mockPlaylists);
    mockPlaylistService.getPlaylistSongs
      .mockResolvedValueOnce(mockSongs)
      .mockResolvedValueOnce(mockSongs2);

    const { result } = renderHook(() => useAzuracastPlaylist(1, true));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Select first playlist
    act(() => {
      result.current.selectPlaylist(1);
    });

    await waitFor(() => {
      expect(result.current.currentPlaylistSongs).toEqual(mockSongs);
    });

    // Select second playlist
    act(() => {
      result.current.selectPlaylist(2);
    });

    await waitFor(() => {
      expect(result.current.currentPlaylistSongs).toEqual(mockSongs2);
    });

    expect(mockPlaylistService.getPlaylistSongs).toHaveBeenCalledTimes(2);
  });
});

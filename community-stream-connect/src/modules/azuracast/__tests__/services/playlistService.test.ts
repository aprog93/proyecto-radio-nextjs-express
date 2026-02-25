/**
 * Playlist Service Tests
 * Test all playlist-related API operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { playlistService } from '@/modules/azuracast/services/playlistService';
import * as client from '@/modules/azuracast/api/client';

vi.mock('@/modules/azuracast/api/client');

const mockApiCall = client.apiCall as any;

describe('playlistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPlaylists', () => {
    it('should return list of playlists', async () => {
      const mockPlaylists = [
        { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 },
        { id: 2, name: 'Chill', type: 'standard', source: 'songs', isEnabled: true, songCount: 32 },
      ];
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockPlaylists });

      const result = await playlistService.getPlaylists(1);

      expect(result).toEqual(mockPlaylists);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/playlists');
    });

    it('should return empty array on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Not found' });

      const result = await playlistService.getPlaylists(1);

      expect(result).toEqual([]);
    });
  });

  describe('getPlaylistSongs', () => {
    it('should return songs from playlist', async () => {
      const mockSongs = [
        {
          id: 1,
          playlistId: 1,
          song: { id: 'song1', title: 'Song 1', artist: 'Artist 1', album: 'Album', art: '', duration: 180 },
          weight: 1,
        },
        {
          id: 2,
          playlistId: 1,
          song: { id: 'song2', title: 'Song 2', artist: 'Artist 2', album: 'Album', art: '', duration: 240 },
          weight: 1,
        },
      ];
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockSongs });

      const result = await playlistService.getPlaylistSongs(1, 1);

      expect(result).toEqual(mockSongs);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/playlist/1/songs?limit=50');
    });

    it('should support custom limit', async () => {
      mockApiCall.mockResolvedValueOnce({ success: true, data: [] });

      await playlistService.getPlaylistSongs(1, 1, 100);

      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/playlist/1/songs?limit=100');
    });

    it('should return empty array on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Error' });

      const result = await playlistService.getPlaylistSongs(1, 1);

      expect(result).toEqual([]);
    });
  });

  describe('getSongDetails', () => {
    it('should return song details', async () => {
      const mockSong = {
        id: 'song1',
        title: 'Test Song',
        artist: 'Test Artist',
        album: 'Test Album',
        art: 'http://example.com/art.jpg',
        genre: 'Pop',
        duration: 180,
        lyrics: 'Test lyrics...',
        path: '/music/song.mp3',
      };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockSong });

      const result = await playlistService.getSongDetails(1, 'song1');

      expect(result).toEqual(mockSong);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/song/song1');
    });

    it('should return null on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Not found' });

      const result = await playlistService.getSongDetails(1, 'nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getEnabledPlaylists', () => {
    it('should filter only enabled playlists', async () => {
      const mockPlaylists = [
        { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 },
        { id: 2, name: 'Disabled', type: 'standard', source: 'songs', isEnabled: false, songCount: 10 },
        { id: 3, name: 'Chill', type: 'standard', source: 'songs', isEnabled: true, songCount: 32 },
      ];
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockPlaylists });

      const result = await playlistService.getEnabledPlaylists(1);

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.isEnabled)).toBe(true);
    });

    it('should return empty array if no playlists', async () => {
      mockApiCall.mockResolvedValueOnce({ success: true, data: [] });

      const result = await playlistService.getEnabledPlaylists(1);

      expect(result).toEqual([]);
    });
  });

  describe('getPlaylistSongCount', () => {
    it('should return song count from playlist', () => {
      const playlist = { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 };

      const count = playlistService.getPlaylistSongCount(playlist);

      expect(count).toBe(45);
    });

    it('should return 0 if songCount is missing', () => {
      const playlist = { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 0 };

      const count = playlistService.getPlaylistSongCount(playlist);

      expect(count).toBe(0);
    });
  });

  describe('filterPlaylistsByType', () => {
    it('should filter playlists by type', () => {
      const playlists = [
        { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 },
        { id: 2, name: 'Live', type: 'live', source: 'stream', isEnabled: true, songCount: 0 },
        { id: 3, name: 'Chill', type: 'standard', source: 'songs', isEnabled: true, songCount: 32 },
      ];

      const result = playlistService.filterPlaylistsByType(playlists, 'standard');

      expect(result).toHaveLength(2);
      expect(result.every((p) => p.type === 'standard')).toBe(true);
    });

    it('should return empty array if no matches', () => {
      const playlists = [
        { id: 1, name: 'Mix', type: 'standard', source: 'songs', isEnabled: true, songCount: 45 },
      ];

      const result = playlistService.filterPlaylistsByType(playlists, 'live');

      expect(result).toEqual([]);
    });
  });
});

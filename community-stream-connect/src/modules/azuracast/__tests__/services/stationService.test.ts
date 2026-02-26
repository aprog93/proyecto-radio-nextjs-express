/**
 * Station Service Tests
 * Test all station-related API operations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { stationService } from '@/modules/azuracast/services/stationService';
import * as client from '@/modules/azuracast/api/client';

vi.mock('@/modules/azuracast/api/client');

const mockApiCall = client.apiCall as any;

describe('stationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStations', () => {
    it('should return list of stations', async () => {
      const mockStations = [
        { id: 1, name: 'Station 1', shortcode: 'st1', description: '', listenUrl: '', isPublic: true, hlsEnabled: false },
        { id: 2, name: 'Station 2', shortcode: 'st2', description: '', listenUrl: '', isPublic: true, hlsEnabled: false },
      ];
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockStations });

      const result = await stationService.getStations();

      expect(result).toEqual(mockStations);
      expect(mockApiCall).toHaveBeenCalledWith('/stations');
    });

    it('should return empty array on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Network error' });

      const result = await stationService.getStations();

      expect(result).toEqual([]);
    });
  });

  describe('getStationInfo', () => {
    it('should return station info', async () => {
      const mockStation = {
        id: 1,
        name: 'Proyecto Radio',
        shortcode: 'proyecto',
        description: 'Community Radio',
        listenUrl: 'http://localhost/stream',
        isPublic: true,
        hlsEnabled: false,
      };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockStation });

      const result = await stationService.getStationInfo(1);

      expect(result).toEqual(mockStation);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1');
    });

    it('should return null on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Not found' });

      const result = await stationService.getStationInfo(999);

      expect(result).toBeNull();
    });
  });

  describe('getStationStatus', () => {
    it('should return station status', async () => {
      const mockStatus = {
        uptime: 86400,
        listeners: 42,
        hlsListeners: 5,
        isOnline: true,
      };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockStatus });

      const result = await stationService.getStationStatus(1);

      expect(result).toEqual(mockStatus);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/status');
    });

    it('should return null on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Offline' });

      const result = await stationService.getStationStatus(1);

      expect(result).toBeNull();
    });
  });

  describe('getNowPlaying', () => {
    it('should return now playing data', async () => {
      const mockNowPlaying = {
        station: { id: 1, name: 'Station', shortcode: '', description: '', listenUrl: '', isPublic: true, hlsEnabled: false },
        nowPlaying: {
          song: { id: 'song1', title: 'Song', artist: 'Artist', album: 'Album', art: '', duration: 180 },
          elapsed: 45,
          remaining: 135,
          duration: 180,
        },
        listeners: { total: 42, unique: 30 },
        live: { isLive: false },
      };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockNowPlaying });

      const result = await stationService.getNowPlaying(1);

      expect(result).toEqual(mockNowPlaying);
      expect(mockApiCall).toHaveBeenCalledWith('/nowplaying/1');
    });

    it('should return null on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Server error' });

      const result = await stationService.getNowPlaying(1);

      expect(result).toBeNull();
    });
  });

  describe('getListeners', () => {
    it('should return listener count from now playing', async () => {
      const mockNowPlaying = {
        station: { id: 1, name: '', shortcode: '', description: '', listenUrl: '', isPublic: true, hlsEnabled: false },
        nowPlaying: { song: { id: '', title: '', artist: '', album: '', art: '', duration: 0 }, elapsed: 0, remaining: 0, duration: 0 },
        listeners: { total: 100, unique: 75 },
        live: { isLive: false },
      };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockNowPlaying });

      const result = await stationService.getListeners(1);

      expect(result).toBe(100);
    });

    it('should return 0 on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Error' });

      const result = await stationService.getListeners(1);

      expect(result).toBe(0);
    });
  });

  describe('getMountInfo', () => {
    it('should return mount info', async () => {
      const mockMount = { url: '/live.m3u8', bitrate: 128, listeners: 42 };
      mockApiCall.mockResolvedValueOnce({ success: true, data: mockMount });

      const result = await stationService.getMountInfo(1, 'live');

      expect(result).toEqual(mockMount);
      expect(mockApiCall).toHaveBeenCalledWith('/stations/1/mount/live');
    });

    it('should return null on error', async () => {
      mockApiCall.mockResolvedValueOnce({ success: false, error: 'Not found' });

      const result = await stationService.getMountInfo(1, 'nonexistent');

      expect(result).toBeNull();
    });
  });
});

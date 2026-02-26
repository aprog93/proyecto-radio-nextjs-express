/**
 * AzuraCast API service - Proxy and cache layer
 */

import axios, { AxiosError } from 'axios';
import { env } from '../config/env.js';
import { cache } from '../lib/cache.js';
import {
  AzuraNowPlayingResponse,
  AzuraPlaylistsResponse,
  AzuraPlaylistSongsResponse,
} from '../types/azuracast.js';

const client = axios.create({
  baseURL: `${env.AZURACAST_BASE_URL}/api`,
  timeout: 10000,
});

// Add API key header if available
if (env.AZURACAST_API_KEY) {
  client.defaults.headers.common['X-API-Key'] = env.AZURACAST_API_KEY;
}

export class AzuraCastService {
  /**
   * Get now playing metadata with cache
   */
  static async getNowPlaying(): Promise<AzuraNowPlayingResponse> {
    const cacheKey = 'azura:now-playing';
    const cached = cache.get<AzuraNowPlayingResponse>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await client.get<AzuraNowPlayingResponse>(
        `/nowplaying/${env.AZURACAST_STATION_ID}`
      );
      
      cache.set(cacheKey, response.data, env.CACHE_TTL_SECONDS);
      return response.data;
    } catch (err) {
      throw this._handleError('getNowPlaying', err);
    }
  }

  /**
   * Get station playlists
   */
  static async getPlaylists(): Promise<AzuraPlaylistsResponse[]> {
    const cacheKey = 'azura:playlists';
    const cached = cache.get<AzuraPlaylistsResponse[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await client.get<AzuraPlaylistsResponse[]>(
        `/stations/${env.AZURACAST_STATION_ID}/playlists`
      );
      
      cache.set(cacheKey, response.data, env.CACHE_TTL_SECONDS);
      return response.data;
    } catch (err) {
      throw this._handleError('getPlaylists', err);
    }
  }

  /**
   * Get songs from a specific playlist
   */
  static async getPlaylistSongs(
    playlistId: number,
    limit: number = 50,
    offset: number = 0
  ): Promise<AzuraPlaylistSongsResponse[]> {
    const cacheKey = `azura:playlist:${playlistId}:${offset}`;
    const cached = cache.get<AzuraPlaylistSongsResponse[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const response = await client.get<AzuraPlaylistSongsResponse[]>(
        `/stations/${env.AZURACAST_STATION_ID}/playlists/${playlistId}/songs`,
        {
          params: { limit, offset },
        }
      );
      
      cache.set(cacheKey, response.data, env.CACHE_TTL_SECONDS);
      return response.data;
    } catch (err) {
      throw this._handleError('getPlaylistSongs', err);
    }
  }

  /**
   * Request a song (if supported by AzuraCast instance)
   */
  static async requestSong(songId: string): Promise<{ success: boolean }> {
    try {
      const response = await client.post(
        `/stations/${env.AZURACAST_STATION_ID}/requests`,
        { song_id: songId }
      );
      
      // Invalidate cache
      cache.clear('azura:now-playing');
      
      return response.data;
    } catch (err) {
      throw this._handleError('requestSong', err);
    }
  }

  /**
   * Clear cache (admin only)
   */
  static clearCache(): void {
    cache.clear();
  }

  /**
   * Error handler
   */
  private static _handleError(operation: string, error: unknown): Error {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      console.error(`AzuraCast API Error [${operation}]:`, {
        status: error.response?.status,
        message,
      });
      return new Error(`AzuraCast ${operation} failed: ${message}`);
    }
    
    console.error(`AzuraCast API Error [${operation}]:`, error);
    return error instanceof Error ? error : new Error(String(error));
  }
}

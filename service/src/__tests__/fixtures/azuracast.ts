import {
  AzuraSong,
  AzuraNowPlaying,
  AzuraListeners,
  AzuraLive,
  AzuraStation,
  AzuraNowPlayingResponse,
  AzuraPlaylistsResponse,
  AzuraPlaylistSongsResponse,
} from '@/types/azuracast.js';

/**
 * AzuraCast API response fixtures
 */

export const mockAzuraSong: AzuraSong = {
  id: '123456',
  art: 'https://example.com/cover.jpg',
  text: 'Artist Name - Song Title',
  artist: 'Artist Name',
  title: 'Song Title',
  album: 'Album Name',
  genre: 'Pop',
  lyrics: 'Song lyrics here...',
};

export const mockAzuraNowPlaying: AzuraNowPlaying = {
  sh_id: 1,
  played_at: Math.floor(Date.now() / 1000),
  duration: 240,
  playlist: 'Default Playlist',
  streamer: '',
  is_request: false,
  song: mockAzuraSong,
  elapsed: 120,
  remaining: 120,
};

export const mockAzuraListeners: AzuraListeners = {
  total: 1500,
  unique: 850,
  current: 125,
};

export const mockAzuraLive: AzuraLive = {
  is_live: true,
  streamer_name: 'DJ Roberto',
  broadcast_start: Math.floor(Date.now() / 1000) - 3600,
  art: 'https://example.com/dj.jpg',
};

export const mockAzuraLiveOffline: AzuraLive = {
  is_live: false,
  streamer_name: '',
  broadcast_start: null,
  art: null,
};

export const mockAzuraStation: AzuraStation = {
  id: 1,
  name: 'Radio Cesar',
  shortcode: 'radiocesar',
  description: 'Community radio station',
  frontend_type: 'shoutcast',
  backend_type: 'liquidsoap',
  listen_url: 'http://radiocesar.local:8000/live',
  is_public: true,
  is_master_station: true,
};

export const mockAzuraNowPlayingResponse: AzuraNowPlayingResponse = {
  station: mockAzuraStation,
  listeners: mockAzuraListeners,
  live: mockAzuraLive,
  now_playing: mockAzuraNowPlaying,
  playing_next: null,
  song_history: [mockAzuraNowPlaying],
};

export const mockAzuraPlaylist: AzuraPlaylistsResponse = {
  id: 1,
  name: 'Default Playlist',
  is_enabled: true,
  songs_count: 500,
  is_jingle: false,
  is_request: false,
};

export const mockAzuraPlaylistJingles: AzuraPlaylistsResponse = {
  id: 2,
  name: 'Jingles',
  is_enabled: true,
  songs_count: 25,
  is_jingle: true,
  is_request: false,
};

export const mockAzuraPlaylistSong: AzuraPlaylistSongsResponse = {
  id: 1001,
  song_id: '123456',
  playlist_id: 1,
  position: 0,
  weight: 1,
  played_at: Math.floor(Date.now() / 1000),
  song: mockAzuraSong,
};

/**
 * AzuraCast collections
 */

export const testAzuraPlaylists = [mockAzuraPlaylist, mockAzuraPlaylistJingles];
export const testAzuraPlaylistSongs = [mockAzuraPlaylistSong];

/**
 * Helper functions for creating mock data
 */

export function createMockAzuraSong(overrides: Partial<AzuraSong> = {}): AzuraSong {
  return {
    ...mockAzuraSong,
    id: `song-${Date.now()}`,
    ...overrides,
  };
}

export function createMockAzuraNowPlaying(
  overrides: Partial<AzuraNowPlaying> = {}
): AzuraNowPlaying {
  return {
    ...mockAzuraNowPlaying,
    sh_id: Math.floor(Math.random() * 10000),
    played_at: Math.floor(Date.now() / 1000),
    ...overrides,
  };
}

export function createMockAzuraNowPlayingResponse(
  overrides: Partial<AzuraNowPlayingResponse> = {}
): AzuraNowPlayingResponse {
  return {
    ...mockAzuraNowPlayingResponse,
    ...overrides,
  };
}

/**
 * Error response fixtures
 */

export const azuracastApiError = {
  error: 'Unauthorized',
  message: 'Invalid API key',
};

export const azuracastNotFoundError = {
  error: 'Not Found',
  message: 'Station not found',
};

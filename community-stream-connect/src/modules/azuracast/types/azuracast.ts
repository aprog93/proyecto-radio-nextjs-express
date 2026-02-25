/**
 * AzuraCast Module Types
 * Tipos y interfaces para integración con AzuraCast API
 */

export interface Station {
  id: number;
  name: string;
  shortcode: string;
  description: string;
  listenUrl: string;
  isPublic: boolean;
  hlsEnabled: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  art: string;
  genre?: string;
  duration: number;
}

export interface Playlist {
  id: number;
  name: string;
  type: string;
  source: string;
  isEnabled: boolean;
  songCount: number;
}

export interface NowPlaying {
  station: Station;
  nowPlaying: {
    song: Song;
    elapsed: number;
    remaining: number;
    duration: number;
  };
  playingNext?: Song;
  listeners: {
    total: number;
    unique: number;
  };
  live: {
    isLive: boolean;
    streamerName?: string;
  };
}

export interface StationInfo {
  uptime: number;
  listeners: number;
  hlsListeners: number;
  isOnline: boolean;
}

export interface PlaylistItem {
  id: number;
  playlistId: number;
  song: Song;
  weight: number;
}

export interface SongDetails extends Song {
  genre?: string;
  lyrics?: string;
  path?: string;
}

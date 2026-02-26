/**
 * Types for AzuraCast API responses
 */

export interface AzuraSong {
  id: string;
  art: string;
  text: string;
  artist: string;
  title: string;
  album: string;
  genre: string;
  lyrics: string;
}

export interface AzuraNowPlaying {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: AzuraSong;
  elapsed: number;
  remaining: number;
}

export interface AzuraListeners {
  total: number;
  unique: number;
  current: number;
}

export interface AzuraLive {
  is_live: boolean;
  streamer_name: string;
  broadcast_start: number | null;
  art: string | null;
}

export interface AzuraStation {
  id: number;
  name: string;
  shortcode: string;
  description: string;
  frontend_type: string;
  backend_type: string;
  listen_url: string;
  is_public: boolean;
  is_master_station: boolean;
}

export interface AzuraNowPlayingResponse {
  station: AzuraStation;
  listeners: AzuraListeners;
  live: AzuraLive;
  now_playing: AzuraNowPlaying;
  playing_next: AzuraNowPlaying | null;
  song_history: AzuraNowPlaying[];
}

export interface AzuraPlaylistsResponse {
  id: number;
  name: string;
  is_enabled: boolean;
  songs_count: number;
  is_jingle: boolean;
  is_request: boolean;
}

export interface AzuraPlaylistSongsResponse {
  id: number;
  song_id: string;
  playlist_id: number;
  position: number;
  weight: number;
  played_at: number;
  song: AzuraSong;
}

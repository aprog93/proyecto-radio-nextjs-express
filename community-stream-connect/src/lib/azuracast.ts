// AzuraCast API integration module
// All URLs are configurable via environment variables

export const API_BASE = import.meta.env.VITE_AZURACAST_BASE_URL || "https://demo.azuracast.com";
export const STATION_ID = import.meta.env.VITE_AZURACAST_STATION_ID || "1";
export const POLLING_INTERVAL = Number(import.meta.env.VITE_AZURACAST_POLLING_INTERVAL) || 15000;

// --- Types matching AzuraCast /api/nowplaying/{station_id} response ---

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
  frontend: string;
  backend: string;
  listen_url: string;
  url: string;
  public_player_url: string;
  playlist_pls_url: string;
  playlist_m3u_url: string;
  is_public: boolean;
  hls_enabled: boolean;
  hls_url: string | null;
  hls_listeners: number;
}

export interface AzuraSongHistory {
  sh_id: number;
  played_at: number;
  duration: number;
  playlist: string;
  streamer: string;
  is_request: boolean;
  song: AzuraSong;
}

export interface AzuraPlayingNext {
  cued_at: number;
  played_at: number;
  duration: number;
  playlist: string;
  is_request: boolean;
  song: AzuraSong;
}

export interface AzuraNowPlayingResponse {
  station: AzuraStation;
  listeners: AzuraListeners;
  live: AzuraLive;
  now_playing: AzuraNowPlaying;
  playing_next: AzuraPlayingNext | null;
  song_history: AzuraSongHistory[];
  is_online: boolean;
}

export async function fetchNowPlaying(): Promise<AzuraNowPlayingResponse> {
  const res = await fetch(`${API_BASE}/api/nowplaying/${STATION_ID}`);
  if (!res.ok) throw new Error(`AzuraCast API error: ${res.status}`);
  return res.json();
}

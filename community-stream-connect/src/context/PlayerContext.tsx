import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { fetchNowPlaying, POLLING_INTERVAL, type AzuraNowPlayingResponse, type AzuraSongHistory, type AzuraPlayingNext } from '@/lib/azuracast';

interface NowPlaying {
  title: string;
  artist: string;
  album: string;
  artUrl: string;
  listeners: number;
  isLive: boolean;
  elapsed: number;
  duration: number;
}

interface PlayerContextType {
  isPlaying: boolean;
  volume: number;
  nowPlaying: NowPlaying;
  songHistory: AzuraSongHistory[];
  playingNext: AzuraPlayingNext | null;
  streamUrl: string;
  togglePlay: () => void;
  setVolume: (v: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const defaultNowPlaying: NowPlaying = {
  title: "Conectando...",
  artist: "Proyecto Radio",
  album: "",
  artUrl: "",
  listeners: 0,
  isLive: false,
  elapsed: 0,
  duration: 0,
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.8);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying>(defaultNowPlaying);
  const [songHistory, setSongHistory] = useState<AzuraSongHistory[]>([]);
  const [playingNext, setPlayingNext] = useState<AzuraPlayingNext | null>(null);
  const [streamUrl, setStreamUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null!);

  // Poll AzuraCast API
  useEffect(() => {
    let active = true;

    const update = async () => {
      try {
        const data: AzuraNowPlayingResponse = await fetchNowPlaying();
        if (!active) return;

        setNowPlaying({
          title: data.now_playing.song.title,
          artist: data.now_playing.song.artist,
          album: data.now_playing.song.album,
          artUrl: data.now_playing.song.art,
          listeners: data.listeners.total,
          isLive: data.live.is_live,
          elapsed: data.now_playing.elapsed,
          duration: data.now_playing.duration,
        });

        setSongHistory(data.song_history);
        setPlayingNext(data.playing_next);

        // Set stream URL from station (only once or if changed)
        if (data.station.listen_url) {
          setStreamUrl((prev) => {
            if (prev !== data.station.listen_url) return data.station.listen_url;
            return prev;
          });
        }
      } catch (err) {
        console.error("Failed to fetch AzuraCast data:", err);
      }
    };

    update();
    const interval = setInterval(update, POLLING_INTERVAL);
    return () => { active = false; clearInterval(interval); };
  }, []);

  // Update audio src when streamUrl changes
  useEffect(() => {
    if (streamUrl && audioRef.current) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = streamUrl;
      if (wasPlaying) {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [streamUrl]);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  return (
    <PlayerContext.Provider value={{ isPlaying, volume, nowPlaying, songHistory, playingNext, streamUrl, togglePlay, setVolume, audioRef }}>
      <audio ref={audioRef} preload="none" />
      {children}
    </PlayerContext.Provider>
  );
};

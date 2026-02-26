/**
 * NowPlayingPage
 * Full-screen display of now-playing song with history
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { usePlayer } from '@/context/PlayerContext';
import { useAzuracastStation } from '@/modules/azuracast';
import {
  NowPlayingCard,
  SongListItem,
  StationInfoCard,
} from '@/modules/azuracast/components';
import { Progress } from '@/components/ui/progress';
import { Heart, Share2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const STATION_ID = import.meta.env.VITE_AZURACAST_STATION_ID
  ? parseInt(import.meta.env.VITE_AZURACAST_STATION_ID)
  : 1;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function NowPlayingPage() {
  const { t } = useTranslation();
  const { isPlaying, togglePlay, songHistory, nowPlaying: playerData } = usePlayer();
  const { station, nowPlaying, stationInfo, isLoading, error, refetch } =
    useAzuracastStation(STATION_ID);
  const [showHistory, setShowHistory] = useState(true);

  const progressPercent = nowPlaying?.nowPlaying.duration
    ? Math.min((nowPlaying.nowPlaying.elapsed / nowPlaying.nowPlaying.duration) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen py-24 px-4 pb-32">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Error State */}
           {error && (
             <div data-testid="error-message" className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-600">
               <p className="text-sm font-medium">{error}</p>
             </div>
           )}

          {/* Loading State */}
          {isLoading && !nowPlaying && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            </div>
          )}

          {/* Main Content */}
          {nowPlaying && (
            <>
              {/* Now Playing Section */}
              <div className="text-center">
                {/* Album Art */}
                <div className="flex justify-center mb-10">
                  <NowPlayingCard
                    nowPlaying={nowPlaying}
                    isPlaying={isPlaying}
                    size="lg"
                  />
                </div>

                {/* Song Info */}
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
                  {nowPlaying.nowPlaying.song.title}
                </h1>
                <p className="text-xl text-muted-foreground mb-2">
                  {nowPlaying.nowPlaying.song.artist}
                </p>
                {nowPlaying.nowPlaying.song.album && (
                  <p className="text-sm text-muted-foreground/70 mb-8">
                    {nowPlaying.nowPlaying.song.album}
                  </p>
                )}

                {/* Live Badge */}
                {nowPlaying.live.isLive && (
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse-slow" />
                    <span className="text-sm font-semibold text-primary">
                      {t('player.liveNow')}
                    </span>
                  </div>
                )}

                 {/* Progress Bar */}
                 {nowPlaying.nowPlaying.duration > 0 && (
                   <div className="mb-8 px-4">
                     <Progress data-testid="progress-bar" aria-label="Song progress" value={progressPercent} className="h-1.5 mb-2" />
                     <div data-testid="time-display" className="flex justify-between text-xs text-muted-foreground">
                       <span>{formatTime(nowPlaying.nowPlaying.elapsed)}</span>
                       <span>{formatTime(nowPlaying.nowPlaying.duration)}</span>
                     </div>
                   </div>
                 )}

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={togglePlay}
                    size="lg"
                    className="rounded-full w-16 h-16"
                  >
                    {isPlaying ? '⏸' : '▶'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-12 h-12"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center py-6 px-4 rounded-xl bg-secondary/30 border border-border">
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {nowPlaying.listeners.total}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('player.listeners')}
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {nowPlaying.listeners.unique}
                    </p>
                    <p className="text-xs text-muted-foreground">Unique</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">
                      {stationInfo?.isOnline ? '🟢' : '🔴'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stationInfo?.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Info */}
              <StationInfoCard
                station={station}
                stationInfo={stationInfo}
                nowPlaying={nowPlaying}
              />

               {/* Song History Section */}
               <div data-testid="history-section">
                 <div className="flex items-center justify-between mb-4">
                   <h2 className="text-2xl font-bold text-foreground">
                     {t('player.history')}
                   </h2>
                   <Button
                     variant="ghost"
                     size="sm"
                     onClick={() => refetch()}
                     className="gap-2"
                   >
                     <RotateCw className="w-4 h-4" />
                     Refresh
                   </Button>
                 </div>

                 {showHistory && songHistory.length > 0 ? (
                   <div className="space-y-2">
                     {songHistory.slice(0, 10).map((song, index) => (
                       <div data-testid="history-item" key={`${song.title}-${index}`}>
                         <SongListItem
                           song={song}
                           index={index}
                           isCurrentSong={index === 0}
                         />
                       </div>
                     ))}
                   </div>
                ) : (
                  <div className="rounded-lg bg-secondary/30 p-8 text-center">
                    <p className="text-muted-foreground">
                      {t('player.noHistory')}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

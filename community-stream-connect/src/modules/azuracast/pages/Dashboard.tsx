/**
 * Dashboard
 * Main hub showing now-playing, playlists, and quick stats
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { usePlayer } from '@/context/PlayerContext';
import { useAzuracastStation, useAzuracastPlaylist } from '@/modules/azuracast';
import {
  NowPlayingCard,
  StationInfoCard,
  PlaylistSelector,
  SongListItem,
} from '@/modules/azuracast/components';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, Radio } from 'lucide-react';

const STATION_ID = import.meta.env.VITE_AZURACAST_STATION_ID
  ? parseInt(import.meta.env.VITE_AZURACAST_STATION_ID)
  : 1;

export default function Dashboard() {
  const { t } = useTranslation();
  const { isPlaying, togglePlay, songHistory } = usePlayer();
  const { station, nowPlaying, stationInfo, isLoading: stationLoading } =
    useAzuracastStation(STATION_ID);
  const { enabledPlaylists, selectedPlaylistId, selectPlaylist, isLoading: playlistLoading } =
    useAzuracastPlaylist(STATION_ID);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen py-24 px-4 pb-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="space-y-2">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground flex items-center gap-3">
              <Radio className="w-10 h-10 text-primary" />
              {t('dashboard.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {station?.name || t('station.radio')} - Live streaming
            </p>
          </motion.div>

          {/* Now Playing Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              {t('player.nowPlaying')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card */}
              <div className="flex justify-center">
                {nowPlaying && (
                  <NowPlayingCard
                    nowPlaying={nowPlaying}
                    isPlaying={isPlaying}
                    size="md"
                  />
                )}
              </div>

              {/* Info */}
              <div className="space-y-4">
                {nowPlaying && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider font-semibold">
                        {t('common.song')}
                      </p>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {nowPlaying.nowPlaying.song.title}
                      </h3>
                      <p className="text-lg text-primary">
                        {nowPlaying.nowPlaying.song.artist}
                      </p>
                      {nowPlaying.nowPlaying.song.album && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {nowPlaying.nowPlaying.song.album}
                        </p>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">
                          {t('player.listeners')}
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {nowPlaying.listeners.total}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-primary/10">
                        <p className="text-xs text-muted-foreground mb-1">
                          Duration
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {Math.floor(nowPlaying.nowPlaying.duration / 60)}m
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button
                      onClick={togglePlay}
                      size="lg"
                      className="w-full gap-2 text-base"
                    >
                      {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </Button>
                    <Link to="/now-playing">
                      <Button variant="outline" className="w-full gap-2">
                        {t('common.viewMore')}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Station Info */}
          <motion.div variants={itemVariants}>
            {nowPlaying && (
              <StationInfoCard
                station={station}
                stationInfo={stationInfo}
                nowPlaying={nowPlaying}
              />
            )}
          </motion.div>

          {/* Playlists Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Music className="w-6 h-6 text-primary" />
                {t('playlist.available')}
              </h2>
              <Link to="/playlists">
                <Button variant="ghost" className="gap-2">
                  {t('common.browseAll')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {enabledPlaylists.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Selector */}
                <PlaylistSelector
                  playlists={enabledPlaylists}
                  enabledPlaylists={enabledPlaylists}
                  selectedPlaylistId={selectedPlaylistId}
                  onSelectPlaylist={selectPlaylist}
                  isLoading={playlistLoading}
                />

           {/* Recent Songs */}
           <div data-testid="history-section" className="rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border p-6">
             <h3 className="text-lg font-bold text-foreground mb-4">
               {t('player.recentTracks')}
             </h3>
             {songHistory.length > 0 ? (
               <div className="space-y-2">
                 {songHistory.slice(0, 5).map((song, index) => (
                   <div data-testid="history-item" key={`${song.title}-${index}`}>
                     <SongListItem
                       song={song}
                       index={index}
                       showArt={false}
                     />
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-8">
                 {t('player.noHistory')}
               </p>
             )}
           </div>
              </div>
            ) : (
              <div className="rounded-lg bg-secondary/20 border border-border p-8 text-center">
                {playlistLoading ? (
                  <>
                    <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">{t('playlist.notFound')}</p>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Link to="/programs">
              <Button variant="outline" className="w-full justify-start text-base">
                📻 {t('nav.programs')}
              </Button>
            </Link>
            <Link to="/schedule">
              <Button variant="outline" className="w-full justify-start text-base">
                🕒 {t('nav.schedule')}
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

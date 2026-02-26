/**
 * PlaylistSelector Component
 * Allows selecting and viewing playlists
 */

import { Music, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Playlist } from '@/modules/azuracast';

export interface PlaylistSelectorProps {
  playlists: Playlist[];
  enabledPlaylists: Playlist[];
  selectedPlaylistId: number | null;
  onSelectPlaylist: (playlistId: number) => void;
  isLoading?: boolean;
}

export const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  playlists,
  enabledPlaylists,
  selectedPlaylistId,
  onSelectPlaylist,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);

  const displayPlaylists = showAll ? playlists : enabledPlaylists;

  if (playlists.length === 0) {
    return (
      <div className="rounded-2xl bg-secondary/50 border border-border p-8 text-center">
        <Music className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">{t('playlist.notFound')}</p>
      </div>
    );
  }

  return (
    <motion.div
      data-testid="playlist-selector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          {t('playlist.title')}
        </h3>
        {playlists.length > enabledPlaylists.length && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? t('common.showLess') : t('common.showAll')}
          </Button>
        )}
      </div>

      {/* Playlists Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
           {displayPlaylists.map((playlist, index) => (
             <motion.button
               key={playlist.id}
               data-testid="playlist-card"
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ delay: index * 0.05 }}
               onClick={() => onSelectPlaylist(playlist.id)}
               disabled={isLoading}
               className={`p-4 rounded-xl text-left transition-all group ${
                 selectedPlaylistId === playlist.id
                   ? 'bg-primary/20 border border-primary/40 shadow-md'
                   : 'bg-background/40 border border-border hover:border-primary/40 hover:bg-background/60'
               } disabled:opacity-50 disabled:cursor-not-allowed`}
             >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {playlist.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {playlist.songCount} {t('playlist.songs')}
                  </p>
                  {!playlist.isEnabled && (
                    <span className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-1">
                      {t('playlist.disabled')}
                    </span>
                  )}
                </div>
                <ChevronRight
                  className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-1 ${
                    selectedPlaylistId === playlist.id ? 'text-primary' : ''
                  }`}
                />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {enabledPlaylists.length} {t('playlist.enabledCount')}
        </span>
        <span>{playlists.reduce((acc, p) => acc + p.songCount, 0)} total songs</span>
      </div>
    </motion.div>
  );
};

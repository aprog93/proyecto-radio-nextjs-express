/**
 * NowPlayingCard Component
 * Displays current playing song with artwork and basic info
 * Used in multiple pages and dashboard
 */

import { Radio, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { NowPlaying } from '@/modules/azuracast';

export interface NowPlayingCardProps {
  nowPlaying: NowPlaying | null;
  isPlaying?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const NowPlayingCard: React.FC<NowPlayingCardProps> = ({
  nowPlaying,
  isPlaying = false,
  size = 'md',
  onClick,
}) => {
  const { t } = useTranslation();

  if (!nowPlaying) {
    return (
      <div className="flex items-center justify-center h-64 rounded-2xl bg-secondary/50 border border-border">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="text-sm text-muted-foreground">{t('player.noSong')}</p>
        </div>
      </div>
    );
  }

  const sizeClass = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-80 h-80',
  }[size];

  const song = nowPlaying.nowPlaying.song;

  return (
    <motion.div
      data-testid="now-playing-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`relative ${sizeClass} rounded-3xl bg-secondary flex items-center justify-center overflow-hidden cursor-pointer transition-transform hover:scale-105 ${onClick ? 'hover:shadow-lg' : ''}`}
      style={onClick ? { boxShadow: 'var(--shadow-glow)' } : {}}
    >
      {/* Album Art */}
      {song.art ? (
        <img
          data-testid="album-art"
          src={song.art}
          alt={song.title}
          className="w-full h-full object-cover"
        />
      ) : (
        <Radio className={`text-primary/40 opacity-50 ${size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-16 h-16' : 'w-20 h-20'}`} />
      )}

      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-1 bg-primary rounded-full animate-equalizer"
              style={{ animationDelay: `${i * 0.15}s`, height: `${8 + i * 2}px` }}
            />
          ))}
        </div>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity" />
    </motion.div>
  );
};

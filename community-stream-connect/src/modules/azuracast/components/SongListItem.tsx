/**
 * SongListItem Component
 * Reusable row for displaying a song in lists
 */

import { Music, Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Song } from '@/modules/azuracast';

export interface SongListItemProps {
  song: Song;
  index?: number;
  onPlay?: () => void;
  onRequest?: () => void;
  showArt?: boolean;
  isCurrentSong?: boolean;
}

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const SongListItem: React.FC<SongListItemProps> = ({
  song,
  index,
  onPlay,
  onRequest,
  showArt = true,
  isCurrentSong = false,
}) => {
  return (
    <motion.div
      data-testid="song-list-item"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
        isCurrentSong
          ? 'bg-primary/10 border border-primary/20'
          : 'hover:bg-secondary/50'
      }`}
    >
      {/* Index or play button */}
      {index !== undefined && (
        <span className="text-sm font-semibold text-muted-foreground min-w-[1.5rem]">
          {index + 1}
        </span>
      )}

      {/* Album art or placeholder */}
      {showArt && (
        <div
          data-testid="album-art"
          className="w-12 h-12 rounded-md bg-secondary flex-shrink-0 flex items-center justify-center overflow-hidden"
        >
          {song.art ? (
            <img src={song.art} alt={song.title} className="w-full h-full object-cover" />
          ) : (
            <Music className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      )}

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{song.title}</p>
        <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
        {song.album && (
          <p className="text-xs text-muted-foreground/70 truncate">{song.album}</p>
        )}
      </div>

      {/* Genre and duration */}
      {song.genre && (
        <span className="hidden sm:inline text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
          {song.genre}
        </span>
      )}

      {song.duration > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(song.duration)}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {onPlay && (
          <button
            onClick={onPlay}
            className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground flex items-center justify-center transition-colors"
            title="Play"
          >
            <Play className="w-4 h-4 ml-0.5" />
          </button>
        )}
        {onRequest && (
          <button
            data-testid="request-button"
            onClick={onRequest}
            className="px-3 py-1.5 rounded-md text-xs font-medium bg-secondary hover:bg-primary/20 text-foreground transition-colors"
          >
            Request
          </button>
        )}
      </div>
    </motion.div>
  );
};

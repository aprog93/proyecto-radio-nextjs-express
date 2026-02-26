/**
 * PlaylistsPage
 * Browse and manage playlists with song listing
 */

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAzuracastPlaylist } from '@/modules/azuracast';
import { PlaylistSelector, SongListItem } from '@/modules/azuracast/components';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';

const STATION_ID = import.meta.env.VITE_AZURACAST_STATION_ID
  ? parseInt(import.meta.env.VITE_AZURACAST_STATION_ID)
  : 1;

export default function PlaylistsPage() {
  const { t } = useTranslation();
  const {
    playlists,
    enabledPlaylists,
    currentPlaylistSongs,
    selectedPlaylistId,
    isLoading,
    error,
    selectPlaylist,
    refetch,
  } = useAzuracastPlaylist(STATION_ID);

  const selectedPlaylist = playlists.find((p) => p.id === selectedPlaylistId);

  return (
    <div className="min-h-screen py-24 px-4 pb-32">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              {t('playlist.browsePlaylists')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {playlists.length} {t('playlist.available')}
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-red-600">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && playlists.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">{t('common.loading')}</p>
              </div>
            </div>
          )}

           {/* Main Content */}
           {playlists.length > 0 && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Playlist List - Sidebar */}
               <div data-testid="playlists-container" className="lg:col-span-1">
                 <PlaylistSelector
                   playlists={playlists}
                   enabledPlaylists={enabledPlaylists}
                   selectedPlaylistId={selectedPlaylistId}
                   onSelectPlaylist={selectPlaylist}
                   isLoading={isLoading}
                 />
               </div>

               {/* Songs List - Main */}
               <div data-testid="songs-container" className="lg:col-span-2">
                 {selectedPlaylistId ? (
                   <motion.div
                     key={selectedPlaylistId}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="space-y-4"
                   >
                     {/* Playlist Header */}
                     <div className="flex items-start justify-between mb-6">
                       <div>
                         <h2 className="text-2xl font-bold text-foreground">
                           {selectedPlaylist?.name}
                         </h2>
                         <p className="text-sm text-muted-foreground mt-1">
                           {currentPlaylistSongs.length} {t('playlist.songs')}
                         </p>
                       </div>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => refetch()}
                         className="gap-2"
                       >
                         <RotateCw className="w-4 h-4" />
                         Refresh
                       </Button>
                     </div>

                     {/* Songs List */}
                     {currentPlaylistSongs.length > 0 ? (
                       <div className="space-y-2 rounded-lg border border-border/50 p-4 bg-secondary/10">
                         {currentPlaylistSongs.map((item, index) => (
                           <div data-testid="song-list-item" key={`${item.song.id}-${index}`}>
                             <SongListItem
                               song={item.song}
                               index={index}
                               showArt={true}
                             />
                           </div>
                         ))}
                       </div>
                     ) : isLoading ? (
                       <div
                         data-testid="song-list-skeleton"
                         className="flex items-center justify-center h-64 rounded-lg bg-secondary/20 border border-border"
                       >
                         <div className="text-center">
                           <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
                           <p className="text-sm text-muted-foreground">
                             {t('common.loading')}
                           </p>
                         </div>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-64 rounded-lg bg-secondary/20 border border-border">
                         <p className="text-muted-foreground">
                           {t('playlist.noSongs')}
                         </p>
                       </div>
                     )}
                   </motion.div>
                 ) : (
                   <div className="flex items-center justify-center h-96 rounded-lg border-2 border-dashed border-border bg-secondary/10">
                     <p className="text-center text-muted-foreground">
                       {t('playlist.selectOne')}
                     </p>
                   </div>
                 )}
               </div>
             </div>
           )}

          {/* Empty State */}
          {playlists.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-96 rounded-lg bg-secondary/20 border border-border">
              <div className="text-center">
                <p className="text-lg text-muted-foreground mb-4">
                  {error || t('playlist.notFound')}
                </p>
                <Button onClick={() => refetch()}>
                  {t('common.tryAgain')}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

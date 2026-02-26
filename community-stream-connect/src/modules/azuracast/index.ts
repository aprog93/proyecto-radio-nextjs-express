/**
 * AzuraCast Module - Public API
 * Complete integration with AzuraCast radio streaming API
 *
 * Usage:
 * import { useAzuracastStation, stationService } from '@/modules/azuracast';
 * import { Dashboard, NowPlayingPage } from '@/modules/azuracast';
 */

// Hooks
export { useAzuracastStation } from './hooks/useAzuracastStation';
export { useAzuracastPlaylist } from './hooks/useAzuracastPlaylist';
export type {
  UseAzuracastStationReturn,
} from './hooks/useAzuracastStation';
export type {
  UseAzuracastPlaylistReturn,
} from './hooks/useAzuracastPlaylist';

// Services
export {
  stationService,
  playlistService,
  historyService,
  type ApiResponse,
} from './services';

// Types
export type {
  Station,
  Song,
  Playlist,
  NowPlaying,
  StationInfo,
  PlaylistItem,
  SongDetails,
} from './types/azuracast';

// Components
export {
  NowPlayingCard,
  SongListItem,
  StationInfoCard,
  PlaylistSelector,
} from './components';
export type {
  NowPlayingCardProps,
  SongListItemProps,
  StationInfoCardProps,
  PlaylistSelectorProps,
} from './components';

// Pages
export { Dashboard, NowPlayingPage, PlaylistsPage } from './pages';

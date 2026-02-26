/**
 * Station routes - AzuraCast API proxy
 */

import { Router, Request, Response } from 'express';
import { AzuraCastService } from '../services/azuracast.js';
import { success, error } from '../types/api.js';

const router: Router = Router();

/**
 * GET /api/station/now-playing
 * Get current playing track and metadata
 */
router.get('/now-playing', async (req: Request, res: Response) => {
  try {
    const data = await AzuraCastService.getNowPlaying();
    res.json(success(data));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch now playing';
    res.status(500).json(error(msg));
  }
});

/**
 * GET /api/station/playlists
 * Get all playlists
 */
router.get('/playlists', async (req: Request, res: Response) => {
  try {
    const data = await AzuraCastService.getPlaylists();
    res.json(success(data));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch playlists';
    res.status(500).json(error(msg));
  }
});

/**
 * GET /api/station/playlists/:playlistId/songs
 * Get songs from playlist
 */
router.get('/playlists/:playlistId/songs', async (req: Request, res: Response) => {
  try {
    const playlistId = parseInt(req.params.playlistId, 10);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    if (isNaN(playlistId)) {
      res.status(400).json(error('Invalid playlist ID'));
      return;
    }

    const data = await AzuraCastService.getPlaylistSongs(playlistId, limit, offset);
    res.json(success(data));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch playlist songs';
    res.status(500).json(error(msg));
  }
});

/**
 * POST /api/station/requests
 * Request a song (requires auth)
 */
router.post('/requests', async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      res.status(401).json(error('Authentication required'));
      return;
    }

    const { songId } = req.body;
    if (!songId) {
      res.status(400).json(error('Missing songId'));
      return;
    }

    const data = await AzuraCastService.requestSong(songId);
    res.json(success(data));
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to request song';
    res.status(500).json(error(msg));
  }
});

export default router;

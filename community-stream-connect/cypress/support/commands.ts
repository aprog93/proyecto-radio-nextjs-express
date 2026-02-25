// cypress/support/commands.ts
import { NowPlayingResponse, Station } from '@/modules/azuracast/types/azuracast';

// Mock station data for E2E tests
const mockStation: Station = {
  id: 1,
  name: 'Radio César',
  url: 'http://localhost:8000',
  listen_url: 'http://localhost:8000/live',
  public_player_url: 'http://localhost:8000/player',
  timezone: 'America/Argentina/Buenos_Aires',
  frontend_type: 'shoutcast',
  is_enabled: true,
};

const mockNowPlaying: NowPlayingResponse = {
  station: mockStation,
  listeners: {
    current: 42,
    unique: 35,
    total: 150,
  },
  now_playing: {
    song: {
      id: 'song-1',
      text: 'The Beatles - Let It Be',
      artist: 'The Beatles',
      title: 'Let It Be',
      duration: 240,
      genre: 'Rock',
      album: 'Let It Be',
      isrc: null,
      lyrics: null,
    },
    duration: 240,
    playlist: 'Main Playlist',
    streamer: null,
    is_request: false,
    elapsed: 120,
    remaining: 120,
  },
  playing_next: {
    song: {
      id: 'song-2',
      text: 'Queen - Bohemian Rhapsody',
      artist: 'Queen',
      title: 'Bohemian Rhapsody',
      duration: 354,
      genre: 'Rock',
      album: 'A Night at the Opera',
      isrc: null,
      lyrics: null,
    },
  },
  song_history: [
    {
      played_at: Math.floor(Date.now() / 1000) - 300,
      duration: 200,
      playlist: 'Main Playlist',
      song: {
        id: 'song-3',
        text: 'Pink Floyd - Wish You Were Here',
        artist: 'Pink Floyd',
        title: 'Wish You Were Here',
        duration: 200,
        genre: 'Rock',
        album: 'Wish You Were Here',
        isrc: null,
        lyrics: null,
      },
      is_request: false,
    },
  ],
};

Cypress.Commands.add('interceptAzuracastApi', () => {
  // Intercept GET /stations
  cy.intercept('GET', '/api/stations', {
    body: [
      {
        id: 1,
        name: 'Radio César',
        url: 'http://localhost:8000',
        listen_url: 'http://localhost:8000/live',
        public_player_url: 'http://localhost:8000/player',
        timezone: 'America/Argentina/Buenos_Aires',
        frontend_type: 'shoutcast',
        is_enabled: true,
      },
    ],
  }).as('getStations');

  // Intercept GET /nowplaying/{id}
  cy.intercept('GET', '/api/nowplaying/1', mockNowPlaying).as('getNowPlaying');

  // Intercept GET /stations/{id}/playlists
  cy.intercept('GET', '/api/stations/1/playlists', {
    body: [
      {
        id: 1,
        name: 'Main Playlist',
        type: 'default',
        remote_url: null,
        remote_type: null,
        is_enabled: true,
        include_in_automation: false,
        weight: 0,
        plays_per_hour: null,
        interrupt_other_songs: false,
        format: 'mp3',
        backend: 'local',
        uri: '/stations/1/playlist/1',
      },
      {
        id: 2,
        name: 'Top Hits',
        type: 'default',
        remote_url: null,
        remote_type: null,
        is_enabled: true,
        include_in_automation: false,
        weight: 0,
        plays_per_hour: null,
        interrupt_other_songs: false,
        format: 'mp3',
        backend: 'local',
        uri: '/stations/1/playlist/2',
      },
    ],
  }).as('getPlaylists');

  // Intercept GET /stations/{id}/playlist/{id}/songs
  cy.intercept('GET', '/api/stations/1/playlist/*/songs**', {
    body: [
      {
        id: 1,
        text: 'The Beatles - Let It Be',
        artist: 'The Beatles',
        title: 'Let It Be',
        album: 'Let It Be',
        duration: 240,
        genre: 'Rock',
        is_requestable: true,
      },
      {
        id: 2,
        text: 'Queen - Bohemian Rhapsody',
        artist: 'Queen',
        title: 'Bohemian Rhapsody',
        album: 'A Night at the Opera',
        duration: 354,
        genre: 'Rock',
        is_requestable: true,
      },
      {
        id: 3,
        text: 'Pink Floyd - Wish You Were Here',
        artist: 'Pink Floyd',
        title: 'Wish You Were Here',
        album: 'Wish You Were Here',
        duration: 200,
        genre: 'Rock',
        is_requestable: true,
      },
    ],
  }).as('getPlaylistSongs');

  // Intercept POST /request (song request)
  cy.intercept('POST', '/api/stations/1/request/*', {
    statusCode: 200,
    body: { success: true },
  }).as('requestSong');
});

declare global {
  namespace Cypress {
    interface Chainable {
      interceptAzuracastApi(): Chainable<void>;
    }
  }
}

export {};

# 🎙️ Radio Cesar Backend Service

BFF (Backend for Frontend) Express.js + TypeScript para Proyecto Radio Cesar.

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file
cp .env.example .env

# 3. Start development server
pnpm run dev

# Server will start on http://localhost:3000
```

## Available Scripts

```bash
pnpm run dev         # Start dev server (auto-reload)
pnpm run build       # Compile TypeScript
pnpm run start       # Run production build
pnpm run test        # Run tests
pnpm run test:watch  # Watch mode
pnpm run lint        # ESLint check
```

## API Endpoints

### Station (AzuraCast Proxy)
- `GET  /api/station/now-playing` - Current playing track
- `GET  /api/station/playlists` - List all playlists
- `GET  /api/station/playlists/:id/songs` - Songs in playlist
- `POST /api/station/requests` - Request a song (auth required)

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET  /api/auth/me` - Current user (auth required)

### Health
- `GET /health` - Server health
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe

## Environment Variables

See `.env.example` for complete list. Key ones:

```
AZURACAST_BASE_URL    # AzuraCast API URL
AZURACAST_STATION_ID  # Station ID
CORS_ORIGIN           # Frontend URL (http://localhost:5173)
JWT_SECRET            # Secret for JWT signing
```

## Architecture

```
Express Server
├── Middleware (CORS, Auth, Error handling)
├── Routes
│   ├── Health checks
│   ├── Station (AzuraCast proxy)
│   └── Auth
├── Services
│   ├── AzuraCast API client
│   └── Token generation
└── Utils
    ├── Cache
    └── Response formatting
```

## Testing

```bash
# Run all tests
pnpm run test

# Run specific file
npx vitest run src/__tests__/lib/cache.test.ts

# Watch mode
pnpm run test:watch
```

**Coverage:** 13 tests (100% passing)

## Docker

```bash
# Build
docker build -t radio-cesar-backend .

# Run
docker run -p 3000:3000 -e AZURACAST_BASE_URL=... radio-cesar-backend
```

## Development Notes

- **TypeScript:** Strict mode enabled
- **Code style:** 2-space indentation, single quotes
- **Port:** 3000 (configurable via PORT env var)
- **Cache:** In-memory with TTL (60s default)
- **Logging:** Console (ready for Winston integration)

## File Structure

```
src/
├── config/           # Environment & Supabase setup
├── lib/              # Utilities (cache, etc)
├── middleware/       # Express middleware
├── routes/           # API endpoints
├── services/         # Business logic
├── types/            # TypeScript interfaces
├── __tests__/        # Unit tests
├── app.ts            # Express app
└── index.ts          # Server entry point
```

See `FASE_1_BACKEND_RESUMEN.md` for detailed documentation.

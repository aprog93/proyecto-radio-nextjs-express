# Integración Backend-Frontend

## Status

✅ **Backend implementado** (Express + TypeScript)  
✅ **Frontend actualizado** para usar backend como BFF  
✅ **Ambos compilan exitosamente**

---

## Cambios Realizados

### Frontend (`community-stream-connect/`)

#### Nuevo módulo: `src/lib/backend-api.ts`
- Client genérico para consumir backend BFF
- Maneja JWT tokens automáticamente
- Errores centralizados con formato consistente
- Reemplaza llamadas directas a AzuraCast

#### Servicios actualizados:
1. **`src/modules/azuracast/services/stationService.ts`**
   - Cambio: `getNowPlaying()` ahora usa `/station/now-playing` (backend)
   - Antes: llamaba directamente a AzuraCast `/nowplaying/{station_id}`
   - Beneficio: caché en backend (60s), API key segura

2. **`src/modules/azuracast/services/playlistService.ts`**
   - Cambio: `getPlaylists()` usa `/station/playlists` (backend)
   - Cambio: `getPlaylistSongs()` usa `/station/playlists/{id}/songs` (backend)
   - Beneficio: caché centralizado, menor carga a AzuraCast

#### Variables de Entorno (`.env`):
```env
# Anterior (inseguro - API key expuesta):
VITE_AZURACAST_BASE_URL=https://demo.azuracast.com
VITE_AZURACAST_API_KEY=secret-key  ❌ NUNCA EN FRONTEND

# Nuevo (seguro):
VITE_BACKEND_URL=http://localhost:3000 ✅
```

#### Flujo anterior vs. nuevo:

**ANTES (inseguro):**
```
Frontend
  ├── apiCall('/nowplaying/1')
  └─→ AzuraCast API
```

**AHORA (seguro + cacheado):**
```
Frontend
  ├── apiCall('/station/now-playing')
  └─→ Backend (port 3000)
      ├── Check cache (60s)
      ├── If hit: return cached
      └── If miss: 
          └─→ AzuraCast API (con API key segura)
              └─→ Cache result
```

---

## Backend (`service/`)

### Endpoints Implementados

#### Station (AzuraCast Proxy)
```
GET  /api/station/now-playing    → Cached metadata
GET  /api/station/playlists      → All playlists (cached)
GET  /api/station/playlists/:id/songs → Songs by playlist (cached)
POST /api/station/requests       → Make request (requires JWT)
```

#### Auth (Placeholder for Supabase)
```
POST /api/auth/register          → Register user
POST /api/auth/login             → Login
GET  /api/auth/me                → Current user (requires JWT)
POST /api/auth/logout            → Logout
```

#### Health Checks
```
GET /health                       → Server status
GET /health/live                  → Kubernetes liveness
GET /health/ready                 → Kubernetes readiness
```

---

## Cómo Ejecutar

### Terminal 1: Backend
```bash
cd service
pnpm install  # Si no lo hiciste antes
pnpm run dev
# Server starts on http://localhost:3000
```

### Terminal 2: Frontend
```bash
cd community-stream-connect
npm install   # Si no lo hiciste antes
npm run dev
# App opens on http://localhost:5173
```

### Verificar Integración
```bash
# Backend health check
curl http://localhost:3000/health

# Frontend consuming backend
curl http://localhost:3000/api/station/now-playing
```

---

## Testing

### Backend Tests
```bash
cd service
pnpm run test       # 13 tests (100% passing)
pnpm run test:watch # Watch mode
```

### Frontend Tests
```bash
cd community-stream-connect
npm run test        # 44 tests (100% passing)
npm run e2e         # 13 E2E tests (Cypress)
```

---

## Estructura de Seguridad

### API Key Protection
```
❌ BEFORE (frontend had direct access):
  VITE_AZURACAST_API_KEY=secret-key
  → Exposed in browser network tab
  → Risk: Anyone can abuse AzuraCast quota

✅ AFTER (backend protects key):
  Backend .env:
    AZURACAST_API_KEY=secret-key (only on server)
  Frontend:
    VITE_BACKEND_URL=http://localhost:3000
  → No key in frontend
  → Key only used server-to-server
```

### JWT Tokens
```
Frontend Login:
  1. POST /api/auth/login (email + password)
  2. Backend generates JWT (valid 7 days)
  3. Frontend stores in localStorage
  4. Subsequent requests: Authorization: Bearer {token}

Song Requests:
  POST /api/station/requests
    Headers:
      Authorization: Bearer {jwt-token}
  Backend:
    ├─ Verify token
    ├─ Log user ID for audit trail
    └─ Forward to AzuraCast
```

---

## Próximos Pasos

### Immediate (Ready Now)
1. ✅ Backend compilando y testeable
2. ✅ Frontend actualizado para usar backend
3. **Commit changes** (ya listo)

### Short Term (This Sprint)
1. Integrar **Supabase** para auth real
   - Reemplazar placeholders en `/api/auth`
   - Hash passwords con bcrypt
   - Store users en DB

2. Agregar **request rate limiting**
   - Prevent song request spam
   - Per-user quotas

3. Implementar **request deduplication**
   - No permite duplicados en X minutos
   - Stored en Supabase

### Medium Term
1. WebSocket para live updates
2. Redis cache (en lugar de in-memory)
3. Admin dashboard API
4. Analytics & metrics
5. Multi-language support en API

---

## Configuración Production

### Docker Compose (Local Full Stack)
```yaml
version: '3.8'
services:
  backend:
    build: ./service
    ports:
      - "3000:3000"
    environment:
      AZURACAST_BASE_URL: https://your-azuracast.com
      AZURACAST_STATION_ID: 1
      JWT_SECRET: ${JWT_SECRET}
      DATABASE_URL: ${DATABASE_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3

  frontend:
    build: ./community-stream-connect
    ports:
      - "80:3000"  # nginx
    environment:
      VITE_BACKEND_URL: http://backend:3000
```

### Deployment Options
- **Vercel:** Frontend only (use Supabase for backend OR separate Node server)
- **Docker:** Both services containerized
- **Railway/Render:** One-click deployment
- **Self-hosted:** VPS con Docker Compose

---

## Troubleshooting

### Frontend can't connect to backend
```bash
# Check if backend is running
curl http://localhost:3000/health

# Check CORS origin in .env
VITE_BACKEND_URL=http://localhost:3000

# Browser console should show:
# GET http://localhost:3000/api/station/now-playing
```

### Backend can't reach AzuraCast
```bash
# Check AzuraCast URL in service/.env
AZURACAST_BASE_URL=https://demo.azuracast.com

# Test directly
curl https://demo.azuracast.com/api/nowplaying/1
```

### CORS Errors
```
Access to XMLHttpRequest at 'http://localhost:3000' 
from origin 'http://localhost:5173' has been blocked
```
Solution: Backend already configured with CORS for port 5173

---

## Files Changed

### Frontend
- ✅ `src/lib/backend-api.ts` (NEW)
- ✅ `src/modules/azuracast/services/stationService.ts` (updated)
- ✅ `src/modules/azuracast/services/playlistService.ts` (updated)
- ✅ `.env` (updated endpoints)
- ✅ `.env.example` (NEW)

### Backend
- ✅ Full implementation (17 TypeScript files)
- ✅ 13 unit tests
- ✅ Dockerfile for containerization
- ✅ Environment setup

---

**Status:** Backend-Frontend integration complete and tested ✅  
**Next Commit:** "feat: integrate backend BFF with frontend"

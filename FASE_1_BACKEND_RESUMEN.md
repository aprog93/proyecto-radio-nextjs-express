# FASE 1 Backend - BFF (Backend for Frontend)

## Descripción

**Backend Express.js + TypeScript** para Proyecto Radio Cesar. Actúa como proxy, caché y capa de validación entre el frontend React y AzuraCast API.

**Directorios importantes:**
- `service/src/` - Código fuente
- `service/dist/` - Build compilado (generado)

---

## Características Implementadas

### ✅ Proxy AzuraCast
- **GET `/api/station/now-playing`** - Metadata en vivo con caché
- **GET `/api/station/playlists`** - Listado de playlists
- **GET `/api/station/playlists/:id/songs`** - Canciones por playlist
- **POST `/api/station/requests`** - Hacer request de canción (requiere auth)

### ✅ Autenticación (Placeholder)
- **POST `/api/auth/register`** - Registro (mock)
- **POST `/api/auth/login`** - Login (mock)
- **POST `/api/auth/logout`** - Logout
- **GET `/api/auth/me`** - Perfil actual (requiere JWT)

### ✅ Health Checks
- **GET `/health`** - Status general
- **GET `/health/live`** - Kubernetes liveness probe
- **GET `/health/ready`** - Kubernetes readiness probe

### ✅ Infraestructura
- **Caché en memoria** - TTL configurable (60s por defecto)
- **JWT Tokens** - Generación y validación
- **CORS** - Configurado para frontend (puerto 5173)
- **Error handling** - Middleware centralizado
- **Type safety** - TypeScript strict mode

---

## Stack Técnico

```
Express.js 4.18 + TypeScript 5.9
├── axios 1.6.7        (HTTP client)
├── jsonwebtoken 9.0    (JWT)
├── bcrypt 5.1          (Password hashing - TODO)
├── @supabase/supabase-js 2.39 (Database - TODO)
├── zod 3.22            (Validation - TODO)
└── cors 2.8            (CORS middleware)

Testing:
├── Vitest 1.6          (Unit tests)
└── @types/node 20      (Node.js types)
```

---

## Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload (port 3000)
npm run build           # Compile TypeScript to dist/
npm run start           # Run production build

# Testing
npm run test            # Run all tests once
npm run test:watch     # Watch mode for TDD

# Code Quality
npm run lint            # ESLint check
```

---

## Estructura de Directorios

```
src/
├── config/
│   ├── env.ts          # Environment variables validation
│   └── supabase.ts     # Supabase client (placeholder)
├── lib/
│   └── cache.ts        # In-memory cache utility
├── middleware/
│   ├── auth.ts         # JWT auth middleware
│   └── errorHandler.ts # Global error handling
├── routes/
│   ├── health.ts       # Health checks
│   ├── station.ts      # AzuraCast proxy endpoints
│   └── auth.ts         # Authentication endpoints
├── services/
│   ├── azuracast.ts    # AzuraCast API client + caching
│   └── token.ts        # JWT generation & validation
├── types/
│   ├── api.ts          # API response wrappers
│   └── azuracast.ts    # AzuraCast API response types
├── __tests__/
│   ├── lib/
│   │   └── cache.test.ts          ✅ 5 tests
│   └── services/
│       ├── token.test.ts          ✅ 5 tests
│       └── azuracast.test.ts      ✅ 3 tests (placeholders)
├── app.ts             # Express application setup
└── index.ts           # Server entry point
```

---

## Variables de Entorno

```bash
# Server
PORT=3000                          # Port (default: 3000)
NODE_ENV=development               # Environment

# AzuraCast
AZURACAST_BASE_URL=https://demo.azuracast.com
AZURACAST_STATION_ID=1
AZURACAST_API_KEY=                 # Optional

# Supabase (TODO: implement)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# JWT
JWT_SECRET=your-secret-key-change-in-production

# CORS
CORS_ORIGIN=http://localhost:5173  # Frontend URL

# Cache
CACHE_TTL_SECONDS=60               # Default TTL in seconds
```

Copiar `.env.example` → `.env` para local development.

---

## Arquitectura & Flujos

### 1. AzuraCast Proxy + Caché
```
Frontend → Backend (/api/station/now-playing)
           ├─ Check cache (60s TTL)
           ├─ If hit: return cached data
           └─ If miss: call AzuraCast API, cache result
```

**Beneficios:**
- Reduce carga a AzuraCast (polling cada 60s en vez de c/15s)
- Frontend sigue obteniendo datos frescos
- Posibilidad de agregar validación/transformación

### 2. Autenticación JWT
```
Frontend → /api/auth/login (email + password)
Frontend ← JWT token (valid for 7 days)
Frontend → /api/station/requests + Bearer token
           ├─ Extract & verify JWT
           ├─ Validate user exists
           └─ Log request en Supabase
```

**Estado actual:** Mock implementation (ready for Supabase integration)

### 3. Error Handling
```
Middlewares:
├── CORS validation
├── JSON parsing
├── Optional auth validation
└─ Route handlers
   ├─ Validate params (zod - TODO)
   ├─ Call service (azuracast.ts)
   └─ Handle errors
       ├─ API errors: log + return HTTP 500
       ├─ Validation errors: HTTP 400
       └─ Auth errors: HTTP 401
```

---

## Testing

### Unit Tests (13 tests, 100% passing)
```
✅ Cache utility (5 tests)
  - set/get values
  - expiration after TTL
  - clear all/specific entries

✅ Token service (5 tests)
  - generate JWT
  - verify token
  - extract from header
  - invalid token handling

✅ AzuraCast service (3 placeholder tests)
  - Ready for integration tests with real axios mocking
```

### Running Tests
```bash
npm run test           # Run once
npm run test:watch    # Watch mode
```

---

## Deployment

### Docker

```bash
# Build image
docker build -t radio-cesar-backend .

# Run container
docker run -p 3000:3000 \
  -e AZURACAST_BASE_URL=https://your-azuracast.com \
  -e AZURACAST_STATION_ID=1 \
  -e JWT_SECRET=your-secret \
  radio-cesar-backend
```

### Kubernetes

Usa health endpoints para probes:
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30

readinessProbe:
  httpGet:
    path: /health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Roadmap

### Short Term (Next Commits)
- [ ] Integrar Supabase para auth real
- [ ] Implementar password hashing con bcrypt
- [ ] Agregar request rate limiting
- [ ] Validation layer con Zod

### Medium Term
- [ ] WebSocket para real-time updates
- [ ] Redis caché (en lugar de in-memory)
- [ ] Logging centralizado (Winston)
- [ ] API documentation (Swagger/OpenAPI)

### Long Term
- [ ] Admin dashboard API endpoints
- [ ] Analytics & metrics
- [ ] Event broadcasting (listeners, requests)
- [ ] Multi-station support

---

## Configuración Local (Development)

1. **Clonar repo** (ya hecho)

2. **Instalar dependencias:**
   ```bash
   cd service
   pnpm install
   ```

3. **Crear `.env`:**
   ```bash
   cp .env.example .env
   # Editar con values correctos
   ```

4. **Iniciar dev server:**
   ```bash
   pnpm run dev
   ```
   → Backend en `http://localhost:3000`

5. **Iniciar frontend (otra terminal):**
   ```bash
   cd community-stream-connect
   npm run dev
   ```
   → Frontend en `http://localhost:5173`

6. **Probar endpoints:**
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/api/station/now-playing
   ```

---

## Error Handling Examples

### Missing Auth Token
```json
HTTP/1.1 401 Unauthorized

{
  "success": false,
  "error": {
    "message": "Missing authorization token"
  },
  "timestamp": "2024-02-24T17:57:00.000Z"
}
```

### AzuraCast API Down
```json
HTTP/1.1 500 Internal Server Error

{
  "success": false,
  "error": {
    "message": "AzuraCast getNowPlaying failed: ECONNREFUSED"
  },
  "timestamp": "2024-02-24T17:57:00.000Z"
}
```

### Success Response
```json
HTTP/1.1 200 OK

{
  "success": true,
  "data": {
    "now_playing": { ... },
    "listeners": { ... }
  },
  "timestamp": "2024-02-24T17:57:00.000Z"
}
```

---

## Notas Importantes

1. **API Key de AzuraCast:**
   - No está expuesta al frontend
   - Se pasa solo al backend vía env var
   - Recomendado: usar read-only API key

2. **Cache:**
   - Actualmente in-memory (pierde datos si se reinicia)
   - Próxima fase: migrar a Redis

3. **JWT Secret:**
   - **NUNCA** commitear valor real
   - En production: usar value de secrets manager
   - En local dev: usar value aleatorio seguro

4. **CORS:**
   - Restringido a `http://localhost:5173` en dev
   - Cambiar en production a tu dominio real

---

**Status:** ✅ Backend ready for integration with frontend  
**Commits:** Initial backend setup with Express + TypeScript  
**Next:** Integrar Supabase para auth real

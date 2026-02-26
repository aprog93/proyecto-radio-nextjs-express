# 📡 API Backend - Tabla Completa de Funciones

## 🎙️ Station (AzuraCast Proxy)

| # | Método | Endpoint | Función | Descripción | Autenticación | Cache | Parámetros |
|---|--------|----------|---------|-------------|---------------|-------|-----------|
| 1 | GET | `/api/station/now-playing` | Obtener canción actual | Retorna la canción en reproducción, oyentes, información en vivo | No | 60s | - |
| 2 | GET | `/api/station/playlists` | Listar todas las playlists | Retorna todas las playlists disponibles de la estación | No | 60s | - |
| 3 | GET | `/api/station/playlists/:playlistId/songs` | Obtener canciones de playlist | Retorna las canciones de una playlist específica con paginación | No | 60s | `limit` (50), `offset` (0) |
| 4 | POST | `/api/station/requests` | Hacer request de canción | Usuario solicita reproducción de una canción | **Sí (JWT)** | ❌ | `songId` (body) |

---

## 🔐 Authentication

| # | Método | Endpoint | Función | Descripción | Autenticación | Estado |
|---|--------|----------|---------|-------------|---------------|---------|
| 5 | POST | `/api/auth/register` | Registrar usuario | Crea nuevo usuario en el sistema | No | ⚠️ Mock (TODO: Supabase) |
| 6 | POST | `/api/auth/login` | Login usuario | Autentica usuario y retorna JWT token (7 días) | No | ⚠️ Mock (TODO: Supabase) |
| 7 | POST | `/api/auth/logout` | Logout usuario | Cierra sesión del usuario (frontend maneja token) | No | ✅ |
| 8 | GET | `/api/auth/me` | Obtener perfil actual | Retorna datos del usuario autenticado | **Sí (JWT)** | ✅ |

---

## 💚 Health Checks (Monitoring)

| # | Método | Endpoint | Función | Descripción | Autenticación | Propósito |
|---|--------|----------|---------|-------------|---------------|----------|
| 9 | GET | `/health` | Estado general del servidor | Verifica que el backend está funcionando | No | Monitoreo general |
| 10 | GET | `/health/live` | Kubernetes liveness probe | Verifica que el proceso está vivo | No | Kubernetes restart |
| 11 | GET | `/health/ready` | Kubernetes readiness probe | Verifica que servidor está listo para recibir tráfico | No | Kubernetes load balancer |

---

## 📊 Datos Detallados por Endpoint

### 1️⃣ GET `/api/station/now-playing`
```
Retorna:
{
  "success": true,
  "data": {
    "station": {
      "id": 1,
      "name": "Mi Radio",
      "listen_url": "https://demo.azuracast.com:8004/stream"
    },
    "listeners": {
      "total": 42,
      "unique": 35,
      "current": 42
    },
    "live": {
      "is_live": false,
      "streamer_name": null,
      "broadcast_start": null
    },
    "now_playing": {
      "sh_id": 1234,
      "song": {
        "id": "567",
        "title": "Song Title",
        "artist": "Artist Name",
        "album": "Album Name",
        "art": "https://..."
      },
      "duration": 240,
      "elapsed": 120,
      "remaining": 120,
      "playlist": "Hit Mix"
    },
    "playing_next": { /* similar to now_playing */ },
    "song_history": [ /* array of past songs */ ]
  },
  "timestamp": "2024-02-24T18:00:00Z"
}
```

**Caché:** 60s (invalidada al hacer request)

---

### 2️⃣ GET `/api/station/playlists`
```
Retorna: Array de playlists

[
  {
    "id": 1,
    "name": "Hit Mix",
    "is_enabled": true,
    "songs_count": 523,
    "is_jingle": false,
    "is_request": false
  },
  {
    "id": 2,
    "name": "Clasicos",
    "is_enabled": true,
    "songs_count": 287,
    "is_jingle": false,
    "is_request": true
  },
  ...
]
```

**Caché:** 60s

---

### 3️⃣ GET `/api/station/playlists/:playlistId/songs`
```
URL: /api/station/playlists/1/songs?limit=50&offset=0

Retorna: Array de canciones en la playlist

[
  {
    "id": 10001,
    "song_id": "567",
    "playlist_id": 1,
    "position": 1,
    "weight": 1,
    "played_at": 1708874400,
    "song": {
      "id": "567",
      "title": "Song Title",
      "artist": "Artist Name",
      "album": "Album Name",
      "genre": "Pop",
      "art": "https://...",
      "text": "Full metadata"
    }
  },
  ...
]
```

**Parámetros:**
- `limit`: Cantidad de canciones (default: 50)
- `offset`: Saltar N canciones (default: 0, para paginación)

**Caché:** 60s por combinación (playlist + offset)

---

### 4️⃣ POST `/api/station/requests`
```
Request Body:
{
  "songId": "567"
}

Headers:
Authorization: Bearer {jwt-token}

Retorna:
{
  "success": true,
  "data": {
    "success": true
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

Error (sin JWT):
HTTP 401
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

**Requisitos:**
- JWT token válido en header `Authorization: Bearer {token}`
- `songId` en request body
- AzuraCast debe tener requests habilitados

**Efectos:**
- Invalida cache de `now_playing` (se actualizará en próxima llamada)
- Logs para auditoría (userId, songId, timestamp)

---

### 5️⃣ POST `/api/auth/register`
```
Request Body:
{
  "email": "usuario@example.com",
  "password": "securepassword123"
}

Retorna:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "email": "usuario@example.com"
    }
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

Errores:
- 400: Email o password faltante
- 500: Error del servidor
```

**⚠️ Estado Actual:** Mock implementation
- Genera JWT válido pero no valida credenciales reales
- No hashea password
- No guarda en base de datos

**TODO (FASE 1.2):**
- Integrar Supabase
- Hash password con bcrypt
- Validar email único
- Send verification email

---

### 6️⃣ POST `/api/auth/login`
```
Request Body:
{
  "email": "usuario@example.com",
  "password": "securepassword123"
}

Retorna:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "email": "usuario@example.com"
    }
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

Errores:
- 400: Email o password faltante
- 401: Credenciales inválidas (TODO)
- 500: Error del servidor
```

**JWT Token:**
- Válido por 7 días
- Contiene: userId, email, issued_at, expires_at
- Firma: HS256 (HMAC-SHA256)

**Uso en requests posteriores:**
```
Authorization: Bearer {token}
```

---

### 7️⃣ POST `/api/auth/logout`
```
Retorna:
{
  "success": true,
  "data": {
    "message": "Logged out"
  },
  "timestamp": "2024-02-24T18:00:00Z"
}
```

**Nota:** No invalida token en servidor (JWT es stateless)
Frontend maneja eliminación de token en localStorage

---

### 8️⃣ GET `/api/auth/me`
```
Headers:
Authorization: Bearer {jwt-token}

Retorna:
{
  "success": true,
  "data": {
    "userId": "user-1708874400",
    "email": "usuario@example.com"
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

Errores:
401: No token o token inválido
{
  "success": false,
  "error": {
    "message": "Not authenticated"
  }
}
```

**Casos de uso:**
- Verificar que JWT sigue válido
- Obtener datos del usuario sin acceso a BD
- Proteger rutas en frontend

---

### 9️⃣ GET `/health`
```
Retorna:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-02-24T18:00:00Z",
    "uptime": 3600.5  // segundos desde startup
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

HTTP: 200
```

**Uso:** Monitoreo general, verificar que server está activo

---

### 🔟 GET `/health/live`
```
Retorna:
{
  "success": true,
  "data": {
    "status": "alive"
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

HTTP: 200 (server vivo) o 500 (server down)
```

**Kubernetes:** Usa este endpoint para `livenessProbe`
- Si falla → Kubernetes restart el pod
- Timeout: 3 segundos
- Período: 30 segundos

---

### 1️⃣1️⃣ GET `/health/ready`
```
Retorna:
{
  "success": true,
  "data": {
    "status": "ready"
  },
  "timestamp": "2024-02-24T18:00:00Z"
}

HTTP: 200 (listo) o 503 (no listo)
```

**Kubernetes:** Usa este endpoint para `readinessProbe`
- Si falla → Kubernetes remove del load balancer
- Permite gradual rollout sin downtime
- TODO: Verificar conexión a DB y AzuraCast

---

## 🔑 Autenticación JWT

### Cómo obtener token:
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Response:
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 2. Usar token en requests posteriores
curl http://localhost:3000/api/station/requests \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"songId":"567"}'
```

### Validación JWT:
```
Header: Authorization: Bearer {token}
  ↓
Backend extrae token
  ↓
Verifica signature (HMAC-SHA256)
  ↓
Verifica expiración (7 días)
  ↓
Extrae userId y email
  ↓
Añade a req.userId y req.email
```

---

## 📈 Caché Strategy

| Endpoint | Cache | TTL | Invalidación |
|----------|-------|-----|--------------|
| `/api/station/now-playing` | ✅ | 60s | Manual al hacer request |
| `/api/station/playlists` | ✅ | 60s | Automática (TTL) |
| `/api/station/playlists/:id/songs` | ✅ | 60s | Automática (TTL) |
| `/api/station/requests` | ❌ | - | N/A (invalidates now-playing) |
| `/api/auth/*` | ❌ | - | Stateless (JWT) |
| `/health*` | ❌ | - | Real-time |

**Beneficio:** Reduce carga a AzuraCast 90%
- Sin caché: 100 usuarios = 100 requests/min
- Con caché: 100 usuarios = 1 request/min

---

## 🚨 Error Handling

Todos los endpoints retornan formato consistente:

### Success:
```json
{
  "success": true,
  "data": { /* datos */ },
  "timestamp": "2024-02-24T18:00:00Z"
}
```

### Error:
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE" // opcional
  },
  "timestamp": "2024-02-24T18:00:00Z"
}
```

### HTTP Status Codes:
- `200`: Success
- `400`: Bad request (parámetros inválidos)
- `401`: Unauthorized (sin auth o token inválido)
- `404`: Not found
- `500`: Server error

---

## 💡 Próximas Funciones (FASE 1.2+)

| # | Endpoint | Función | Descripción |
|---|----------|---------|-------------|
| 12 | GET | `/api/station/requests` | Listar requests pendientes |
| 13 | GET | `/api/user/requests` | Mi historial de requests |
| 14 | DELETE | `/api/station/requests/:requestId` | Cancelar request (admin) |
| 15 | GET | `/api/admin/stats` | Estadísticas de la estación |
| 16 | POST | `/api/admin/queue/next` | Forzar próxima canción |
| 17 | PUT | `/api/admin/settings` | Actualizar configuración |

---

## 🧪 Testing Endpoints

### Curl Examples:

```bash
# 1. Health check
curl http://localhost:3000/health

# 2. Get now playing
curl http://localhost:3000/api/station/now-playing

# 3. List playlists
curl http://localhost:3000/api/station/playlists

# 4. Get songs from playlist 1
curl "http://localhost:3000/api/station/playlists/1/songs?limit=10&offset=0"

# 5. Register (mock)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 6. Login (mock)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# 7. Get current user (con JWT)
curl -H "Authorization: Bearer {token}" \
  http://localhost:3000/api/auth/me

# 8. Request a song (mock, requiere JWT)
curl -X POST http://localhost:3000/api/station/requests \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"songId":"567"}'
```

---

## 📊 Resumen

| Categoría | Cantidad | Status |
|-----------|----------|--------|
| **Endpoints Activos** | 11 | ✅ |
| **Endpoints Mock** | 2 | ⚠️ |
| **Con Caché** | 3 | ✅ |
| **Requieren Auth** | 2 | ✅ |
| **Health Checks** | 3 | ✅ |
| **Tests** | 13 | ✅ |

**Total:** 11 endpoints implementados + 2 placeholders para Supabase

---

**Última actualización:** February 24, 2024

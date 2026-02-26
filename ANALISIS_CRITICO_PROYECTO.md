# ANÁLISIS CRÍTICO PROFUNDO - Proyecto Radio Cesar
**Fecha:** 26 de Febrero de 2026  
**Arquitecto Senior:** Análisis BFF + AzuraCast Integration  
**Status:** ⚠️ CRÍTICO - Problemas graves encontrados

---

## 📊 EXECUTIVE SUMMARY

El proyecto tiene **dos arquitecturas simultáneas que compiten entre sí**, causando inconsistencias y problemas de seguridad:

| Aspecto | Estado | Severidad |
|---------|--------|-----------|
| **Arquitectura de API** | Confusa - 2 clientes API incompatibles | 🔴 CRÍTICA |
| **Seguridad - API Key AzuraCast** | Expuesta en navegador | 🔴 CRÍTICA |
| **Integración Frontend-Backend** | Incompleta y fragmentada | 🔴 CRÍTICA |
| **Tests Backend** | 11/11 FALLANDO | 🔴 CRÍTICA |
| **Autenticación JWT** | No propagada correctamente | 🟠 ALTA |
| **Modelado de Base de Datos** | Correcto pero no utilizado | 🟡 MEDIA |
| **UI/UX Components** | Bien implementados | 🟢 BAJA |
| **Documentación Código** | Adecuada pero inconsistente | 🟡 MEDIA |

---

## 🔴 PROBLEMAS CRÍTICOS ENCONTRADOS

### 1. **DOS CLIENTES API INCOMPATIBLES (ARQUITECTURA ROTA)**

#### Problema Principal:
El proyecto tiene **dos sistemas de llamadas API completamente diferentes** que no se comunican:

**Cliente #1: `/src/modules/azuracast/api/client.ts` (DIRECTO A AZURACAST)**
```typescript
// ❌ EXPONE API KEY EN NAVEGADOR
const API_KEY = import.meta.env.VITE_AZURACAST_API_KEY || '';

export async function apiCall<T>(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;  // LLAMADA DIRECTA A AZURACAST
  headers['X-API-Key'] = API_KEY;            // API KEY VISIBLE EN BROWSER
  const response = await fetch(url, {...});
}
```

**Cliente #2: `/src/lib/backend-api.ts` (A TRAVÉS DEL BFF)**
```typescript
// ✅ CORRECTO - Pasa por backend
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export async function apiCall<T>(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}/api${endpoint}`;  // LLAMADA AL BFF
  headers['Authorization'] = `Bearer ${token}`;
}
```

#### Consecuencias:
1. **Seguridad**: API key de AzuraCast visible en variables de entorno del navegador
2. **Inconsistencia**: Algunos módulos usan client #1, otros usan client #2
3. **Confusión**: Imposible saber cuál es la "verdad" del sistema
4. **Duplicación**: Lógica de error handling duplicada

#### Uso Actual:
```
✅ Módulos usando BFF (/src/lib/backend-api.ts):
  - modules/azuracast/services/stationService.ts
  - modules/azuracast/services/playlistService.ts
  - modules/azuracast/services/historyService.ts

❌ Módulos usando DIRECTO a AzuraCast (/src/modules/azuracast/api/client.ts):
  - Definido pero no claro dónde se usa exactamente
  - Cliente "huérfano" en la codebase
```

---

### 2. **PLAYER CONTEXT LLAMANDO DIRECTAMENTE A AZURACAST**

**Archivo:** `/src/context/PlayerContext.tsx` (línea 2, 61)

```typescript
import { fetchNowPlaying } from '@/lib/azuracast';  // ❌ LLAMADA DIRECTA

useEffect(() => {
  const update = async () => {
    const data = await fetchNowPlaying();  // ❌ BYPASSA BFF
    // setNowPlaying...
  };
}, []);
```

**Problema:**
- El PlayerContext es el **corazón del streaming** y está llamando directamente a AzuraCast
- No usa el BFF para obtener metadata
- No hay JWT authentication en esta llamada
- No hay caché desde el servidor

**Impacto:**
- Cada usuario hace 4 llamadas directas a AzuraCast cada minuto (15s polling × 4)
- Sin caché de servidor, cada instancia de navegador hace peticiones innecesarias
- Si AzuraCast requiere autenticación, PlayerContext no puede autenticarse

---

### 3. **JWT TOKEN NO SE PROPAGA CORRECTAMENTE**

**Problema:**
AuthContext genera JWT correctamente, pero el frontend NO lo usa en las llamadas a `apiCall()`:

```typescript
// ❌ Las llamadas NO pasan el token
const response = await apiCall<Station[]>('/stations');

// ✅ Debería ser:
const response = await apiCall<Station[]>('/stations', {}, token);
```

**En backend:**
```typescript
// ✅ Backend espera el token
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const token = authHeader.split(' ')[1];  // Espera Bearer token
  const decoded = authService.verifyToken(token);
}
```

**Impacto:**
- Endpoints protegidos retornan 401 incluso con usuario autenticado
- No hay forma de rastrear quién hace qué solicitud
- Imposible implementar rate limiting por usuario

---

### 4. **TESTS BACKEND FALLANDO (11/11 FALLOS)**

**Archivo:** `service/src/tests/schedule.test.ts`

```
❌ POST /api/schedule > should create schedule successfully
❌ POST /api/schedule > should reject without title
❌ POST /api/schedule > should reject without dayOfWeek
... (11 más)
```

**Root Cause:**
Los tests usan `supertest` pero las rutas no están siendo registradas correctamente en el middleware.

**Síntoma:**
```
expected "spy" to be called with arguments: [201]
Received: Number of calls: 0
```

El status 201 nunca se envía = la ruta no está siendo alcanzada.

---

### 5. **BASE DE DATOS EMBEBIDA (SQL.JS) PERO NO UTILIZADA**

**Definida pero ignorada:**
- `service/src/config/database.ts` - Inicializa SQL.js
- `service/src/types/database.ts` - 10 entidades definidas (User, Blog, News, Event, Schedule, Product, Order, Donation, Comment)
- Operaciones CRUD presentes en:
  - `service/src/routes/auth.ts` ✅
  - `service/src/routes/schedule.ts` ✅
  - `service/src/routes/events.ts` ✅
  - `service/src/routes/blogs.ts` ✅
  - `service/src/routes/news.ts` ✅
  - `service/src/routes/products.ts` ✅

**PERO:** Endpoints para `Comments`, `Donations`, `Orders` **DEFINIDOS EN TIPOS PERO SIN RUTAS**

**Impacto:**
- Si querés guardar comentarios en blog/news = no hay endpoint
- Si querés procesar donaciones = no hay endpoint
- Si querés gestionar órdenes de ecommerce = no hay endpoint

---

### 6. **INTEGRACIÓN SUPABASE FANTASMA**

**Status:**
- Frontend: `AuthContext.tsx` usa Supabase
- Backend: Tiene credenciales de Supabase pero **NO las usa** en operaciones

**Código Backend:**
```typescript
// service/src/config/supabase.ts
export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);

// PERO: Nunca se importa o usa en rutas
// Las rutas usan SQL.js en su lugar
```

**Decisión tomada:**
El proyecto decidió usar SQL.js (embebida) en lugar de Supabase como DB de verdad, pero las configuraciones sugieren lo contrario.

**Confusión resultante:**
- Frontend espera autenticación vía Supabase
- Backend espera autenticación vía JWT del propio backend
- Dos sistemas de auth paralelos = incompatibles

---

### 7. **ENDPOINTS INCOMPLETOS**

**Endpoints que EXISTEN en Backend:**

```
✅ POST /api/auth/register
✅ POST /api/auth/login
✅ GET /api/station/now-playing (proxy AzuraCast)
✅ GET /api/station/playlists (proxy AzuraCast)
✅ GET /api/station/playlists/:id/songs
✅ POST /api/schedule
✅ GET /api/schedule
✅ GET /api/blogs
✅ POST /api/blogs
✅ GET /api/news
✅ POST /api/news
✅ GET /api/events
✅ POST /api/events
✅ GET /api/products
✅ POST /api/products
```

**Endpoints que FALTAN (son necessarios para frontend):**

```
❌ PUT /api/schedule/:id (actualizar programa)
❌ DELETE /api/schedule/:id (eliminar programa)
❌ GET /api/schedule/day/:dayOfWeek (programa diario)
❌ GET /api/comments (historial de comentarios)
❌ POST /api/comments (crear comentario)
❌ DELETE /api/comments/:id (eliminar comentario)
❌ GET /api/donations (listar donaciones)
❌ POST /api/donations (crear donación)
❌ GET /api/orders (listar órdenes)
❌ POST /api/orders (crear orden)
❌ PUT /api/orders/:id (actualizar estado)
```

---

## 🟠 PROBLEMAS DE ALTO IMPACTO

### 8. **MIDDLEWARE DE AUTENTICACIÓN REQUIERE authService INYECTADO**

**Implementación Actual:**
```typescript
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authService = req.authService;  // ❌ Espera que esté inyectado
  if (!authService) {
    res.status(500).json({ success: false, error: 'Internal server error' });
    return;
  }
}
```

**El problema:**
- `authService` se inyecta en rutas: `router.use((req, res, next) => { req.authService = authService; })`
- Si una ruta olvida inyectarlo = 500 error genérico
- Frágil y propenso a errores

**Mejor enfoque:**
```typescript
// ✅ Inyectar en app.ts global, no en cada ruta
app.use((req, res, next) => {
  req.authService = new AuthService(db);
  next();
});
```

---

### 9. **CACHÉ DE AZURACAST SIN INVALIDACIÓN INTELIGENTE**

**Actual:**
```typescript
cache.set(cacheKey, response.data, env.CACHE_TTL_SECONDS);  // 60 segundos hardcoded
```

**Problemas:**
- No hay revalidación cuando datos cambian
- Si StreamURL cambia en AzuraCast, players verán datos stale 60s
- No hay mecanismo para invalidar caché manual

**Mejor:**
```typescript
// Usar ETag + conditional requests
// O WebSockets para invalidación push
// O Cache-Control headers desde AzuraCast
```

---

### 10. **FRONTEND NO TIENE MANEJO DE ERRORES DE AUTENTICACIÓN**

**En components:**
```typescript
// ❌ Si token expira, no hay reintentos o redirection
const response = await apiCall<T>(endpoint);
if (!response.success) {
  console.error(response.error);  // Solo log
  return null;
}
```

**Debería:**
```typescript
if (response.error?.code === 'UNAUTHORIZED') {
  // Refrescar token o redirigir a login
  await auth.signIn(email, password);
  return retry(endpoint);
}
```

---

## 🟡 PROBLEMAS MEDIANOS

### 11. **DUPLICACIÓN DE TIPOS**

Frontend y backend tienen tipos duplicados:
- `AzuraSong` definido en ambos
- `AzuraNowPlayingResponse` duplicado
- Cuando cambia AzuraCast API, hay que actualizar en 2 lugares

**Solución:**
```
service/
├── src/types/azuracast.ts (ÚNICA FUENTE)
└── ../../community-stream-connect/src/types/azuracast.ts -> SYMLINK
```

---

### 12. **ENTORNO DE DESARROLLO VS PRODUCCIÓN CONFUSO**

**Backend `.env.example`:**
```
AZURACAST_BASE_URL=https://radio-azura.orioncaribe.com
AZURACAST_API_KEY=
```

**Frontend `.env.example`:**
```
VITE_AZURACAST_BASE_URL=https://demo.azuracast.com
VITE_AZURACAST_API_KEY=
VITE_BACKEND_URL=http://localhost:3000
```

**Pregunta:** ¿Cuál es la URL verdadera?
- `radio-azura.orioncaribe.com` (backend dice)
- `demo.azuracast.com` (frontend dice)

Hay inconsistencia entre configuraciones.

---

### 13. **HEADERS CORS INSEGUROS**

**En `app.ts`:**
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

**Problema:**
- En producción, podría aceptar cualquier origen si `CORS_ORIGIN` no está set
- No hay rate limiting en endpoints públicos

---

## 🟢 LO QUE ESTÁ BIEN

### ✅ Backend
- ✅ Estructura de proyecto clara (routes, services, middleware, config)
- ✅ Autenticación JWT implementada correctamente (en teoría)
- ✅ Proxy a AzuraCast funciona
- ✅ Caché con TTL
- ✅ TypeScript strict mode
- ✅ Tipos definidos para bases de datos

### ✅ Frontend
- ✅ React 18 + TypeScript
- ✅ Vite (rápido en desarrollo)
- ✅ shadcn/ui + Radix (accesibilidad)
- ✅ i18n con auto-detección
- ✅ PlayerContext bien diseñado
- ✅ Tests de azuracast services (aunque fallan)
- ✅ 122 archivos TypeScript/TSX

### ✅ Integración AzuraCast
- ✅ Tipos correcto para API de AzuraCast
- ✅ Endpoints proxy básicos funcionan
- ✅ Polling de metadata funciona

---

## 📋 TABLA DE CAMBIOS NECESARIOS

| # | Componente | Problema | Solución | Prioridad | Horas |
|---|-----------|----------|----------|-----------|-------|
| 1 | Frontend | 2 clientes API | Consolidar en `backend-api.ts`, eliminar módulo azuracast/api | 🔴 CRÍTICA | 3h |
| 2 | PlayerContext | Llamada directa a AzuraCast | Usar BFF endpoint `/api/station/now-playing` | 🔴 CRÍTICA | 1h |
| 3 | Backend Tests | Schedule tests fallando | Revisar middleware injection | 🔴 CRÍTICA | 2h |
| 4 | Frontend | JWT no se pasa | Integrar `useAuth()` en todas las llamadas a `apiCall()` | 🔴 CRÍTICA | 2h |
| 5 | Backend | Endpoints faltantes | Implementar CRUD para Comments, Donations, Orders | 🟠 ALTA | 3h |
| 6 | Backend | AuthService inyectado | Inyectar globalmente en app.ts | 🟠 ALTA | 1h |
| 7 | Frontend | Sin manejo de token expirado | Interceptor de error + retry automático | 🟠 ALTA | 2h |
| 8 | Docs | Inconsistencia AzuraCast URL | Clarificar cual es production | 🟡 MEDIA | 0.5h |
| 9 | Security | CORS headers | Validar en producción | 🟡 MEDIA | 1h |
| 10 | Frontend | Tipos duplicados | Symlink o shared package | 🟡 MEDIA | 1h |

---

## 🚀 RECOMENDACIONES ARQUITECTÓNICAS

### Plan de Refactoring (ORDEN IMPORTANTE):

**Fase 1: Estabilización (1 semana)**
1. Consolidar API clients → usar BFF único
2. Fijar tests backend
3. Implementar JWT propagation
4. PlayerContext → usar BFF

**Fase 2: Completitud (1 semana)**
1. Endpoints faltantes (Comments, Donations, Orders)
2. CRUD operations
3. Tests de rutas
4. Manejo de errores consistente

**Fase 3: Hardening (1 semana)**
1. Rate limiting
2. Input validation (usar Zod)
3. CORS validation
4. Error handling de token expirado

**Fase 4: Optimización (1 semana)**
1. Caching strategy mejorada
2. Websockets para live updates
3. Agregación de estadísticas
4. Monitoring + logging

---

## 📈 MÉTRICAS ACTUALES

```
Frontend Tests:
  ✅ 13 passing (module tests only)
  ❌ 0 integration tests
  ❌ 0 auth tests
  Coverage: ~30%

Backend Tests:
  ❌ 11/11 FAILING
  ✅ 3/3 service tests passing (azuracast, token, cache)
  Coverage: ~40%

Code Quality:
  TypeScript: ✅ Strict mode
  ESLint: ✅ Configured
  Documentation: 🟡 Parcial

API Endpoints:
  ✅ Implemented: 15
  ❌ Missing: 11
  Completeness: 57%
```

---

## 🎯 DEFINICIÓN DE "HECHO" PARA ESTE PROYECTO

Para que el proyecto se considere **production-ready**, debe cumplir:

- [ ] 1 cliente API único (BFF)
- [ ] PlayerContext usando BFF
- [ ] JWT propagado en todas las llamadas
- [ ] 100% de tests backend pasando
- [ ] Todos los endpoints necesarios implementados
- [ ] Autenticación funcionando end-to-end
- [ ] Rate limiting en endpoints públicos
- [ ] Error handling consistente
- [ ] Documentación API actualizada
- [ ] Deployment checklist completado

---

## 🔐 PROBLEMAS DE SEGURIDAD (RESUMEN)

1. **API KEY EXPUESTA** → Mover a backend
2. **Sin rate limiting** → Implementar
3. **CORS permisivo** → Validar en prod
4. **Token expiration sin manejo** → Interceptor
5. **No hay input validation** → Usar Zod schema
6. **Secrets en .env no validados** → Env schema

---

## 📞 PREGUNTAS PENDIENTES

Antes de proceder con cambios:

1. **¿Cuál es la DB de verdad?** ¿SQL.js embebida o Supabase?
2. **¿Tenés acceso a AzuraCast production?** (radio-azura.orioncaribe.com)
3. **¿Quién debe manejar autenticación?** ¿Backend JWT o Supabase Auth?
4. **¿Necesitas WebSockets** para live updates o polling es suficiente?
5. **¿Cuál es la estrategia de deployment?** Docker + K8s o simple Node.js?

---

## CONCLUSIÓN

El proyecto **tiene buena base pero arquitectura confusa**. El problema principal no es código malo, sino **falta de decisiones arquitectónicas claras**:

1. **Se empieza con BFF** (backend.ts)
2. **Se agrega módulo parallel** (modules/azuracast/api)
3. **Nunca se consolidó** → Ahora hay dos caminos

**Mi recomendación:**
- Dedicar 2-3 horas a consolidar arquitectura
- Luego expandir funcionalidad
- Hacer commits pequeños y atómicos
- Documentar decisiones en ARCHITECTURE.md

**Severity:** 🔴 **CRÍTICA** - No recomiendo deploy a producción sin resolver los puntos críticos.

---

*Análisis completado por Senior Architect*  
*No es "pretty code", es código que FUNCIONA y es ESCALABLE*

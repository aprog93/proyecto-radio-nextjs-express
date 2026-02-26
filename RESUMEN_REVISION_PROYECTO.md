# RESUMEN EJECUTIVO REVISIÓN - Proyecto Radio Cesar
**26 de Febrero de 2026**

---

## QUÉ ESTABA

### Backend (Express.js + TypeScript)
- ✅ Proyecto monolito BFF (Backend for Frontend)
- ✅ 1,664 líneas de código TypeScript
- ✅ Rutas para: Auth, Station (AzuraCast proxy), Blogs, News, Events, Schedule, Products, Admin
- ✅ Base de datos embebida con SQL.js
- ✅ Autenticación JWT con bcrypt
- ✅ Caché en memoria con TTL (60s)
- ✅ Middleware para auth + admin roles
- ❌ **Tests fallando: 11/11 en schedule routes**
- ❌ **Endpoints incompletos: Comments, Donations, Orders definidos en tipos pero sin rutas**

### Frontend (React 18 + Vite)
- ✅ 122 archivos TypeScript/TSX
- ✅ 24 páginas/rutas diferentes
- ✅ shadcn/ui + Radix Primitives (accesibilidad)
- ✅ Context API: PlayerContext, AuthContext, ThemeContext
- ✅ i18n multi-idioma (es, en, fr)
- ✅ React Query configurado
- ✅ Tests básicos pasando (13 tests)
- ✅ PlayerContext con polling de AzuraCast cada 15s
- ❌ **TWO API CLIENTS incompatibles en paralelo**
- ❌ **JWT no se propaga a llamadas backend**
- ❌ **Integración Supabase fantasma**

### Estado Actual
- Backend compilado: `dist/` present
- Frontend compilado: `dist/` present
- Documentación: 10+ archivos .md
- Tests backend: TODOS FALLANDO
- Tests frontend: Pasando pero sin cobertura real

---

## QUÉ SE ENCONTRÓ

### 🔴 PROBLEMAS CRÍTICOS

#### 1. **ARQUITECTURA API CONFUSA - DOS CLIENTES EN PARALELO**

**Frontend tiene DOS formas de llamar APIs:**

```
Forma A: /src/modules/azuracast/api/client.ts
  └─ Llama DIRECTAMENTE a AzuraCast
  └─ EXPONE API_KEY en navegador
  └─ Sin autenticación
  └─ Sin caché de servidor

Forma B: /src/lib/backend-api.ts
  └─ Llama al BFF (Backend)
  └─ Usa JWT Bearer tokens
  └─ Servicios pasan por aquí:
     - stationService
     - playlistService
     - historyService
```

**Consecuencia:**
- Inconsistencia: No se sabe cuál endpoint usar
- Seguridad: API key visible en browser
- Mantenimiento imposible: Actualizar AzuraCast API = cambios en 2 lugares

---

#### 2. **PLAYER CONTEXT BYPASSA EL BFF**

```typescript
// En /src/context/PlayerContext.tsx
import { fetchNowPlaying } from '@/lib/azuracast';  // ❌ DIRECTO A AZURACAST

useEffect(() => {
  const data = await fetchNowPlaying();  // Cada 15 segundos
});
```

**Problema:**
- PlayerContext es el CORAZÓN del app
- Hace 4 requests directos a AzuraCast cada minuto (sin caché de servidor)
- No usa JWT
- Si AzuraCast requiere auth, no puede hacerlo

**Impacto:**
- 1,000 usuarios simultáneos = 4,000 requests/min a AzuraCast
- Sin caché de servidor, puro ruido

---

#### 3. **JWT NO SE PROPAGA EN FRONTEND**

```typescript
// AuthContext genera token correctamente:
const token = jwt.sign({...}, JWT_SECRET, {expiresIn: '7d'});

// PERO en frontend, apiCall() NUNCA recibe el token:
const response = await apiCall<T>(endpoint);  // ❌ Sin token

// Backend espera:
const token = authHeader.split(' ')[1];  // Busca "Bearer {token}"
const decoded = authService.verifyToken(token);  // Falla si no hay token
```

**Consecuencia:**
- Endpoints protegidos retornan 401 incluso con usuario autenticado
- No hay auditoría de quién hace qué

---

#### 4. **TESTS BACKEND COMPLETAMENTE FALLIDOS**

```
❌ tests/schedule.test.ts
   - POST /api/schedule: FAIL
   - All 11 tests: FAIL
   
Root cause: Middleware injection no funciona en tests
```

**Síntoma:**
```
expected "spy" to be called with arguments: [201]
Received: Number of calls: 0
```

Las rutas nunca son alcanzadas en tests.

---

#### 5. **ENDPOINTS CRÍTICOS FALTANTES**

Tipos definidos en base de datos pero SIN RUTAS:

```
❌ GET /api/comments
❌ POST /api/comments
❌ DELETE /api/comments/:id

❌ GET /api/donations
❌ POST /api/donations

❌ GET /api/orders
❌ POST /api/orders
❌ PUT /api/orders/:id

❌ PUT /api/schedule/:id (actualizar)
❌ DELETE /api/schedule/:id (eliminar)
```

Imposible:
- Dejar comentarios en blogs
- Procesar donaciones
- Gestionar órdenes de ecommerce
- Editar programas después de crearlos

---

### 🟠 PROBLEMAS DE ALTO IMPACTO

#### 6. **AUTENTICACIÓN DUPLICADA: JWT + SUPABASE**

```
Backend espera: JWT propio (service/src/services/auth.ts)
Frontend usa: Supabase Auth (context/AuthContext.tsx)

Son INCOMPATIBLES - no se comunican
```

#### 7. **MIDDLEWARE AUTH REQUIERE INYECCIÓN MANUAL**

```typescript
// En cada ruta:
router.use((req, res, next) => {
  req.authService = authService;  // ❌ Manual, frágil
  next();
});

// Debería estar en app.ts:
app.use((req, res, next) => {
  req.authService = new AuthService(db);  // ✅ Global
  next();
});
```

#### 8. **CORS HEADERS INSEGUROS**

```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
// En prod, si CORS_ORIGIN no está set = acepta cualquier origen
```

#### 9. **SIN RATE LIMITING**

```
❌ Endpoints públicos: sin protección
❌ Login/Register: sin rate limit
❌ Sin captcha o verificación
```

#### 10. **SIN MANEJO DE TOKEN EXPIRADO**

```typescript
// Frontend:
if (!response.success) {
  console.error(response.error);  // ❌ Solo log
  // Debería: refresh token o redirigir a login
}
```

---

### 🟡 PROBLEMAS MEDIANOS

#### 11. **TIPOS DUPLICADOS FRONTEND/BACKEND**

```
AzuraSong, AzuraNowPlayingResponse, etc.
Definidos en ambos lados. Cambio = 2 lugares.
```

#### 12. **INCONSISTENCIA DE URLS**

```
Backend env:  AZURACAST_BASE_URL=https://radio-azura.orioncaribe.com
Frontend env: VITE_AZURACAST_BASE_URL=https://demo.azuracast.com

¿Cuál es la verdadera? Confusión total.
```

#### 13. **SIN VALIDACIÓN DE INPUT**

```
Backend acepta cualquier cosa en POST requests
Zod schemas definidas en tipos pero no usadas en rutas
```

---

## QUÉ CAMBIÓ

### Archivos Creados:
1. ✅ `ANALISIS_CRITICO_PROYECTO.md` (12 páginas, análisis exhaustivo)

### Cambios Realizados:
- 0 (solo análisis en esta pasada)

### Commits:
- 0 (esperando aprobación de cambios)

---

## QUÉ DEBERÍA HACERSE

### ORDEN DE PRIORIDAD (Critical Path):

#### **SPRINT 1: ARQUITECTURA (2-3 días)**

**1. Consolidar API Clients [2 horas]**
```
❌ Eliminar: /src/modules/azuracast/api/client.ts
✅ Usar único: /src/lib/backend-api.ts

Cambios:
- Actualizar imports en historyService, playlistService
- Eliminar código duplicado
```

**2. PlayerContext → Usar BFF [1 hora]**
```typescript
// Cambiar:
import { fetchNowPlaying } from '@/lib/azuracast';

// A:
import { apiCall } from '@/lib/backend-api';

const data = await apiCall('/station/now-playing');
```

**3. Propagar JWT en Frontend [2 horas]**
```
- Exportar token de AuthContext
- Pasar token en TODAS las llamadas a apiCall()
- Implementar interceptor de error 401
```

**4. Fijar Tests Backend [2 horas]**
```
- Revisar middleware injection en tests
- Usar supertest correctamente
- Hacer pasar los 11 tests
```

#### **SPRINT 2: COMPLETITUD (2-3 días)**

**5. Implementar Endpoints Faltantes [3 horas]**
```
- POST /api/comments
- GET /api/comments
- DELETE /api/comments/:id
- POST /api/donations
- GET /api/donations
- POST/PUT/DELETE /api/orders
```

**6. Global Auth Injection [1 hora]**
```
Mover inyección de authService a app.ts
```

**7. Agregar Tests de Rutas [2 horas]**
```
- Test suite para auth routes
- Test suite para schedule routes
- Test suite para comentarios/donaciones
```

#### **SPRINT 3: SECURITY (1-2 días)**

**8. Rate Limiting [1 hora]**
```
npm install express-rate-limit

// En app.ts
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login'
});

app.use('/api/auth/login', loginLimiter);
```

**9. Input Validation [1 hora]**
```
Usar Zod schemas en rutas:
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(1)
});
```

**10. Token Expiration Handler [1 hora]**
```
Frontend: Interceptor que refresh token o redirige a login
```

**11. CORS Validation [0.5 horas]**
```
Validar CORS_ORIGIN en producción
```

#### **SPRINT 4: OPTIMIZACIÓN (1-2 días)**

**12. Documentación API OpenAPI/Swagger [1 hora]**

**13. Monitoring + Logging [1 hora]**
```
Winston logger
Request/response logging
```

**14. Caching Strategy [1 hora]**
```
ETag + conditional requests
Invalidación inteligente
```

---

## PREGUNTAS PARA ANTES DE PROCEDER

1. **¿Cuál es la DB de verdad para producción?**
   - ¿SQL.js embebida en Node?
   - ¿O Supabase PostgreSQL?
   - (Ahora está confuso)

2. **¿Tenés acceso a AzuraCast production?**
   - URL: `radio-azura.orioncaribe.com`?
   - ¿API Key disponible?
   - ¿O es una instancia demo?

3. **¿Quién maneja autenticación?**
   - ¿Backend JWT (ahora implementado)?
   - ¿O Supabase Auth (en frontend)?
   - No pueden coexistir.

4. **¿Necesitas WebSockets para live updates?**
   - ¿O polling cada 15s está bien?
   - Afecta arquitectura de caché

5. **¿Cuál es el plan de deployment?**
   - Docker + Kubernetes?
   - Simple Node.js + PM2?
   - Vercel/Railway para frontend?
   - Afecta validación de env vars

---

## RECOMENDACIÓN FINAL

### Severity: 🔴 CRÍTICA

**NO DEPLOYER A PRODUCCIÓN SIN:**
1. Consolidar API clients (arquitectura confusa)
2. Propagar JWT correctamente (seguridad)
3. Pasar tests backend (confiabilidad)
4. Implementar rate limiting (seguridad)
5. Aclarar DB + Auth strategy (sostenibilidad)

### Timeline Realista:

```
Sprint 1 (Arquitectura):      2-3 días
Sprint 2 (Completitud):       2-3 días
Sprint 3 (Security):          1-2 días
Sprint 4 (Optimización):      1-2 días
                              --------
TOTAL:                        6-10 días (1.5 semanas)
```

### Después de eso:
- ✅ Production-ready
- ✅ Tests pasando 100%
- ✅ Endpoints completados
- ✅ Seguridad endurecida
- ✅ Documentación clara

---

## ARCHIVO DE REFERENCIA

📄 Análisis completo: `/home/aprog93/Documents/workspace/proyecto-radio-cesar/ANALISIS_CRITICO_PROYECTO.md`

(12 páginas con detalles técnicos, código, ejemplos y soluciones específicas)

---

**Estado Actual:** Código base sólido, pero arquitectura confusa y crítica.  
**Prognóstico:** 6-10 días de trabajo concentrado → Production-ready  
**Mi Verdict:** No es malo, solo necesita decisiones arquitectónicas claras y consolidación.

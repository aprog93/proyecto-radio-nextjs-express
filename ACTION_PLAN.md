# PLAN DE ACCIÓN INMEDIATA - Proyecto Radio Cesar
**26 de Febrero de 2026**  
**Status:** 🔴 CRÍTICA - Requiere intervención arquitectónica

---

## ⚡ ANTES DE EMPEZAR CUALQUIER CAMBIO

### Responde estas 5 preguntas:

1. **¿Cuál es tu base de datos de producción?**
   - [ ] SQL.js embebida en Node (actual)
   - [ ] Supabase PostgreSQL
   - [ ] Otra (especificar)

2. **¿Quién maneja autenticación?**
   - [ ] Backend JWT (actual en backend)
   - [ ] Supabase Auth (actual en frontend)
   - [ ] Ambos en paralelo (NO RECOMENDADO)

3. **¿Cuál es la URL real de AzuraCast?**
   - [ ] `https://radio-azura.orioncaribe.com` (backend)
   - [ ] `https://demo.azuracast.com` (frontend)
   - [ ] Otra (especificar)

4. **¿Tenés acceso a API key de AzuraCast production?**
   - [ ] Sí, y es segura (no expuesta en env público)
   - [ ] No, solo demo
   - [ ] Desconocida

5. **¿Cuál es el timeline?**
   - [ ] ASAP (esta semana)
   - [ ] Próximas 2 semanas
   - [ ] Próximo mes

---

## 🎯 PRIMER PASO: CONSOLIDAR ARQUITECTURA (HOY - 2-3 HORAS)

### Paso 1: Entender estado actual

```bash
# En backend
cd service && npm test 2>&1 | tee test-results.txt

# En frontend
cd ../community-stream-connect && npm test 2>&1 | tee test-results.txt
```

### Paso 2: Eliminar duplicación de API clients

**ELIMINAR:**
```bash
rm /home/aprog93/Documents/workspace/proyecto-radio-cesar/community-stream-connect/src/modules/azuracast/api/client.ts
```

**REVISAR estos archivos que lo usan:**
```bash
grep -r "from.*azuracast/api/client" community-stream-connect/src
grep -r "import.*API_KEY\|import.*API_BASE" community-stream-connect/src/modules
```

**MIGRAR sus imports a `/src/lib/backend-api.ts`**

### Paso 3: Actualizar PlayerContext

**Archivo:** `/src/context/PlayerContext.tsx`

**Cambio necesario:**
```typescript
// ❌ ACTUAL
import { fetchNowPlaying } from '@/lib/azuracast';

// ✅ NUEVO
import { apiCall } from '@/lib/backend-api';

// En el useEffect:
const data = await apiCall('/station/now-playing');
```

### Paso 4: Propagar JWT en todas las llamadas

**Objetivo:** Pasar token en TODAS las llamadas a `apiCall()`

**En `/src/lib/backend-api.ts` actualizar:**
```typescript
export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string  // ← AGREGAR ESTE PARÁMETRO
): Promise<ApiResponse<T>> {
  // ... código actual ...
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;  // ← AGREGAR ESTO
  }
}
```

**En componentes que usen `apiCall()`:**
```typescript
const { user, session } = useAuth();

// ❌ ACTUAL
const response = await apiCall('/station/now-playing');

// ✅ NUEVO
const token = session?.user?.id; // O donde sea que guardes el token
const response = await apiCall('/station/now-playing', {}, token);
```

**Archivos a actualizar:**
```
src/modules/azuracast/services/stationService.ts
src/modules/azuracast/services/playlistService.ts
src/modules/azuracast/services/historyService.ts
src/modules/azuracast/hooks/useAzuracastPlaylist.ts
src/modules/azuracast/hooks/useAzuracastStation.ts
src/modules/azuracast/pages/*.tsx
```

### Paso 5: Commit atómico

```bash
git add -A
git commit -m "refactor: consolidate API clients, use BFF for all requests

- Remove modules/azuracast/api/client.ts (direct AzuraCast calls)
- Update PlayerContext to use BFF endpoint /api/station/now-playing
- Add JWT token propagation to apiCall()
- Update all service imports to use backend-api.ts

This resolves the duplicate API client issue and ensures all requests
go through the backend BFF layer for proper caching and authentication."
```

---

## 🔧 SEGUNDO PASO: FIJAR TESTS BACKEND (MAÑANA - 2 HORAS)

### Problema actual:
```
❌ 11/11 tests failing in service/tests/schedule.test.ts
Root cause: Middleware injection not working in test environment
```

### Solución:

**Archivo:** `service/src/app.ts`

```typescript
// ✅ INYECTAR GLOBALMENTE (no por ruta)

import { AuthService } from './services/auth.js';

export function createApp(db: DatabaseWrapper): Express {
  const app: Express = express();
  
  // Middleware global para inyectar authService
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.authService = new AuthService(db);
    next();
  });
  
  // ... resto del código ...
}
```

**Luego remover la inyección local en rutas:**

`service/src/routes/auth.ts` - REMOVER:
```typescript
// ❌ ELIMINAR ESTO:
router.use((req, res, next) => {
  req.authService = authService;
  next();
});
```

**Hacer lo mismo en:**
- `routes/blogs.ts`
- `routes/news.ts`
- `routes/events.ts`
- `routes/schedule.ts`
- `routes/products.ts`
- `routes/users.ts`

### Luego correr tests:
```bash
cd service && npm test
# Deberías ver: ✓ tests/schedule.test.ts (11 tests)
```

### Commit:
```bash
git add -A
git commit -m "fix: move authService injection to global middleware

- Move authService injection from individual routes to app.ts
- This fixes the middleware injection issue in tests
- All 11 schedule tests now pass
- More testable and maintainable architecture"
```

---

## 📋 TERCER PASO: IMPLEMENTAR ENDPOINTS FALTANTES (3 HORAS)

### Endpoints que necesitan rutas:

```
# Comments CRUD
❌ GET /api/comments?blog_id=X&news_id=Y&event_id=Z
❌ POST /api/comments
❌ DELETE /api/comments/:id
✅ UPDATE (PUT /api/comments/:id) [optional]

# Donations
❌ GET /api/donations (admin only)
❌ POST /api/donations

# Orders
❌ GET /api/orders (user's orders)
❌ POST /api/orders
❌ PUT /api/orders/:id (update status)
❌ DELETE /api/orders/:id

# Schedule improvements
❌ PUT /api/schedule/:id
❌ DELETE /api/schedule/:id
❌ GET /api/schedule/day/:dayOfWeek
```

### Crear archivo: `service/src/routes/comments.ts`

```typescript
import { Router, Request, Response } from 'express';
import { DatabaseWrapper } from '../config/db-wrapper.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';
import { Comment } from '../types/database.js';

export function createCommentsRouter(db: DatabaseWrapper): Router {
  const router = Router();

  /**
   * GET /api/comments
   * Get comments (filtrar por blog_id, news_id, event_id)
   */
  router.get('/', (req: Request, res: Response) => {
    try {
      const { blog_id, news_id, event_id, approved } = req.query;
      let query = 'SELECT * FROM comments WHERE 1=1';
      const params: any[] = [];

      if (blog_id) {
        query += ' AND blog_id = ?';
        params.push(blog_id);
      }
      if (news_id) {
        query += ' AND news_id = ?';
        params.push(news_id);
      }
      if (event_id) {
        query += ' AND event_id = ?';
        params.push(event_id);
      }
      if (approved !== undefined) {
        query += ' AND approved = ?';
        params.push(approved === 'true' ? 1 : 0);
      }

      const comments = db.getAll<Comment>(query, params);
      res.json({ success: true, data: comments });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch comments';
      res.status(500).json({ success: false, error: msg });
    }
  });

  /**
   * POST /api/comments
   * Create comment (requires auth)
   */
  router.post('/', authenticateToken, (req: Request, res: Response) => {
    try {
      const { content, blog_id, news_id, event_id } = req.body;
      const userId = req.userId!;

      if (!content) {
        res.status(400).json({ success: false, error: 'Content required' });
        return;
      }

      const result = db.run(
        `INSERT INTO comments (content, user_id, blog_id, news_id, event_id, approved)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [content, userId, blog_id || null, news_id || null, event_id || null, 0]
      );

      res.status(201).json({
        success: true,
        data: { id: result.lastID, content, user_id: userId },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create comment';
      res.status(500).json({ success: false, error: msg });
    }
  });

  /**
   * DELETE /api/comments/:id
   * Delete comment (user can delete own, admin can delete any)
   */
  router.delete('/:id', authenticateToken, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.userId!;
      const userRole = req.userRole!;

      const comment = db.getOne<Comment>('SELECT * FROM comments WHERE id = ?', [id]);
      if (!comment) {
        res.status(404).json({ success: false, error: 'Comment not found' });
        return;
      }

      if (userRole !== 'admin' && comment.user_id !== userId) {
        res.status(403).json({ success: false, error: 'Cannot delete others comments' });
        return;
      }

      db.run('DELETE FROM comments WHERE id = ?', [id]);
      res.json({ success: true, message: 'Comment deleted' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete comment';
      res.status(500).json({ success: false, error: msg });
    }
  });

  return router;
}
```

### Agregar en `app.ts`:

```typescript
import { createCommentsRouter } from './routes/comments.js';
// ...
app.use('/api/comments', createCommentsRouter(db));
```

**Idem para donations.ts y orders.ts** (similar estructura)

### Commit:

```bash
git add -A
git commit -m "feat: implement missing CRUD endpoints for comments, donations, orders

- Add GET /api/comments with filtering by blog_id, news_id, event_id
- Add POST /api/comments (authenticated)
- Add DELETE /api/comments/:id (user/admin)
- Add GET/POST /api/donations (for fundraising)
- Add GET/POST/PUT/DELETE /api/orders (for ecommerce)
- Add PUT/DELETE /api/schedule/:id endpoints

These endpoints were defined in database schema but missing from API.
Now frontend can properly manage user-generated content and transactions."
```

---

## 🔐 CUARTO PASO: SEGURIDAD BÁSICA (2 HORAS)

### 1. Rate limiting en login/register

**Archivo:** `service/src/app.ts`

```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5,
  message: 'Demasiados intentos de login, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar en rutas de auth
app.post('/api/auth/login', loginLimiter, ...);
app.post('/api/auth/register', loginLimiter, ...);
```

### 2. Input validation con Zod

**Crear:** `service/src/lib/validators.ts`

```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password too short'),
  displayName: z.string().min(1, 'Name required'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const CreateBlogSchema = z.object({
  title: z.string().min(5, 'Title too short'),
  content: z.string().min(10, 'Content too short'),
  category: z.string().optional(),
  tags: z.string().optional(),
  published: z.boolean().optional(),
});
```

**Usar en rutas:**

```typescript
import { RegisterSchema } from '../lib/validators.js';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    // Procesar validated, no req.body
    const response = await authService.register(validated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors });
      return;
    }
    // ... handle other errors
  }
});
```

### 3. CORS validation

**En producción, VALIDAR variable de entorno:**

```typescript
if (env.NODE_ENV === 'production' && !process.env.CORS_ORIGIN) {
  throw new Error('CORS_ORIGIN must be set in production');
}
```

### Commit:

```bash
git add -A
git commit -m "feat: add rate limiting and input validation

- Add express-rate-limit on auth endpoints
- Add Zod validators for all request schemas
- Validate CORS_ORIGIN in production
- Prevents abuse and ensures data integrity"
```

---

## ✅ CHECKLIST PARA HOY

```
Mañana por la mañana, antes de empezar:

□ Decidir: ¿SQL.js o Supabase para DB?
□ Decidir: ¿Backend JWT o Supabase Auth?
□ Decidir: ¿Cuál es la URL real de AzuraCast?

Luego (orden importante):

□ PASO 1 - Consolidar API clients (2-3h)
  □ Remover modules/azuracast/api/client.ts
  □ Actualizar PlayerContext
  □ Agregar JWT propagation
  □ Commit

□ PASO 2 - Fijar tests backend (2h)
  □ Mover authService a global middleware
  □ Correr tests, verificar pasen
  □ Commit

□ PASO 3 - Endpoints faltantes (3h)
  □ Crear comments.ts router
  □ Crear donations.ts router
  □ Crear orders.ts router
  □ Agregar en app.ts
  □ Commit

□ PASO 4 - Seguridad (2h)
  □ Instalar express-rate-limit
  □ Crear validators.ts con Zod
  □ Aplicar en rutas
  □ Commit

□ VERIFICACIÓN FINAL (1h)
  □ npm run build en ambos
  □ npm run test en ambos
  □ No hay errores
  □ Documentar cambios en README
```

---

## 📊 DESPUÉS DE COMPLETAR ESTO

Tu proyecto estará en:

| Métrica | Antes | Después |
|---------|-------|---------|
| Tests Backend | 0/11 ✅ | 11/11 ✅ |
| API Clients | 2 incompatibles ❌ | 1 único ✅ |
| JWT Propagation | No ❌ | Sí ✅ |
| Rate Limiting | No ❌ | Sí ✅ |
| Endpoints | 15/26 (58%) ❌ | 26/26 (100%) ✅ |
| Input Validation | Manual ⚠️ | Zod ✅ |
| Security | Básica ⚠️ | Endurecida ✅ |
| Production Ready | NO ❌ | SÍ ✅ |

---

## 🚨 SIGUIENTES PASOS (DESPUÉS)

Una vez completes los 4 pasos anteriores:

**Semana 2:**
- [ ] WebSockets para live updates (opcional)
- [ ] Mejorar caché con ETags
- [ ] Tests de integración frontend-backend
- [ ] Documentación OpenAPI

**Semana 3:**
- [ ] Performance testing
- [ ] Load testing
- [ ] Security audit
- [ ] Deployment checklist

---

## 📞 SOPORTE

Si tienes preguntas o bloqueos:

1. Revisa `ANALISIS_CRITICO_PROYECTO.md` - tiene todo el contexto técnico
2. Revisa `RESUMEN_REVISION_PROYECTO.md` - resumen ejecutivo
3. Este archivo `ACTION_PLAN.md` - steps específicos

---

**Nota:** No es bonito, pero ES SEGURO Y ESCALABLE. Eso es lo que importa.

Go build something great. 🚀

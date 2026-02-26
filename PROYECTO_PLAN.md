# 📋 Plan de Desarrollo - Proyecto Radio Cesar (v2)

## Visión General
Arquitectura modular con 3 módulos independientes:
1. **AUTH Module** - Autenticación con OAuth (Google, Facebook, Apple ID)
2. **BLOG Module** - Gestión de noticias, sesiones de usuarios y métricas
3. **AZURACAST Integration** - Integración completa con API de streaming

---

## 🎯 FASE 1: Infraestructura Base + Autenticación

### Descripción
Establecer la arquitectura base, configurar proveedores de autenticación OAuth y preparar la estructura modular.

### Tareas Detalladas

#### 1.1 - Refactorizar estructura modular
- [ ] Crear carpeta `/src/modules/` con 3 subdirectorios: `auth`, `blog`, `azuracast`
- [ ] Crear un archivo `index.ts` en cada módulo para exportar su API pública
- [ ] Implementar barrel pattern para evitar imports complejos
- [ ] Actualizar imports en componentes existentes a nuevo patrón modular
- [ ] Documentar la estructura en `MODULES.md`

#### 1.2 - Configurar Clerk Auth (opción recomendada - free tier con OAuth)
- [ ] Crear cuenta en Clerk (clerk.com)
- [ ] Generar API keys (Public y Secret)
- [ ] Instalar paquete: `npm install @clerk/clerk-react`
- [ ] Crear `/src/modules/auth/config/clerkConfig.ts`
- [ ] Configurar `ClerkProvider` en App.tsx
- [ ] Implementar Google OAuth integration en Clerk Dashboard
- [ ] Implementar Facebook OAuth integration en Clerk Dashboard
- [ ] Implementar Apple ID OAuth integration en Clerk Dashboard

#### 1.3 - Crear componentes auth base
- [ ] Componente `AuthProvider` que envuelva ClerkProvider
- [ ] Componente `LoginPage.tsx` con botones: "Sign in with Google", "Sign in with Facebook", "Sign in with Apple"
- [ ] Componente `RegisterPage.tsx` (reutilizar LoginPage con variant)
- [ ] Componente `UserProfile.tsx` con datos del usuario autenticado
- [ ] Hook `useAuth()` que exponga: `user`, `isLoaded`, `signOut()`
- [ ] Rutas protegidas con `ProtectedRoute` HOC

#### 1.4 - Integrar variables de entorno
- [ ] Agregar a `.env`:
  ```
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
  VITE_CLERK_SECRET_KEY=sk_test_...
  ```
- [ ] Validar que existan en dev mode
- [ ] Crear `.env.example` con placeholders
- [ ] Documentar en README.md

#### 1.5 - Pruebas de auth
- [ ] Crear test: `modules/auth/hooks/useAuth.test.tsx`
- [ ] Crear test: `modules/auth/components/LoginPage.test.tsx`
- [ ] Ejecutar: `npm run test -- auth`

**Salida esperada:**
- ✅ Estructura modular funcional
- ✅ Clerk integrado con OAuth (Google, Facebook, Apple ID)
- ✅ Usuarios pueden iniciar sesión y ver perfil
- ✅ Rutas protegidas funcionando

---

## 🎯 FASE 2: Módulo Blog + Base de Datos SQLite

### Descripción
Implementar sistema de blog con noticias, sesiones de usuarios y métricas persistidas en SQLite.

### Tareas Detalladas

#### 2.1 - Configurar SQLite para desarrollo
- [ ] Instalar: `npm install better-sqlite3 sql.js` (usar sql.js para compatibility)
- [ ] Crear carpeta `/src/modules/blog/db/`
- [ ] Crear archivo `schema.sql` con tablas:
  ```sql
  CREATE TABLE posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    featured BOOLEAN DEFAULT FALSE
  );
  
  CREATE TABLE metrics (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    user_id TEXT,
    event_type TEXT (view|comment|share),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id)
  );
  
  CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    duration_ms INTEGER
  );
  ```
- [ ] Crear archivo `db.ts` con funciones CRUD básicas
- [ ] Implementar inicialización automática de schema en mount

#### 2.2 - Crear API de Blog (módulo)
- [ ] Crear `/src/modules/blog/api/posts.ts` con:
  - `getPosts()` - Obtener todos los posts
  - `getPostById(id)` - Obtener post individual
  - `createPost(data)` - Crear nuevo post (solo admin)
  - `updatePost(id, data)` - Actualizar post
  - `deletePost(id)` - Eliminar post (solo admin)
- [ ] Crear `/src/modules/blog/api/metrics.ts` con:
  - `trackView(postId, userId)` - Registrar visualización
  - `trackComment(postId, userId)` - Registrar comentario
  - `trackShare(postId, userId)` - Registrar compartir
  - `getPostMetrics(postId)` - Obtener métricas de un post
  - `getUserMetrics(userId)` - Obtener métricas de usuario

#### 2.3 - Crear componentes de Blog
- [ ] Componente `BlogPage.tsx` - Página principal con listado de posts
- [ ] Componente `BlogPostCard.tsx` - Tarjeta individual de post
- [ ] Componente `BlogDetailPage.tsx` - Detalle de un post
- [ ] Componente `BlogAdminPanel.tsx` - Panel admin para crear/editar posts
- [ ] Componente `BlogMetricsDashboard.tsx` - Dashboard con métricas

#### 2.4 - Implementar tracking de sesiones
- [ ] Hook `useSessionTracking()` que:
  - Inicie sesión al montar component root
  - Registre timestamp de inicio
  - Calcule duración al desmontar
  - Guarde en BD al desmontar
- [ ] Integrar en `src/App.tsx`

#### 2.5 - Pruebas del módulo Blog
- [ ] Test: `modules/blog/api/posts.test.ts`
- [ ] Test: `modules/blog/api/metrics.test.ts`
- [ ] Test: `modules/blog/hooks/useBlogPosts.test.tsx`
- [ ] Ejecutar: `npm run test -- blog`

**Salida esperada:**
- ✅ SQLite funcional con datos persistidos
- ✅ CRUD de posts operativo
- ✅ Sistema de métricas registrando eventos
- ✅ Sesiones de usuarios tracked
- ✅ Dashboard mostrando datos

---

## 🎯 FASE 3: Integración AzuraCast Completa

### Descripción
Integración full-stack con API de AzuraCast para mostrar al usuario todo lo relacionado con streaming.

### Tareas Detalladas

#### 3.1 - Refactorizar módulo AzuraCast
- [ ] Mover `src/lib/azuracast.ts` → `src/modules/azuracast/api/client.ts`
- [ ] Crear tipos en `src/modules/azuracast/types/index.ts`
- [ ] Crear `src/modules/azuracast/services/stationService.ts` con:
  - `getStationInfo()` - Información de la estación
  - `getListeners()` - Contador de oyentes actual
  - `getUptime()` - Tiempo de funcionamiento
- [ ] Crear `src/modules/azuracast/services/playlistService.ts` con:
  - `getPlaylists()` - Listar playlists
  - `getPlaylistSongs(playlistId)` - Canciones en playlist
  - `getSongDetails(songId)` - Detalles de canción

#### 3.2 - Mejorar context de Player
- [ ] Actualizar `PlayerContext.tsx` para usar nueva estructura modular
- [ ] Agregar estado para:
  - `currentStation` - Estación actual
  - `currentPlaylist` - Playlist actual
  - `upcomingSongs` - Próximas canciones
  - `listeners` - Oyentes conectados
  - `stationInfo` - Info de la estación
- [ ] Implementar polling mejorado con exponential backoff
- [ ] Agregar manejo de errores con reintentos

#### 3.3 - Crear páginas de AzuraCast
- [ ] Página `NowPlayingPage.tsx` (mejorada) con:
  - Canción actual con artwork
  - Información del artista
  - Oyentes conectados en tiempo real
  - Botón play/pause
  - Próximas canciones (queue)
- [ ] Página `StationInfoPage.tsx` con:
  - Nombre y descripción de estación
  - Logos/branding
  - Uptime
  - Estadísticas de oyentes
- [ ] Página `PlaylistsPage.tsx` con:
  - Listado de playlists activos
  - Canciones por playlist
  - Búsqueda de canciones

#### 3.4 - Dashboard integrado
- [ ] Crear `modules/azuracast/pages/Dashboard.tsx` que combina:
  - Widget de now playing (pequeño)
  - Widget de oyentes (gráfico)
  - Widget de playlists recientes
  - Widget de top songs

#### 3.5 - Error handling y UX
- [ ] Implementar retry logic en conexiones fallidas
- [ ] Toast notifications para desconexiones
- [ ] Loading states en componentes
- [ ] Fallback UI cuando API no responde
- [ ] Documentar límites de rate limiting

#### 3.6 - Pruebas de AzuraCast
- [ ] Test: `modules/azuracast/services/stationService.test.ts`
- [ ] Test: `modules/azuracast/services/playlistService.test.ts`
- [ ] Test: `modules/azuracast/pages/NowPlayingPage.test.tsx`
- [ ] Mock de API responses en tests
- [ ] Ejecutar: `npm run test -- azuracast`

#### 3.7 - Documentación de API
- [ ] Crear `MODULES.md` con guía de cada módulo
- [ ] Crear `API_REFERENCE.md` con endpoints usados
- [ ] Documentar rate limits y good practices
- [ ] Crear ejemplos de uso para cada servicio

**Salida esperada:**
- ✅ AzuraCast completamente integrado
- ✅ Usuario ve canción actual, oyentes, playlists
- ✅ Dashboard con todas las métricas
- ✅ Manejo robusto de errores
- ✅ Tests pasando

---

## 📊 Matriz de Dependencias Entre Fases

```
FASE 1: AUTH ────────────────┐
                             │
                             ├─→ FASE 3: AZURACAST (NO DEPENDE)
                             │
FASE 2: BLOG ────────────────┘
```

**Nota:** Las fases 2 y 3 son independientes. Pueden ejecutarse en paralelo después de FASE 1.

---

## 🔧 Stack Tecnológico Final

### Autenticación
- **Clerk** - Manejo de OAuth + sessions
- **Google OAuth 2.0**
- **Facebook Login**
- **Apple Sign In**

### Base de Datos (Dev)
- **sql.js** - SQLite en navegador (development)
- Migración a PostgreSQL/Supabase para producción

### Radio Streaming
- **AzuraCast API** - Source de truth para datos de radio

### Frontend
- React 18.3.1
- TypeScript 5.8.3
- Tailwind + Shadcn/UI
- Vitest para testing
- i18next para i18n

---

## 📈 Métricas de Éxito

Al finalizar:
- ✅ 3 módulos independientes y testables
- ✅ Autenticación OAuth funcional (3 providers)
- ✅ Sistema de blog con 100+ eventos trackeados
- ✅ Integración AzuraCast sin disrupciones
- ✅ Cobertura de tests >80% en módulos core
- ✅ Documentación completa
- ✅ Zero console errors en dev

---

## ⏱️ Estimación de Tiempo

| Fase | Tareas | Duración Est. | Dependencias |
|------|--------|---------------|--------------|
| 1    | 5      | 3-4 días      | Ninguna      |
| 2    | 5      | 3-4 días      | Fase 1       |
| 3    | 7      | 4-5 días      | Fase 1       |
| **Total** | **17** | **10-13 días** | - |

---

## 🚀 Siguientes Pasos Inmediatos

1. Crear estructura modular (`/src/modules/`)
2. Registrarse en Clerk.com
3. Configurar OAuth apps (Google, Facebook, Apple)
4. Implementar ClerkProvider
5. Comenzar FASE 1


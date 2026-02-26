# 🏗️ Arquitectura Modular - Proyecto Radio Cesar

## Visión General

La aplicación está dividida en **3 módulos independientes** siguiendo el patrón de **Barrel Exports** para facilitar imports y mantener bajo acoplamiento.

```
src/modules/
├── auth/       → Autenticación OAuth (Clerk)
├── blog/       → Sistema de noticias y métricas
└── azuracast/  → Integración con API de radio
```

---

## 📦 Módulo: AUTH

**Responsabilidad:** Autenticación de usuarios con OAuth (Google, Facebook, Apple ID) usando Clerk.

### Estructura
```
src/modules/auth/
├── types/
│   └── auth.ts                 # Interfaces y tipos
├── components/
│   ├── AuthProvider.tsx        # Provider wrapper con Clerk
│   ├── LoginPage.tsx           # Página de login
│   ├── RegisterPage.tsx        # Página de registro
│   ├── UserProfile.tsx         # Perfil del usuario
│   └── ProtectedRoute.tsx      # HOC para rutas protegidas
├── hooks/
│   └── useAuth.ts              # Hook personalizado
├── pages/
│   └── (reutiliza components)
├── config/
│   └── clerkConfig.ts          # Configuración de Clerk
└── index.ts                    # Barrel export
```

### API Pública
```typescript
// Hook
import { useAuth } from '@/modules/auth';
const { user, isSignedIn, signOut } = useAuth();

// Componentes
import { AuthProvider, ProtectedRoute, UserProfile } from '@/modules/auth';
import { LoginPage, RegisterPage } from '@/modules/auth';

// Tipos
import type { AuthUser, AuthContextType } from '@/modules/auth';
```

### Flujo de Autenticación
1. Usuario abre app
2. `AuthProvider` envuelve el árbol de componentes
3. Usuario hace click en "Sign in with Google" (u otro provider)
4. Clerk maneja OAuth flow
5. Usuario autenticado, datos guardados en Clerk
6. `useAuth()` expone `user` y estado de autenticación
7. `ProtectedRoute` protege rutas privadas

---

## 📰 Módulo: BLOG

**Responsabilidad:** Gestión de noticias, tracking de usuarios y métricas en SQLite.

### Estructura
```
src/modules/blog/
├── types/
│   └── blog.ts                 # Interfaces (Post, Metric, Session)
├── api/
│   ├── posts.ts                # CRUD de posts
│   ├── metrics.ts              # Tracking de eventos
│   └── index.ts                # Barrel export
├── db/
│   ├── schema.sql              # Esquema de BD
│   ├── db.ts                   # Inicialización SQLite
│   └── migrations/             # (para futuro)
├── hooks/
│   ├── useBlogPosts.ts         # Hook para posts
│   ├── useMetrics.ts           # Hook para métricas
│   └── useSessionTracking.ts   # Hook para sesiones
├── components/
│   ├── BlogPostCard.tsx        # Tarjeta de post
│   ├── BlogAdminPanel.tsx      # Panel admin
│   ├── BlogMetricsDashboard.tsx # Dashboard de métricas
│   └── BlogCommentSection.tsx  # Sección de comentarios
├── pages/
│   ├── BlogPage.tsx            # Listado de posts
│   └── BlogDetailPage.tsx      # Detalle de post
└── index.ts                    # Barrel export
```

### API Pública
```typescript
// Hooks
import { useBlogPosts, useMetrics, useSessionTracking } from '@/modules/blog';

// Componentes
import { BlogPage, BlogDetailPage, BlogAdminPanel, BlogMetricsDashboard } from '@/modules/blog';

// APIs directas
import { postsAPI, metricsAPI } from '@/modules/blog';

// Tipos
import type { Post, Metric, UserSession, PostMetrics } from '@/modules/blog';
```

### Base de Datos
**Proveedor (Dev):** SQLite en navegador (sql.js)
**Tablas:**
- `posts` - Artículos del blog
- `metrics` - Eventos (view, comment, share)
- `user_sessions` - Sesiones de usuarios

### Ejemplo de Uso
```typescript
function BlogComponent() {
  const { posts, loading } = useBlogPosts();
  const { trackView } = useMetrics();

  useEffect(() => {
    trackView(postId, userId);
  }, [postId]);

  return <div>{/* ... */}</div>;
}
```

---

## 🎙️ Módulo: AZURACAST

**Responsabilidad:** Integración completa con API de AzuraCast para datos de streaming.

### Estructura
```
src/modules/azuracast/
├── types/
│   └── azuracast.ts            # Interfaces (Station, Song, Playlist)
├── api/
│   └── client.ts               # Cliente HTTP para API
├── services/
│   ├── stationService.ts       # Servicios de estación
│   ├── playlistService.ts      # Servicios de playlists
│   └── index.ts                # Barrel export
├── hooks/
│   ├── useAzuracastStation.ts  # Hook de estación
│   ├── useAzuracastPlaylist.ts # Hook de playlists
│   └── useAzuracastNowPlaying.ts # Hook de canción actual
├── components/
│   ├── NowPlayingWidget.tsx    # Widget de canción actual
│   ├── ListenersWidget.tsx     # Widget de oyentes
│   └── PlaylistWidget.tsx      # Widget de playlists
├── pages/
│   ├── NowPlayingPage.tsx      # Detalle completo
│   ├── StationInfoPage.tsx     # Info de estación
│   ├── PlaylistsPage.tsx       # Listado de playlists
│   └── Dashboard.tsx           # Dashboard integrado
└── index.ts                    # Barrel export
```

### API Pública
```typescript
// Hooks
import { useAzuracastStation, useAzuracastPlaylist } from '@/modules/azuracast';

// Servicios
import { stationService, playlistService } from '@/modules/azuracast';

// Componentes
import { NowPlayingPage, StationInfoPage, PlaylistsPage, Dashboard } from '@/modules/azuracast';

// Tipos
import type { Station, Song, Playlist, NowPlaying } from '@/modules/azuracast';
```

### Servicios Disponibles

#### Station Service
```typescript
import { stationService } from '@/modules/azuracast';

// Obtener info de estación
const info = await stationService.getStationInfo();

// Obtener oyentes actuales
const listeners = await stationService.getListeners();

// Obtener uptime
const uptime = await stationService.getUptime();
```

#### Playlist Service
```typescript
import { playlistService } from '@/modules/azuracast';

// Listar playlists
const playlists = await playlistService.getPlaylists();

// Obtener canciones de playlist
const songs = await playlistService.getPlaylistSongs(playlistId);

// Detalles de canción
const song = await playlistService.getSongDetails(songId);
```

---

## 🔄 Comunicación Entre Módulos

### Dependencias Permitidas
```
Auth ────────┐
             │
             ├─→ Blog (usa user de Auth)
             │
             └─→ AzuraCast (no requiere Auth)

Blog ─────────→ Puede usar datos de Auth
AzuraCast ───→ Autónomo
```

### Ejemplo: Blog usa Auth
```typescript
// En BlogAdminPanel.tsx
import { useAuth } from '@/modules/auth';
import { postsAPI } from '@/modules/blog';

export function BlogAdminPanel() {
  const { user, isSignedIn } = useAuth();
  
  // Solo admin puede crear posts
  if (!isSignedIn || user?.role !== 'admin') {
    return <AccessDenied />;
  }

  const handleCreatePost = async (data) => {
    await postsAPI.createPost({
      ...data,
      authorId: user.id,
    });
  };
}
```

---

## 🎯 Convenciones de Cada Módulo

### Imports Dentro del Módulo
```typescript
// ✓ Bien - usar rutas relativas dentro del mismo módulo
import { postsAPI } from './api/posts';

// ✗ Evitar - no usar @/modules/blog desde dentro de blog
import { postsAPI } from '@/modules/blog';
```

### Imports Desde Otros Módulos
```typescript
// ✓ Bien - usar barrel export del módulo
import { useAuth } from '@/modules/auth';

// ✗ Evitar - no importar internals de otro módulo
import { someInternalHook } from '@/modules/auth/hooks/internal';
```

### Nombres de Archivos
- **Componentes:** PascalCase (`BlogPostCard.tsx`)
- **Hooks:** camelCase con prefix `use` (`useBlogPosts.ts`)
- **Servicios:** camelCase (`stationService.ts`)
- **APIs:** camelCase con suffix `API` o `Api` (`postsAPI.ts`)
- **Tipos:** camelCase con suffix `Type` o solo interface (`auth.ts`)

---

## 🧪 Testing en Módulos

Cada módulo tiene tests colocados según su ubicación:

```bash
# Test módulo auth
npm run test -- auth

# Test módulo blog
npm run test -- blog

# Test módulo azuracast
npm run test -- azuracast

# Test archivo específico
npm run test -- src/modules/blog/hooks/useBlogPosts.test.ts
```

---

## 📝 Migración del Código Existente

### Paso 1: Auth
- Mover lógica de autenticación a `/src/modules/auth/`
- Reemplazar imports en componentes

### Paso 2: AzuraCast
- Mover `/src/lib/azuracast.ts` → `/src/modules/azuracast/api/client.ts`
- Actualizar PlayerContext para usar nuevo módulo

### Paso 3: Blog
- Crear todo desde cero en `/src/modules/blog/`
- Integrar con Auth y AzuraCast según sea necesario

---

## 🚀 Checklist para Nuevo Módulo

Si en el futuro necesitas agregar un nuevo módulo:

- [ ] Crear carpeta en `src/modules/nombreModulo/`
- [ ] Crear subdirectorios: `types/`, `components/`, `hooks/`, `services/`, `api/`
- [ ] Crear `index.ts` con barrel exports
- [ ] Documentar tipos en `types/`
- [ ] Implementar servicios/APIs
- [ ] Crear componentes
- [ ] Crear hooks personalizados
- [ ] Escribir tests
- [ ] Actualizar sección en este archivo


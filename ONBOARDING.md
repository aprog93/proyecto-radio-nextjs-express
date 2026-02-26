# GUÍA DE ONBOARDING - Proyecto Radio Cesar

## Para Nuevos Desarrolladores

---

## 📦 Requisitos Previos

```bash
# Verify installations
node --version          # Should be 20+
npm --version          # Should be 9+
pnpm --version         # Should be 10+
git --version          # Any recent version
```

Si no tienes pnpm:
```bash
npm install -g pnpm
```

---

## 🚀 Setup Inicial (5 minutos)

### 1. Clonar Repositorio
```bash
git clone <repo-url> proyecto-radio-cesar
cd proyecto-radio-cesar
```

### 2. Instalar Dependencias

**Backend:**
```bash
cd service
pnpm install
```

**Frontend:**
```bash
cd ../community-stream-connect
npm install
```

### 3. Configurar Variables de Entorno

**Backend (`service/.env`):**
```bash
cp .env.example .env

# Solo cambiar si tienes AzuraCast diferente:
# AZURACAST_BASE_URL=https://tu-azuracast.com
# AZURACAST_STATION_ID=1
```

**Frontend (`community-stream-connect/.env`):**
```bash
cp .env.example .env

# Dejar defaults:
# VITE_BACKEND_URL=http://localhost:3000
```

### 4. Iniciar Servidor

**Terminal 1 - Backend:**
```bash
cd service
pnpm run dev

# Esperar: "✅ Ready to accept connections"
# Backend en http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd community-stream-connect
npm run dev

# Esperar: "Local: http://localhost:5173"
# Frontend en http://localhost:5173
```

### 5. Verificar que Funciona
```bash
# En otra terminal, verifica:
curl http://localhost:3000/health
# Debería responder con status: "ok"

# Abre http://localhost:5173 en navegador
# Debería cargar la app
```

✅ **Ready to code!**

---

## 📂 Estructura del Proyecto

### Los 2 Directorios Principales

```
proyecto-radio-cesar/
├── service/                        ← BACKEND (Express.js)
│   └── src/
│       ├── routes/                 Endpoints (/api/station, /api/auth)
│       ├── services/               Business logic (azuracast, token)
│       ├── middleware/             Auth, error handling
│       ├── lib/                    Utilities (cache)
│       └── types/                  TypeScript interfaces
│
├── community-stream-connect/       ← FRONTEND (React)
│   └── src/
│       ├── pages/                  24 páginas (rutas principales)
│       ├── modules/
│       │   └── azuracast/         Feature: Radio streaming
│       ├── components/             UI components (shadcn)
│       ├── context/                Global state (Player, Auth)
│       ├── hooks/                  Custom React hooks
│       └── lib/
│           ├── backend-api.ts      BFF client (usa /api)
│           └── utils.ts            Utilidades
```

**Regla de Oro:**
- Backend: `service/src/` 
- Frontend: `community-stream-connect/src/`

---

## 🔄 Flujo de Datos (IMPORTANTE)

```
Usuario interactúa con UI
         ↓
React component llama hook
         ↓
Hook llama backend-api.ts (GET /api/station/now-playing)
         ↓
Backend recibe request
  ├─ Check cache (60s)
  ├─ If hit: return cached data
  └─ If miss:
      ├─ Call AzuraCast API
      ├─ Cache result
      └─ Return to frontend
         ↓
Frontend actualiza state
         ↓
UI re-renders
```

**Nunca** llames a AzuraCast directamente desde frontend.  
**Siempre** pasa por backend.

---

## 💻 Tareas Comunes

### Agregar una Nueva Página

**1. Crear componente:**
```bash
# community-stream-connect/src/pages/NewPage.tsx

import { useTranslation } from 'react-i18next';

export default function NewPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('pages.new.title')}</h1>
    </div>
  );
}
```

**2. Agregar ruta en `App.tsx`:**
```tsx
import NewPage from '@/pages/NewPage';

// En <Routes>:
<Route path="/new" element={<NewPage />} />
```

**3. Agregar traducción:**
```bash
# community-stream-connect/src/i18n/locales/es.json
{
  "pages": {
    "new": {
      "title": "Nueva Página"
    }
  }
}
```

**4. Test:**
```bash
# community-stream-connect/src/pages/NewPage.test.tsx
import { render, screen } from '@testing-library/react';
import NewPage from './NewPage';

test('renders title', () => {
  render(<NewPage />);
  expect(screen.getByRole('heading')).toBeInTheDocument();
});
```

### Agregar un Endpoint en el Backend

**1. Crear ruta:**
```bash
# service/src/routes/myfeature.ts

import { Router, Request, Response } from 'express';
import { success, error } from '@/types/api';

const router: Router = Router();

router.get('/my-endpoint', async (req: Request, res: Response) => {
  try {
    const data = await myService.getData();
    res.json(success(data));
  } catch (err) {
    res.status(500).json(error('Failed'));
  }
});

export default router;
```

**2. Registrar ruta en `app.ts`:**
```ts
import myfeatureRoutes from '@/routes/myfeature';

app.use('/api/myfeature', optionalAuthMiddleware, myfeatureRoutes);
```

**3. Usar en frontend:**
```ts
// community-stream-connect/src/lib/backend-api.ts
const response = await apiCall<MyType>('/myfeature/my-endpoint');
```

### Escribir un Test

**Frontend (Vitest):**
```bash
# community-stream-connect/src/modules/azuracast/services/stationService.test.ts

import { describe, it, expect } from 'vitest';
import { getNowPlaying } from './stationService';

describe('stationService', () => {
  it('should fetch now playing', async () => {
    const result = await getNowPlaying(1);
    expect(result).toBeDefined();
  });
});
```

**Backend (Vitest):**
```bash
# service/src/__tests__/lib/cache.test.ts

import { describe, it, expect } from 'vitest';
import { cache } from '@/lib/cache';

describe('Cache', () => {
  it('should set and get values', () => {
    cache.set('key', 'value');
    expect(cache.get('key')).toBe('value');
  });
});
```

**Correr tests:**
```bash
# Frontend
cd community-stream-connect
npm run test        # Run once
npm run test:watch  # Watch mode

# Backend
cd service
pnpm run test
pnpm run test:watch
```

---

## 📖 Leer Primero

En este orden:

1. **Este archivo** (onboarding)
2. `README.md` - Visión general del proyecto
3. `FASE_1_BACKEND_RESUMEN.md` - Backend specifics
4. `INTEGRACION_BACKEND_FRONTEND.md` - Cómo se conectan

Luego, según tu área:

**Si trabajas Frontend:**
- `FASE_1_1_RESUMEN.md` - React structure
- `FASE_3_TESTING_RESUMEN.md` - Testing

**Si trabajas Backend:**
- `service/README.md` - Backend setup
- Backend code (empezar por `src/services/azuracast.ts`)

---

## 🧪 Testing Workflow

### Antes de Hacer Commit

```bash
# Backend
cd service
pnpm run build      # Check TypeScript
pnpm run lint       # Check code style
pnpm run test       # Run tests

# Frontend
cd ../community-stream-connect
npm run build       # Check Vite build
npm run lint        # Check code style
npm run test        # Run unit tests
npm run e2e         # Run E2E tests (Cypress)
```

**Si alguno falla, NO hagas push.**

### Test-Driven Development (TDD)

```bash
# Watch mode - cambios auto-triggering tests
cd service && pnpm run test:watch
cd community-stream-connect && npm run test:watch

# Workflow:
# 1. Write test
# 2. See it fail (RED)
# 3. Write code
# 4. See it pass (GREEN)
# 5. Refactor (REFACTOR)
```

---

## 📝 Convenciones de Código

### Variables & Functions

```typescript
// ✅ GOOD
const nowPlaying: NowPlaying = data;
const streamUrl = 'https://...';
export const fetchNowPlaying = async (): Promise<NowPlaying> => {};
const _internalHelper = () => {};  // Private

// ❌ BAD
const np = data;
const url = 'https://...';
export async function fetchNowPlaying() {};  // No return type
```

### Imports

```typescript
// ✅ Order: External → Internal → Relative
import React from 'react';
import { useTranslation } from 'react-i18next';

import { usePlayer } from '@/context/PlayerContext';
import { Button } from '@/components/ui/button';

import { localHelper } from './helper';

// ❌ BAD - Random order
import { localHelper } from './helper';
import React from 'react';
import { Button } from '@/components/ui/button';
```

### Comments

```typescript
// ✅ GOOD - Explain WHY
// Only update if stream URL changed (avoid unnecessary resets)
if (prev !== data.station.listen_url) return data.station.listen_url;

/**
 * Fetch now-playing metadata from AzuraCast API
 * @returns Promise<AzuraNowPlayingResponse>
 */
export async function fetchNowPlaying(): Promise<...> {}

// ❌ BAD - Obvious comments
// Get now playing
const np = await fetchNowPlaying();
```

---

## 🐛 Debugging

### Backend

```bash
# Verbose logging
DEBUG=* pnpm run dev

# Add console.log (it shows in terminal)
console.log('Debug:', { data });

# Use debugger
node --inspect-brk dist/index.js
# Then: chrome://inspect
```

### Frontend

```bash
# React DevTools extension (install in Chrome)
chrome://extensions → Find "React Developer Tools"

# Console logging
console.log('Debug:', { data });

# Debugger in code
debugger;  // Pauses execution if DevTools open

# Browser DevTools
F12 → Sources tab → Set breakpoints
```

### Network Issues

```bash
# Check if endpoints exist
curl http://localhost:3000/health
curl http://localhost:3000/api/station/now-playing

# Check CORS
# Open browser console (F12 → Console)
# Look for "Access-Control-Allow-Origin" errors

# Check env vars
cat service/.env
cat community-stream-connect/.env
```

---

## 🚀 Deployment Preview

### Local Docker

```bash
# Build images
docker build -t radio-cesar-backend ./service
docker build -t radio-cesar-frontend ./community-stream-connect

# Run with compose
docker compose up

# Access on http://localhost
```

### Cloud Deployment (Later)

- **Vercel:** Frontend only
- **Railway:** Both services
- **Docker Hub + AWS:** Full stack

Details in `README.md` → Deployment section.

---

## 📞 Ayuda & Troubleshooting

### "Port already in use"
```bash
# Kill process using port
lsof -i :3000 | grep LISTEN
kill -9 <PID>

# Or use different port
PORT=3001 pnpm run dev
```

### "Cannot find module '@/...'"
```bash
# Check tsconfig.json has paths configured
cat tsconfig.json | grep paths

# Should show: "@/*": ["src/*"]

# If not in sync:
cd service && npm run build
cd ../community-stream-connect && npm run build
```

### "Tests failing"
```bash
# Clear cache
rm -rf node_modules/.vitest
pnpm run test

# Or rebuild TypeScript
npm run build
```

### "Backend can't reach AzuraCast"
```bash
# Check URL
curl https://demo.azuracast.com/api/nowplaying/1

# Check env var
cat service/.env | grep AZURACAST_BASE_URL

# If firewall blocks, use proxy or different URL
```

### "Frontend not seeing backend data"
```bash
# Check Network tab (F12)
# Should see: GET http://localhost:3000/api/station/now-playing

# If no request: check .env
cat community-stream-connect/.env | grep VITE_BACKEND

# If wrong response: check backend logs
# Should see: [timestamp] GET /api/station/now-playing
```

---

## ✅ Checklist: Antes de Hacer Commit

- [ ] Código compila sin errores
- [ ] Todos los tests pasan
- [ ] Lint check OK
- [ ] Commit message es descriptivo
- [ ] No hay `console.log()` en producción
- [ ] No hay secrets en código
- [ ] Documentaste cambios si aplica

---

## 🎯 Quick References

### Important Files

| File | Purpose |
|------|---------|
| `service/src/routes/station.ts` | AzuraCast proxy endpoints |
| `service/src/services/azuracast.ts` | AzuraCast API client |
| `community-stream-connect/src/lib/backend-api.ts` | Frontend BFF client |
| `community-stream-connect/src/modules/azuracast/` | Radio feature |
| `community-stream-connect/src/context/PlayerContext.tsx` | Global player state |

### Common Commands

```bash
# Backend
pnpm run dev          # Start dev server
pnpm run build        # Compile TypeScript
pnpm run test         # Run tests
pnpm run test:watch   # Watch mode

# Frontend
npm run dev           # Start dev server
npm run build         # Build for production
npm run test          # Run tests
npm run e2e           # Run E2E tests
npm run lint          # Check code style
```

---

## 📚 Resources

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org
- **Express:** https://expressjs.com
- **Vite:** https://vitejs.dev
- **Testing Library:** https://testing-library.com
- **Cypress:** https://cypress.io

---

## 🎓 Learning Path

### Week 1 - Understanding the Codebase
1. Read all FASE documents
2. Run local dev server
3. Explore files structure
4. Read test files to understand patterns

### Week 2 - Small Changes
1. Fix a small bug
2. Add a test
3. Update documentation
4. Make first commit

### Week 3 - Feature Development
1. Pick a feature from ROADMAP
2. Follow TDD (test first)
3. Write code
4. Get code review

### Month 2 - Ownership
1. Own a module (e.g., auth, blog)
2. Design & implement new features
3. Review others' PRs
4. Mentor new team members

---

## 💡 Tips for Success

1. **Always start with tests** - TDD prevents bugs
2. **Read error messages carefully** - They tell you exactly what's wrong
3. **Use TypeScript strictly** - It catches many bugs at compile time
4. **Document as you code** - Future you will thank present you
5. **Ask questions** - No stupid questions, only unclear requirements
6. **Keep commits small** - One feature per commit, easier to review
7. **Run tests before push** - Catch issues early
8. **Read existing code** - Learn from patterns in codebase

---

**You're ready! Pick an issue and start coding.** 🚀

For questions: Check documentation first → Ask team → Open issue.

Good luck! 🎉

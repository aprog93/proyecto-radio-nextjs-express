# AGENTS.md - Development Guidelines for Agentic Coding

## Project Overview
**Proyecto Radio Cesar** - Community radio streaming platform built with React 18, TypeScript, Shadcn/UI, Supabase, and AzuraCast integration.
**Workspace Root:** `/home/aprog93/Documents/workspace/proyecto-radio-cesar/`
**Main App:** `community-stream-connect/`

---

## Build & Deployment Commands

### Development
```bash
cd community-stream-connect && npm run dev
# Vite dev server on http://localhost:5173 (HMR enabled)
```

### Production Build
```bash
cd community-stream-connect && npm run build
# Output: dist/ (ES2020, minified, SSR-ready)
```

### Linting & Type Checking
```bash
cd community-stream-connect && npm run lint
# ESLint + TypeScript (no auto-fix; review manually)
```

### Testing
```bash
cd community-stream-connect && npm run test
# Run all tests once
cd community-stream-connect && npm run test:watch
# Watch mode for TDD

# Run single test file:
cd community-stream-connect && npx vitest run src/path/to/file.test.ts
# Pattern matching:
cd community-stream-connect && npx vitest run --include "**/*.test.ts"
```

---

## Code Style Guidelines

### Imports
- **Path Aliases:** Use `@/` prefix for all src/* imports (configured in `tsconfig.json`)
  ```typescript
  import { usePlayer } from "@/context/PlayerContext";
  import { Button } from "@/components/ui/button";
  import { fetchNowPlaying } from "@/lib/azuracast";
  ```
- **Order:** External → Internal → Relative (group by category)
  ```typescript
  import React from 'react';
  import { useTranslation } from "react-i18next";
  import { Link } from "react-router-dom";
  
  import { usePlayer } from "@/context/PlayerContext";
  import { Button } from "@/components/ui/button";
  ```

### Formatting & Style
- **2 spaces** indentation (verified in codebase)
- **Single quotes** for strings (except JSX attributes)
- **Semicolons** required (ESLint enforces)
- **Line length:** No hard limit; keep readability (~100-120 chars preferred)
- **Comments:** JSDoc for complex functions, inline for "why" (not "what")
  ```typescript
  /**
   * Fetches now-playing metadata from AzuraCast API
   * @returns Promise<AzuraNowPlayingResponse>
   */
  export async function fetchNowPlaying(): Promise<AzuraNowPlayingResponse> {
    // Only update if stream URL changed (avoid unnecessary resets)
    if (prev !== data.station.listen_url) return data.station.listen_url;
  ```

### TypeScript & Type Definitions
- **Strict mode OFF** (configured: `noImplicitAny: false`, `strictNullChecks: false`)
- **Interfaces** for object shapes (capitalized, `I` prefix NOT used)
  ```typescript
  interface PlayerContextType {
    isPlaying: boolean;
    togglePlay: () => void;
  }
  ```
- **Types** for unions/primitives
  ```typescript
  type SongStatus = "playing" | "paused" | "stopped";
  type ApiResponse<T> = { data: T; error?: string };
  ```
- **Explicit returns** on function declarations (not implicit)
  ```typescript
  // ✓ Good
  const fetchNowPlaying = async (): Promise<AzuraNowPlayingResponse> => {}
  
  // ✗ Avoid
  const fetchNowPlaying = async () => {}
  ```

### Naming Conventions
- **Components:** PascalCase, functional (no class components)
  ```typescript
  export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {}
  export default function Layout() {}
  ```
- **Hooks:** `use*` prefix, colocated or in `/hooks/`
  ```typescript
  export const usePlayer = () => { const ctx = useContext(PlayerContext); ... }
  ```
- **Constants:** UPPER_SNAKE_CASE (module-level)
  ```typescript
  export const POLLING_INTERVAL = 15000;
  export const API_BASE = import.meta.env.VITE_AZURACAST_BASE_URL || "...";
  ```
- **Variables:** camelCase
  ```typescript
  const nowPlaying: NowPlaying = {}
  const [streamUrl, setStreamUrl] = useState("");
  ```
- **Private functions:** `_functionName()` (optional, but helps in module exports)

### Error Handling
- **Try-catch for async operations**
  ```typescript
  try {
    const data = await fetchNowPlaying();
  } catch (err) {
    console.error("Failed to fetch AzuraCast data:", err);
    // Fallback state or notify user via toast
  }
  ```
- **No silent failures:** Always log errors or propagate to UI
  ```typescript
  // ✗ Bad
  audioRef.current?.play();
  
  // ✓ Good
  audioRef.current?.play().catch(() => {
    console.warn("Autoplay blocked by browser");
  });
  ```
- **User feedback:** Use `sonner` toast for errors, not console
  ```typescript
  import { toast } from "sonner";
  toast.error("Failed to load stream");
  ```

### React Patterns
- **Functional components only** (no class components)
- **Hooks:** Use built-in + custom (stored in `/hooks/`)
- **Context:** For global state (Player, Auth, Theme) - 3 providers in App.tsx
- **Props:** Interface-based, destructured
  ```typescript
  interface CardProps {
    title: string;
    children?: React.ReactNode;
  }
  export const Card: React.FC<CardProps> = ({ title, children }) => {}
  ```
- **Callbacks:** `useCallback` for event handlers passed as props
- **Effects:** Clean up side effects (intervals, listeners)
  ```typescript
  useEffect(() => {
    let active = true; // Prevent stale closures
    const update = async () => { if (!active) return; ... };
    const interval = setInterval(update, POLLING_INTERVAL);
    return () => { active = false; clearInterval(interval); };
  }, []);
  ```

### Component Organization
```
src/
├── pages/       → Full-page components (24 routes)
├── components/  → Reusable UI (Navbar, Player, Layout) + ui/ (shadcn)
├── context/     → Global state (PlayerContext, AuthContext, ThemeContext)
├── hooks/       → Custom React hooks
├── lib/         → Utilities (azuracast.ts, utils.ts)
├── integrations/→ External services (supabase/client.ts)
├── i18n/        → Translations (en, es, fr)
├── assets/      → Static files (images, fonts)
└── test/        → Testing setup & helpers
```

### Shadcn/UI Components
- Use `Button`, `Card`, `Dialog`, `Form`, `Input`, etc. from `@/components/ui/`
- Import and compose (don't modify original files in node_modules)
- Combine with Tailwind for custom styling
  ```typescript
  import { Button } from "@/components/ui/button";
  <Button variant="outline" size="sm" className="w-full">
    Submit
  </Button>
  ```

### Internationalization (i18n)
- **Default:** Spanish (es)
- **Supported:** English (en), French (fr)
- **Setup:** i18next with auto-detection in `/i18n/index.ts`
- **Usage:** `const { t } = useTranslation()`
  ```typescript
  const { t } = useTranslation();
  <h1>{t("hero.title")}</h1>
  // Translates to: t("es:hero.title") by default
  ```

### Environment Variables
```bash
VITE_AZURACAST_BASE_URL    # AzuraCast API URL
VITE_AZURACAST_STATION_ID  # Station ID (default: 1)
VITE_AZURACAST_POLLING_INTERVAL # Update frequency ms (default: 15000)
VITE_SUPABASE_URL           # Supabase project URL
VITE_SUPABASE_PUBLISHABLE_KEY # Public key (safe for frontend)
```

---

## ESLint Configuration
- **Rules:** No unused vars (OFF), React hooks (recommended), React Refresh (warn)
- **Config:** `eslint.config.js` - Modern flat config (ESLint 9+)
- **Ignore:** `/dist` directory

---

## Testing Requirements
- **Framework:** Vitest (Vite-native, faster than Jest)
- **Library:** @testing-library/react + jest-dom
- **Environment:** jsdom
- **File pattern:** `**/*.{test,spec}.{ts,tsx}` in src/

**Example test:**
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Button", () => {
  it("renders with label", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
```

---

## Key Architectural Patterns

1. **Contexts for state:** PlayerContext (streaming), AuthContext (user), ThemeContext (dark/light)
2. **React Query:** For server state & caching (initialized in App.tsx)
3. **AzuraCast polling:** Every 15s via `setInterval` in PlayerContext
4. **Supabase integration:** Auto-generated types, authentication with email/password
5. **Multi-language:** Automatic browser language detection with fallback to Spanish

---

## Common Tasks for Agents

### Adding a new page
1. Create `src/pages/NewPage.tsx`
2. Add import in `src/App.tsx`
3. Add route in `<Routes>`
4. Use `useTranslation()` for text
5. Style with Tailwind + shadcn/ui components

### Adding a custom hook
1. Create `src/hooks/useNewHook.ts`
2. Export named function (not default)
3. Return typed interface
4. Use in components with `const [state, setState] = useNewHook()`

### Adding API integration
1. Create module in `src/lib/serviceName.ts`
2. Export typed functions and interfaces
3. Use in contexts or pages with error handling
4. Update `.env.example` with required vars

### Writing tests
1. Collocate with code: `MyComponent.test.tsx` next to `MyComponent.tsx`
2. Use `describe` for suites, `it` for tests
3. Mock Supabase/API calls (not tested here yet)
4. Run: `npm run test`


# Plan de Migración a Prisma ORM

## Resumen Ejecutivo
- **Objetivo:** Reemplazar sql.js + DatabaseWrapper con Prisma ORM
- **Beneficios:** Soporte multi-BD (SQLite, MySQL, PostgreSQL), migrations automáticas, type safety, mejor testing
- **Impacto:** 0 cambios en servicios/rutas (misma interfaz), cambios en config y tests

## Fase 1: Setup de Prisma (30 min)

### 1.1 Instalar dependencias
```bash
npm install @prisma/client
npm install -D prisma
```

### 1.2 Inicializar Prisma
```bash
npx prisma init
```
Esto crea:
- `.env` (DATABASE_URL)
- `prisma/schema.prisma`

### 1.3 Crear schema.prisma
Convertir el SQL actual a Prisma schema con:
- Modelos: User, UserProfile, Blog, News, Event, EventRegistration, Schedule, Product, Order, Donation, Comment
- Relaciones: author_id → User, foreign keys, cascades
- Índices: unique en email, slug, etc

### 1.4 Crear migraciones
```bash
npx prisma migrate dev --name init
```

## Fase 2: Crear Adaptador Prisma (1 hora)

### 2.1 `src/config/prisma.ts`
```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function connectDatabase() {
  await prisma.$connect();
  console.log('✓ Connected to database with Prisma');
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
```

### 2.2 `src/lib/prisma-adapter.ts` (opcional)
Crear interfaz compatible con servicios si necesitan cambios.

## Fase 3: Actualizar Servicios (2 horas)

Ejemplos de cambio en AuthService:

**Antes (sql.js):**
```typescript
const user = this.db.getOne<User>(
  'SELECT * FROM users WHERE email = ?',
  [email.toLowerCase()]
);
```

**Después (Prisma):**
```typescript
const user = await prisma.user.findUnique({
  where: { email: email.toLowerCase() }
});
```

### Servicios a actualizar:
- ✓ AuthService (register, login, getUser, updateUser, getAllUsers, deleteUser, updateUserRole)
- ✓ AzuraCastService (no necesita cambios, usa axios)
- ✓ TokenService (no necesita cambios)

## Fase 4: Actualizar Tests (1.5 horas)

### 4.1 Crear `src/__tests__/mocks/prisma.ts`
Mock completo de Prisma para tests:
```typescript
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    // ... más modelos
  })),
}));
```

### 4.2 Actualizar `src/__tests__/utils/database.ts`
- Crear `PrismaMock` con métodos pre-poblados
- Simular respuestas de queries

### 4.3 Re-ejecutar tests
- auth.test.ts: 32 tests (sin cambios, mismo comportamiento)
- token.test.ts: 5 tests (sin cambios)
- cache.test.ts: 5 tests (sin cambios)

## Fase 5: Documentación de BD (30 min)

### 5.1 `.env.example`
```env
# SQLite (desarrollo)
DATABASE_URL="file:./data/radio_cesar.db"

# MySQL (producción)
# DATABASE_URL="mysql://user:password@localhost:3306/radio_cesar"

# PostgreSQL (producción)
# DATABASE_URL="postgresql://user:password@localhost/radio_cesar"
```

### 5.2 README actualizado
- Instrucciones setup por BD
- Cómo ejecutar migraciones
- Cómo hacer rollback

## Timeline Estimado
- **Setup Prisma:** 30 min
- **Schema + Migrations:** 1 hora
- **Actualizar AuthService:** 1.5 horas
- **Actualizar Tests:** 1.5 horas
- **Documentación:** 30 min
- **Testing completo:** 30 min
- **Total:** ~5 horas

## Checklist de Validación

- [ ] Prisma instalado y schema creado
- [ ] Migración inicial ejecutada sin errores
- [ ] AuthService funciona con Prisma
- [ ] 45/45 tests pasando (mismos que antes)
- [ ] .env.example documentado para 3 BDs
- [ ] prisma/migrations/ comprometido en git
- [ ] Instrucciones de setup en README

## Consideraciones

1. **SQL.js vs Prisma:**
   - Prisma necesita BD real (SQLite file, MySQL, PostgreSQL)
   - Los tests usan mock de Prisma, no BD real
   - Desarrollo con SQLite, producción flexible

2. **DatabaseWrapper:**
   - Se puede eliminar completamente
   - O mantener como deprecated para compatibilidad

3. **Migraciones:**
   - `prisma migrate dev` para desarrollo
   - `prisma migrate deploy` para producción
   - Se guardan en git para reproducibilidad

4. **Type Safety:**
   - Prisma genera tipos automáticos
   - Las respuestas de queries son type-safe
   - Mejor autocomplete en IDE

## Comandos Útiles (Después de Setup)
```bash
# Visualizar DB en UI
npx prisma studio

# Ver migraciones pendientes
npx prisma migrate status

# Resetear BD (desarrollo)
npx prisma migrate reset

# Generar tipos
npx prisma generate

# Validar schema
npx prisma validate
```

---

**¿Procedo con la Fase 1 (Setup de Prisma)?**

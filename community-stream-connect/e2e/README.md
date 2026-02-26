# E2E Testing with Playwright

End-to-end tests for Proyecto Radio Cesar using Playwright.

## Setup

Tests run against the production server: `https://radio-azura.orioncaribe.com/`

### Prerequisites

1. **Test Accounts**: Ensure these accounts exist on the production server:
   - `admin@test.com` (password: `Admin@12345`, role: admin)
   - `listener@test.com` (password: `Listener@12345`, role: listener)

2. **Browsers**: Playwright automatically downloads browsers on first run

## Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth.spec.ts

# Run single test
npx playwright test -g "should login with valid credentials"

# Headed mode (see browser)
npx playwright test --headed

# Report
npx playwright show-report
```

## Test Structure

### `fixtures.ts`
Shared test data, API endpoints, and helper functions:
- Test user credentials
- API endpoint definitions
- Authentication helpers (`loginUser`, `registerUser`, `logoutUser`)
- Data creation helpers (`createBlogPost`, `createNews`, `createEvent`, `createUser`)
- Assertion helpers (`assertLoggedIn`, `assertAdminAccess`)
- Navigation and cleanup utilities
- **All page routes** (ROUTES constant)

### `public.spec.ts` - **35 tests**
All public pages without authentication:
- Core: Home, Now Playing
- Auth: Login, Register
- Schedule: Schedule (EN/ES), Programs
- Community: Participate, Community, Como Participar
- Support: Donate, Support
- Info: About, History, Team, Contact, Terms
- Content: Blog, News, Events, Shop, Cart
- Navigation: Navbar, Footer, Page transitions
- Responsive: Mobile, Tablet
- Accessibility: HTML structure, Lang attribute

### `user.spec.ts` - **14 tests**
User authentication and profile features:
- Portal page access
- Profile settings
- Reset password
- Login/logout flow
- Session persistence
- Invalid credentials handling
- Mobile user experience

### `admin-full.spec.ts` - **24 tests**
Admin dashboard and user management:
- Dashboard access control (admin, listener, anonymous)
- Statistics display
- User CRUD (Create, Read, Update, Delete)
- Role management
- User activation/deactivation
- Permission validation
- Pagination & Search
- Error handling

### `admin.spec.ts` - **10 tests**
Additional admin tests (legacy, see admin-full.spec.ts for full coverage)

### `streaming.spec.ts` - **12 tests**
AzuraCast streaming functionality:
- Now Playing page
- Stream Dashboard
- Stream Now Playing module
- Playlists
- Player controls
- Station information
- Mobile streaming
- Error handling

### `content.spec.ts` - **12 tests**
Content management:
- Blog, News, Events pages
- Content creation (admin)
- Permission validation
- Skeleton loaders
- Error handling

### `auth.spec.ts` - **13 tests**
Authentication flows:
- Login (valid/invalid)
- Register (new user, duplicate, weak password)
- Logout
- Session management
- Token persistence

### `api-errors.spec.ts` - **15 tests`
API error handling:
- HTTP errors (400, 401, 403, 404, 500)
- Validation errors
- Duplicate entries
- Invalid tokens
- Concurrent requests
- Missing fields

## Test Summary

| File | Tests | Coverage |
|------|-------|----------|
| `public.spec.ts` | 35 | All public pages |
| `user.spec.ts` | 14 | User features |
| `admin-full.spec.ts` | 24 | Admin dashboard |
| `streaming.spec.ts` | 12 | AzuraCast/Streaming |
| `content.spec.ts` | 12 | Blog/News/Events |
| `auth.spec.ts` | 13 | Authentication |
| `api-errors.spec.ts` | 15 | Error handling |
| **TOTAL** | **125** | **Comprehensive** |

## Key Concepts

### Test Data
Tests use dynamic test data with timestamps to avoid conflicts:
```typescript
const newUser = {
  email: `e2etest-${Date.now()}@test.com`,
  password: 'NewUser@12345',
};
```

### Authentication
Tests authenticate via API and store tokens in localStorage:
```typescript
const token = await loginUser(page, email, password);
await assertLoggedIn(page);
```

### Error Handling
All API calls check response status and throw on failure:
```typescript
expect(response.ok()).toBeTruthy();
const data = await response.json();
```

### Cleanup
Tests clean up created data (users, blog posts) after execution:
```typescript
// Create
const user = await createUser(page, ...);
// Later
await deleteUser(page, user.id);
```

## Configuration

`playwright.config.ts`:
- **baseURL**: `https://radio-azura.orioncaribe.com`
- **Workers**: 1 (sequential - maintains auth state between tests)
- **Retries**: 2 in CI, 0 locally
- **Timeout**: 30s per test, 5s per assertion
- **Projects**: Chromium, Firefox, WebKit (desktop + mobile)
- **Reporters**: HTML, JSON, JUnit (for CI/CD)
- **Screenshots/Video**: On failure only

## Test Results

After running tests, view the HTML report:

```bash
npx playwright show-report
```

Results are stored in:
- `playwright-report/` - HTML report
- `test-results/` - JSON and JUnit XML for CI/CD
- `playwright/.auth/` - Auth state cache

## Debugging

### View browser during test
```bash
npx playwright test --headed --debug
```

### Use Playwright Inspector
```bash
npx playwright test --debug
```

### Generate trace for failed test
Traces are automatically captured on first retry. View with:
```bash
npx playwright show-trace path/to/trace.zip
```

## CI/CD Integration

Tests run in CI with:
- Single worker (sequential)
- 2 retries per test
- All reporters enabled
- Traces/videos on failure

Configure in `.github/workflows/` for automated testing on push/PR.

## Best Practices

1. **Use fixtures**: Leverage `fixtures.ts` helpers instead of duplicating code
2. **Test user actions**: Focus on user workflows, not implementation details
3. **Clean up**: Always delete created data in tests to avoid conflicts
4. **Avoid hardcoding**: Use dynamic IDs, timestamps, and test data
5. **Check error states**: Test both success and failure paths
6. **Use locators**: Prefer semantic locators (`text=`, `[role=]`) over selectors
7. **Wait properly**: Use `waitForLoadState`, `waitForSelector` not arbitrary delays
8. **Isolate tests**: Tests should be independent and runnable in any order

## Known Issues

1. **Test accounts must exist**: Create test users before running tests
2. **Sequential execution**: Tests run one at a time to preserve auth state
3. **Production testing**: Tests run against production - be careful with data cleanup
4. **Network timing**: Tests may be flaky on slow connections (increase timeout)

## Next Steps

1. Add GitHub Actions workflow for automated E2E testing
2. Add visual regression testing
3. Add performance testing
4. Increase code coverage to critical paths
5. Add accessibility testing with Axe

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [API Reference](https://playwright.dev/docs/api/class-test)

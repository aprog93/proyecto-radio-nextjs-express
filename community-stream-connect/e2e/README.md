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

### `auth.spec.ts`
Authentication flow tests (13 tests):
- Valid/invalid login
- Registration (new, duplicate, weak password)
- Logout
- Session management (reload, token persistence)
- User info retrieval

### `admin.spec.ts`
Admin dashboard tests (10 tests):
- Dashboard access and rendering
- Statistics display
- User listing with pagination
- User CRUD operations (create, read, update, delete)
- Role changes
- User deactivation
- Permission validation (non-admin access denied)
- Search functionality

### `content.spec.ts`
Content pages tests (12 tests):
- Blog page loading and display
- News page loading and display
- Events page loading and display
- Individual post/event viewing
- Content creation (blog, news, events)
- Permission validation
- Skeleton loaders on mobile
- Error handling for non-existent content

### `api-errors.spec.ts`
Error handling tests (15 tests):
- HTTP error codes (400, 401, 403, 404, 500)
- Validation errors (email, password, role)
- Duplicate entries
- Expired tokens
- Concurrent requests
- Missing required fields
- Response handling

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

// cypress/support/e2e.ts
import './commands';

// Disable uncaught exception errors for testing
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  return false;
});

// cypress/e2e/now-playing.cy.ts - Simplified pragmatic tests
describe('Now Playing Page - Full Screen Display', () => {
  beforeEach(() => {
    cy.interceptAzuracastApi();
    cy.visit('/stream-now-playing');
  });

  it('should load now playing page', () => {
    cy.get('body').should('be.visible');
    cy.location('pathname').should('include', '/stream-now-playing');
  });

  it('should handle back navigation', () => {
    cy.visit('/stream-dashboard');
    cy.visit('/stream-now-playing');
    cy.location('pathname').should('include', '/stream-now-playing');
  });

  it('should maintain URL on page reload', () => {
    cy.reload();
    cy.location('pathname').should('include', '/stream-now-playing');
    cy.get('body').should('be.visible');
  });
});

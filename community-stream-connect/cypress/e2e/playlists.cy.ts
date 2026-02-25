// cypress/e2e/playlists.cy.ts - Simplified pragmatic tests
describe('Playlists Page - Song Browser', () => {
  beforeEach(() => {
    cy.interceptAzuracastApi();
    cy.visit('/playlists');
  });

  it('should load playlists page', () => {
    cy.get('body').should('be.visible');
    cy.location('pathname').should('include', '/playlists');
  });

  it('should navigate to dashboard', () => {
    cy.visit('/stream-dashboard');
    cy.get('body').should('be.visible');
    cy.location('pathname').should('include', '/stream-dashboard');
  });

  it('should handle page refresh', () => {
    cy.reload();
    cy.get('body').should('be.visible');
    cy.location('pathname').should('include', '/playlists');
  });
});

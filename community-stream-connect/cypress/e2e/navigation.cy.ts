// cypress/e2e/navigation.cy.ts - Navigation smoke tests
describe('Navigation - Cross-feature User Journeys', () => {
  beforeEach(() => {
    cy.interceptAzuracastApi();
  });

  it('should navigate through all azuracast pages', () => {
    // Dashboard
    cy.visit('/stream-dashboard');
    cy.get('body').should('be.visible');

    // Playlists
    cy.visit('/playlists');
    cy.get('body').should('be.visible');

    // Now Playing
    cy.visit('/stream-now-playing');
    cy.get('body').should('be.visible');
  });

  it('should handle direct deep links', () => {
    // Direct to dashboard
    cy.visit('/stream-dashboard');
    cy.location('pathname').should('eq', '/stream-dashboard');

    // Direct to playlists
    cy.visit('/playlists');
    cy.location('pathname').should('eq', '/playlists');

    // Direct to now-playing
    cy.visit('/stream-now-playing');
    cy.location('pathname').should('eq', '/stream-now-playing');
  });

  it('should handle API mocking correctly', () => {
    cy.visit('/stream-dashboard');
    cy.wait('@getNowPlaying', { timeout: 5000 });
    cy.get('body').should('be.visible');
  });

  it('should be accessible on all routes', () => {
    const routes = ['/stream-dashboard', '/playlists', '/stream-now-playing'];
    
    routes.forEach((route) => {
      cy.visit(route);
      cy.get('body').should('be.visible');
      cy.get('html').should('have.attr', 'lang'); // Basic a11y check
    });
  });
});

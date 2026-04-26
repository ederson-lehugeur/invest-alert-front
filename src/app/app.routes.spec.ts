import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideLocationMocks } from '@angular/common/testing';
import { Component } from '@angular/core';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { TokenStoreService } from './features/auth/infrastructure/token-store.service';

/* Minimal stub components to avoid loading real feature modules */
@Component({ standalone: true, template: '<p>login</p>' })
class StubLoginComponent {}

@Component({ standalone: true, template: '<p>register</p>' })
class StubRegisterComponent {}

@Component({ standalone: true, template: '<p>dashboard</p>' })
class StubDashboardComponent {}

@Component({ standalone: true, template: '<p>assets</p>' })
class StubAssetsComponent {}

@Component({ standalone: true, template: '<p>rules</p>' })
class StubRulesComponent {}

@Component({ standalone: true, template: '<p>alerts</p>' })
class StubAlertsComponent {}

describe('App Routes Integration', () => {
  let tokenStore: TokenStoreService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideLocationMocks(),
        provideHttpClient(),
      ],
    });

    tokenStore = TestBed.inject(TokenStoreService);
    router = TestBed.inject(Router);
  });

  describe('unauthenticated users', () => {
    it('should redirect / to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/');
      expect(router.url).toBe('/auth/login');
    });

    it('should redirect /dashboard to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/dashboard');
      expect(router.url).toBe('/auth/login');
    });

    it('should redirect /assets to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/assets');
      expect(router.url).toBe('/auth/login');
    });

    it('should redirect /rules to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/rules');
      expect(router.url).toBe('/auth/login');
    });

    it('should redirect /alerts to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/alerts');
      expect(router.url).toBe('/auth/login');
    });

    it('should allow access to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/auth/login');
      expect(router.url).toBe('/auth/login');
    });

    it('should allow access to /auth/register', async () => {
      const harness = await RouterTestingHarness.create('/auth/register');
      expect(router.url).toBe('/auth/register');
    });

    it('should redirect wildcard routes to /auth/login', async () => {
      const harness = await RouterTestingHarness.create('/nonexistent');
      expect(router.url).toBe('/auth/login');
    });
  });

  describe('authenticated users', () => {
    beforeEach(() => {
      tokenStore.setToken('test-jwt-token');
    });

    it('should allow access to /dashboard', async () => {
      const harness = await RouterTestingHarness.create('/dashboard');
      expect(router.url).toBe('/dashboard');
    });

    it('should allow access to /assets', async () => {
      const harness = await RouterTestingHarness.create('/assets');
      expect(router.url).toBe('/assets');
    });

    it('should allow access to /rules', async () => {
      const harness = await RouterTestingHarness.create('/rules');
      expect(router.url).toBe('/rules');
    });

    it('should allow access to /alerts', async () => {
      const harness = await RouterTestingHarness.create('/alerts');
      expect(router.url).toBe('/alerts');
    });

    it('should redirect /auth/login to /dashboard', async () => {
      const harness = await RouterTestingHarness.create('/auth/login');
      expect(router.url).toBe('/dashboard');
    });

    it('should redirect /auth/register to /dashboard', async () => {
      const harness = await RouterTestingHarness.create('/auth/register');
      expect(router.url).toBe('/dashboard');
    });

    it('should redirect / to /dashboard', async () => {
      const harness = await RouterTestingHarness.create('/');
      expect(router.url).toBe('/dashboard');
    });

    it('should redirect wildcard routes to /dashboard', async () => {
      const harness = await RouterTestingHarness.create('/nonexistent');
      expect(router.url).toBe('/dashboard');
    });
  });

  describe('lazy loading', () => {
    beforeEach(() => {
      tokenStore.setToken('test-jwt-token');
    });

    it('should lazy-load dashboard routes', async () => {
      const harness = await RouterTestingHarness.create('/dashboard');
      expect(router.url).toBe('/dashboard');
      const config = router.config;
      const dashboardParent = config.find(
        (r) => r.path === '' && r.children
      );
      const dashboardRoute = dashboardParent?.children?.find(
        (r) => r.path === 'dashboard'
      );
      expect(dashboardRoute?.loadChildren).toBeDefined();
    });

    it('should lazy-load assets routes', async () => {
      const harness = await RouterTestingHarness.create('/assets');
      expect(router.url).toBe('/assets');
      const config = router.config;
      const parent = config.find((r) => r.path === '' && r.children);
      const assetsRoute = parent?.children?.find((r) => r.path === 'assets');
      expect(assetsRoute?.loadChildren).toBeDefined();
    });

    it('should lazy-load rules routes', async () => {
      const harness = await RouterTestingHarness.create('/rules');
      expect(router.url).toBe('/rules');
      const config = router.config;
      const parent = config.find((r) => r.path === '' && r.children);
      const rulesRoute = parent?.children?.find((r) => r.path === 'rules');
      expect(rulesRoute?.loadChildren).toBeDefined();
    });

    it('should lazy-load alerts routes', async () => {
      const harness = await RouterTestingHarness.create('/alerts');
      expect(router.url).toBe('/alerts');
      const config = router.config;
      const parent = config.find((r) => r.path === '' && r.children);
      const alertsRoute = parent?.children?.find((r) => r.path === 'alerts');
      expect(alertsRoute?.loadChildren).toBeDefined();
    });

    it('should lazy-load auth routes', async () => {
      const config = router.config;
      const authRoute = config.find((r) => r.path === 'auth');
      expect(authRoute?.loadChildren).toBeDefined();
    });
  });
});

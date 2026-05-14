import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, BehaviorSubject } from 'rxjs';
import * as fc from 'fast-check';
import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { TokenStoreService } from '../infrastructure/token-store.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Token } from '../domain/models/token.model';
import { User } from '../domain/models/user.model';

const mockToken: Token = {
  accessToken: 'jwt-123',
  refreshToken: 'rt-abc',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresIn: 604800,
};

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let authApi: {
    login: ReturnType<typeof vi.fn>;
    register: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    refresh: ReturnType<typeof vi.fn>;
  };
  let tokenStore: {
    setTokens: ReturnType<typeof vi.fn>;
    clearTokens: ReturnType<typeof vi.fn>;
    getRefreshToken: ReturnType<typeof vi.fn>;
    isAuthenticated$: BehaviorSubject<boolean>;
    permissions$: BehaviorSubject<readonly string[]>;
  };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authApi = {
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn().mockReturnValue(of(undefined)),
      refresh: vi.fn(),
    };

    tokenStore = {
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      getRefreshToken: vi.fn().mockReturnValue(null),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      permissions$: new BehaviorSubject<readonly string[]>([]),
    };

    router = {
      navigate: vi.fn(),
    };

    errorHandler = {
      extractMessage: vi.fn().mockReturnValue('Something went wrong'),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        { provide: AuthApiService, useValue: authApi },
        { provide: TokenStoreService, useValue: tokenStore },
        { provide: Router, useValue: router },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    facade = TestBed.inject(AuthFacade);
  });

  describe('login', () => {
    const command = { email: 'john@example.com', password: 'secret' };

    it('should call API, store tokens, and navigate to /dashboard on success', () => {
      authApi.login.mockReturnValue(of(mockToken));

      facade.login(command);

      expect(authApi.login).toHaveBeenCalledWith(command);
      expect(tokenStore.setTokens).toHaveBeenCalledWith(mockToken);
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBeNull();
    });

    it('should set loading to true while request is in progress', () => {
      authApi.login.mockReturnValue(of(mockToken));

      expect(facade.loading()).toBe(false);

      facade.login(command);

      expect(facade.loading()).toBe(false);
    });

    it('should set error message and reset loading on failure', () => {
      const httpError = new HttpErrorResponse({ status: 401, error: null });
      authApi.login.mockReturnValue(throwError(() => httpError));
      errorHandler.extractMessage.mockReturnValue('Invalid credentials. Please try again.');

      facade.login(command);

      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBe('Invalid credentials. Please try again.');
      expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
      expect(tokenStore.setTokens).not.toHaveBeenCalled();
      expect(router.navigate).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    const command = { name: 'John', email: 'john@example.com', password: 'secret' };
    const user: User = { id: 1, name: 'John', email: 'john@example.com', createdAt: new Date() };

    it('should call API and navigate to /auth/login on success', () => {
      authApi.register.mockReturnValue(of(user));

      facade.register(command);

      expect(authApi.register).toHaveBeenCalledWith(command);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBeNull();
    });

    it('should set error message and reset loading on 409 error', () => {
      const httpError = new HttpErrorResponse({
        status: 409,
        error: { timestamp: '', status: 409, error: 'Conflict', message: 'Email already exists' },
      });
      authApi.register.mockReturnValue(throwError(() => httpError));
      errorHandler.extractMessage.mockReturnValue('Email already exists');

      facade.register(command);

      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBe('Email already exists');
      expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
    });
  });

  describe('logout', () => {
    it('should clear tokens and navigate to /auth/login', () => {
      tokenStore.getRefreshToken.mockReturnValue(null);

      facade.logout();

      expect(tokenStore.clearTokens).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should call API logout with the refresh token when one is available', () => {
      tokenStore.getRefreshToken.mockReturnValue('rt-abc');
      authApi.logout.mockReturnValue(of(undefined));

      facade.logout();

      expect(authApi.logout).toHaveBeenCalledWith('rt-abc');
    });

    it('should not call API logout when no refresh token is available', () => {
      tokenStore.getRefreshToken.mockReturnValue(null);

      facade.logout();

      expect(authApi.logout).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated$', () => {
    it('should expose isAuthenticated$ from TokenStoreService', () => {
      let value: boolean | undefined;
      facade.isAuthenticated$.subscribe((v) => (value = v));

      expect(value).toBe(false);

      tokenStore.isAuthenticated$.next(true);
      expect(value).toBe(true);
    });
  });

  describe('permissions$', () => {
    it('should emit the same value as TokenStore.permissions$', () => {
      const emitted: (readonly string[])[] = [];
      facade.permissions$.subscribe((p) => emitted.push(p));

      tokenStore.permissions$.next(['ALERT_CREATE']);
      tokenStore.permissions$.next(['ALERT_CREATE', 'ALERT_UPDATE']);

      expect(emitted).toEqual([[], ['ALERT_CREATE'], ['ALERT_CREATE', 'ALERT_UPDATE']]);
    });

    it('should emit empty array when not authenticated', () => {
      let emitted: readonly string[] | undefined;
      facade.permissions$.subscribe((p) => (emitted = p));

      expect(emitted).toEqual([]);
    });
  });

  describe('hasPermission', () => {
    it('should return true when permission is present', () => {
      tokenStore.permissions$.next(['ALERT_CREATE', 'ALERT_UPDATE']);

      let result: boolean | undefined;
      facade.hasPermission('ALERT_CREATE').subscribe((v) => (result = v));

      expect(result).toBe(true);
    });

    it('should return false when permission is absent', () => {
      tokenStore.permissions$.next(['ALERT_UPDATE']);

      let result: boolean | undefined;
      facade.hasPermission('ALERT_CREATE').subscribe((v) => (result = v));

      expect(result).toBe(false);
    });

    it('should return false when permissions list is empty', () => {
      tokenStore.permissions$.next([]);

      let result: boolean | undefined;
      facade.hasPermission('ALERT_CREATE').subscribe((v) => (result = v));

      expect(result).toBe(false);
    });

    it('should react to permission changes', () => {
      const results: boolean[] = [];
      facade.hasPermission('ALERT_CREATE').subscribe((v) => results.push(v));

      tokenStore.permissions$.next(['ALERT_CREATE']);
      tokenStore.permissions$.next([]);

      expect(results).toEqual([false, true, false]);
    });
  });
});

describe('AuthFacade - Property Tests', () => {
  let permissionsSubject: BehaviorSubject<readonly string[]>;
  let facade: AuthFacade;

  beforeEach(() => {
    permissionsSubject = new BehaviorSubject<readonly string[]>([]);

    const tokenStore = {
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
      getRefreshToken: vi.fn().mockReturnValue(null),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      permissions$: permissionsSubject,
    };

    TestBed.configureTestingModule({
      providers: [
        AuthFacade,
        {
          provide: AuthApiService,
          useValue: { login: vi.fn(), register: vi.fn(), logout: vi.fn(), refresh: vi.fn() },
        },
        { provide: TokenStoreService, useValue: tokenStore },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ErrorHandlerService, useValue: { extractMessage: vi.fn() } },
      ],
    });

    facade = TestBed.inject(AuthFacade);
  });

  // Feature: invest-alert-front-rbac, Property 3: Delegação de permissions$ pela AuthFacade
  it('should delegate permissions$ directly from TokenStore without transformation', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        (permissions) => {
          permissionsSubject.next(permissions);

          let emitted: readonly string[] | undefined;
          facade.permissions$.subscribe((p) => (emitted = p));

          expect(emitted).toEqual(permissions);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: invest-alert-front-rbac, Property 4: hasPermission como teste de pertencimento
  it('should return true iff permission is in the user permissions set', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        (userPermissions, queriedPermission) => {
          permissionsSubject.next(userPermissions);

          let result: boolean | undefined;
          facade.hasPermission(queriedPermission).subscribe((v) => (result = v));

          expect(result).toBe(userPermissions.includes(queriedPermission));
        }
      ),
      { numRuns: 100 }
    );
  });
});

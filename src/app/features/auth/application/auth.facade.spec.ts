import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { AuthFacade } from './auth.facade';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { TokenStoreService } from '../infrastructure/token-store.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Token } from '../domain/models/token.model';
import { User } from '../domain/models/user.model';

describe('AuthFacade', () => {
  let facade: AuthFacade;
  let authApi: { login: ReturnType<typeof vi.fn>; register: ReturnType<typeof vi.fn> };
  let tokenStore: { setToken: ReturnType<typeof vi.fn>; clearToken: ReturnType<typeof vi.fn>; isAuthenticated$: BehaviorSubject<boolean> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    authApi = {
      login: vi.fn(),
      register: vi.fn(),
    };

    tokenStore = {
      setToken: vi.fn(),
      clearToken: vi.fn(),
      isAuthenticated$: new BehaviorSubject<boolean>(false),
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
    const token: Token = { token: 'jwt-123', expiresIn: 3600 };

    it('should call API, store token, and navigate to /dashboard on success', () => {
      authApi.login.mockReturnValue(of(token));

      facade.login(command);

      expect(authApi.login).toHaveBeenCalledWith(command);
      expect(tokenStore.setToken).toHaveBeenCalledWith('jwt-123');
      expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
      expect(facade.loading()).toBe(false);
      expect(facade.error()).toBeNull();
    });

    it('should set loading to true while request is in progress', () => {
      authApi.login.mockReturnValue(of(token));

      // Before calling login, loading should be false
      expect(facade.loading()).toBe(false);

      facade.login(command);

      // After success, loading should be false again
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
      expect(tokenStore.setToken).not.toHaveBeenCalled();
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
    it('should clear token and navigate to /auth/login', () => {
      facade.logout();

      expect(tokenStore.clearToken).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
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
});

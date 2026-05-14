import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  HttpErrorResponse,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let tokenStore: TokenStoreService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        TokenStoreService,
        {
          provide: Router,
          useValue: { navigateByUrl: vi.fn() },
        },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    tokenStore = TestBed.inject(TokenStoreService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should not add Authorization header when no token is set', () => {
    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('should add Authorization header when token is set', () => {
    tokenStore.setToken('my-jwt-token');

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe(
      'Bearer my-jwt-token'
    );
    req.flush({});
  });

  it('should clear token and redirect on 401 response', () => {
    tokenStore.setToken('expired-token');

    http.get('/api/protected').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpTesting.expectOne('/api/protected');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStore.getToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should not clear token on non-401 errors', () => {
    tokenStore.setToken('valid-token');

    http.get('/api/data').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(tokenStore.getToken()).toBe('valid-token');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  // --- RBAC: 403 handling ---

  it('should NOT redirect to /auth/login on 403 response', () => {
    tokenStore.setToken('valid-token');

    http.get('/api/protected-resource').subscribe({
      error: () => {
        // expected to error
      },
    });

    const req = httpTesting.expectOne('/api/protected-resource');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should NOT clear token on 403 response', () => {
    tokenStore.setToken('valid-token');

    http.get('/api/protected-resource').subscribe({
      error: () => {
        // expected to error
      },
    });

    const req = httpTesting.expectOne('/api/protected-resource');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(tokenStore.getToken()).toBe('valid-token');
  });

  it('should propagate the 403 error to the subscriber', () => {
    tokenStore.setToken('valid-token');
    let receivedError: HttpErrorResponse | undefined;

    http.get('/api/protected-resource').subscribe({
      error: (err: HttpErrorResponse) => {
        receivedError = err;
      },
    });

    const req = httpTesting.expectOne('/api/protected-resource');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(receivedError).toBeDefined();
    expect(receivedError?.status).toBe(403);
  });

  it('should preserve existing 401 behavior (clears token + redirects) after adding 403 handling', () => {
    tokenStore.setToken('expired-token');

    http.get('/api/protected').subscribe({
      error: () => {
        // expected to error
      },
    });

    const req = httpTesting.expectOne('/api/protected');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStore.getToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });
});

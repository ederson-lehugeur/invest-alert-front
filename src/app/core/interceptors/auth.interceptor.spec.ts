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
import { Token } from '../../features/auth/domain/models/token.model';

const mockToken: Token = {
  accessToken: 'jwt-123',
  refreshToken: 'rt-abc',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresIn: 604800,
};

const newToken: Token = {
  accessToken: 'jwt-new',
  refreshToken: 'rt-new',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresIn: 604800,
};

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
    tokenStore.setTokens(mockToken);

    http.get('/api/test').subscribe();

    const req = httpTesting.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-123');
    req.flush({});
  });

  it('should attempt token refresh on 401 and retry the original request', () => {
    tokenStore.setTokens(mockToken);

    http.get('/api/protected').subscribe();

    // Original request fails with 401
    const req = httpTesting.expectOne('/api/protected');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Interceptor calls /auth/refresh
    const refreshReq = httpTesting.expectOne('/api/v1/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'rt-abc' });
    refreshReq.flush(newToken);

    // Retried request with new token
    const retried = httpTesting.expectOne('/api/protected');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer jwt-new');
    retried.flush({});

    expect(tokenStore.getToken()).toBe('jwt-new');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should clear tokens and redirect when refresh fails on 401', () => {
    tokenStore.setTokens(mockToken);

    http.get('/api/protected').subscribe({ error: () => {} });

    // Original request fails with 401
    const req = httpTesting.expectOne('/api/protected');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // Refresh also fails
    const refreshReq = httpTesting.expectOne('/api/v1/auth/refresh');
    refreshReq.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStore.getToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should clear tokens and redirect when no refresh token is available on 401', () => {
    // No tokens set - no refresh token available
    http.get('/api/protected').subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/protected');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(tokenStore.getToken()).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/auth/login');
  });

  it('should not attempt refresh for 401 on auth endpoints', () => {
    http.post('/api/v1/auth/login', {}).subscribe({ error: () => {} });

    const req = httpTesting.expectOne('/api/v1/auth/login');
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    // No refresh call should be made for auth endpoints
    httpTesting.expectNone('/api/v1/auth/refresh');
  });

  it('should not clear token on non-401 errors', () => {
    tokenStore.setTokens(mockToken);

    http.get('/api/data').subscribe({
      error: (err: HttpErrorResponse) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpTesting.expectOne('/api/data');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(tokenStore.getToken()).toBe('jwt-123');
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  // --- RBAC: 403 handling ---

  it('should NOT redirect to /auth/login on 403 response', () => {
    tokenStore.setTokens(mockToken);

    http.get('/api/protected-resource').subscribe({
      error: () => {},
    });

    const req = httpTesting.expectOne('/api/protected-resource');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('should NOT clear token on 403 response', () => {
    tokenStore.setTokens(mockToken);

    http.get('/api/protected-resource').subscribe({
      error: () => {},
    });

    const req = httpTesting.expectOne('/api/protected-resource');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(tokenStore.getToken()).toBe('jwt-123');
  });

  it('should propagate the 403 error to the subscriber', () => {
    tokenStore.setTokens(mockToken);
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
});

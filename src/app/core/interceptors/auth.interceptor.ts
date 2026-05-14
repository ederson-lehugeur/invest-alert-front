import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';
import { AuthApiService } from '../../features/auth/infrastructure/auth-api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  const authApi = inject(AuthApiService);
  const router = inject(Router);

  const token = tokenStore.getToken();

  const authorizedReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authorizedReq).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthEndpoint(req)) {
        return handleUnauthorized(req, next, tokenStore, authApi, router);
      }
      // 403: propagate the error without redirecting or clearing the token
      return throwError(() => error);
    })
  );
};

function handleUnauthorized(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenStore: TokenStoreService,
  authApi: AuthApiService,
  router: Router
) {
  const refreshToken = tokenStore.getRefreshToken();

  if (!refreshToken) {
    tokenStore.clearTokens();
    router.navigateByUrl('/auth/login');
    return throwError(() => new Error('No refresh token available'));
  }

  return authApi.refresh(refreshToken).pipe(
    switchMap((newToken) => {
      tokenStore.setTokens(newToken);
      const retried = req.clone({
        setHeaders: { Authorization: `Bearer ${newToken.accessToken}` },
      });
      return next(retried);
    }),
    catchError((refreshError) => {
      tokenStore.clearTokens();
      router.navigateByUrl('/auth/login');
      return throwError(() => refreshError);
    })
  );
}

function isAuthEndpoint(req: HttpRequest<unknown>): boolean {
  return req.url.includes('/auth/');
}

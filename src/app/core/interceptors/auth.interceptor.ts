import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenStore = inject(TokenStoreService);
  const router = inject(Router);

  const token = tokenStore.getToken();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        tokenStore.clearToken();
        router.navigateByUrl('/auth/login');
      }
      return throwError(() => error);
    })
  );
};

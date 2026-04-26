import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';

export const authGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStoreService);
  const router = inject(Router);

  return tokenStore.isAuthenticated$.pipe(
    map((isAuthenticated) =>
      isAuthenticated ? true : router.createUrlTree(['/auth/login'])
    )
  );
};

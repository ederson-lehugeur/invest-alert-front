import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';

export const guestGuard: CanActivateFn = () => {
  const tokenStore = inject(TokenStoreService);
  const router = inject(Router);

  return tokenStore.isAuthenticated$.pipe(
    map((isAuthenticated) =>
      isAuthenticated ? router.createUrlTree(['/dashboard']) : true
    )
  );
};

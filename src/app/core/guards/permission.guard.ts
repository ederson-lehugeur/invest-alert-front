import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { take, map } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/application/auth.facade';

export const permissionGuard: CanActivateFn = (route) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);
  const requiredPermission = route.data?.['requiredPermission'] as string | undefined;

  if (!requiredPermission) {
    return true;
  }

  return authFacade.hasPermission(requiredPermission).pipe(
    take(1),
    map((hasPermission) =>
      hasPermission ? true : router.createUrlTree(['/dashboard'])
    )
  );
};

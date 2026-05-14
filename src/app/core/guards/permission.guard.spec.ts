import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fc from 'fast-check';
import { permissionGuard } from './permission.guard';
import { AuthFacade } from '../../features/auth/application/auth.facade';

function buildMockAuthFacade(initialPermissions: readonly string[] = []) {
  const permissionsSubject = new BehaviorSubject<readonly string[]>(initialPermissions);
  const facade = {
    permissions$: permissionsSubject.asObservable(),
    hasPermission: (permission: string): Observable<boolean> =>
      permissionsSubject.pipe(map((perms) => perms.includes(permission))),
  } as unknown as AuthFacade;
  return { facade, permissionsSubject };
}

function buildRoute(requiredPermission?: string): ActivatedRouteSnapshot {
  return {
    data: requiredPermission ? { requiredPermission } : {},
  } as unknown as ActivatedRouteSnapshot;
}

function setupTestBed(permissions: readonly string[]) {
  const { facade, permissionsSubject } = buildMockAuthFacade(permissions);

  TestBed.configureTestingModule({
    providers: [
      { provide: AuthFacade, useValue: facade },
      {
        provide: Router,
        useValue: {
          createUrlTree: vi.fn(
            (commands: string[]) => commands.join('/') as unknown as UrlTree
          ),
        },
      },
    ],
  });

  return { facade, permissionsSubject, router: TestBed.inject(Router) };
}

describe('permissionGuard', () => {
  it('should allow navigation when user has the required permission', async () => {
    setupTestBed(['ALERT_CREATE', 'ALERT_UPDATE']);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        permissionGuard(buildRoute('ALERT_CREATE'), {} as any)
      ) as Observable<boolean | UrlTree>
    );

    expect(result).toBe(true);
  });

  it('should redirect to /dashboard when user lacks the required permission', async () => {
    const { router } = setupTestBed(['ALERT_UPDATE']);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        permissionGuard(buildRoute('ALERT_CREATE'), {} as any)
      ) as Observable<boolean | UrlTree>
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).not.toBe(true);
    expect(result).toBeTruthy(); // UrlTree is truthy
  });

  it('should allow navigation when route has no requiredPermission', () => {
    setupTestBed([]);

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(buildRoute(), {} as any)
    );

    expect(result).toBe(true);
  });

  it('should allow navigation when user has no permissions but route has no requiredPermission', () => {
    setupTestBed([]);

    const result = TestBed.runInInjectionContext(() =>
      permissionGuard(buildRoute(undefined), {} as any)
    );

    expect(result).toBe(true);
  });

  it('should redirect when user has empty permissions and route requires a permission', async () => {
    const { router } = setupTestBed([]);

    const result = await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        permissionGuard(buildRoute('ALERT_DELETE'), {} as any)
      ) as Observable<boolean | UrlTree>
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).not.toBe(true);
  });
});

describe('permissionGuard - Property Tests', () => {
  // Feature: invest-alert-front-rbac, Property 5: permissionGuard permite ou redireciona corretamente
  it('should allow navigation iff user has the required permission', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        async (userPermissions, requiredPermission) => {
          TestBed.resetTestingModule();

          const { router } = setupTestBed(userPermissions);

          const result = await firstValueFrom(
            TestBed.runInInjectionContext(() =>
              permissionGuard(buildRoute(requiredPermission), {} as any)
            ) as Observable<boolean | UrlTree>
          );

          const shouldAllow = userPermissions.includes(requiredPermission);
          if (shouldAllow) {
            expect(result).toBe(true);
          } else {
            expect(router.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
            expect(result).not.toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

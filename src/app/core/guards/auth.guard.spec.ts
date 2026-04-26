import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';
import { authGuard } from './auth.guard';
import { TokenStoreService } from '../../features/auth/infrastructure/token-store.service';

describe('authGuard', () => {
  let tokenStore: TokenStoreService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TokenStoreService,
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

    tokenStore = TestBed.inject(TokenStoreService);
    router = TestBed.inject(Router);
  });

  function runGuard(): Observable<boolean | UrlTree> {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    ) as Observable<boolean | UrlTree>;
  }

  it('should allow access when authenticated', async () => {
    tokenStore.setToken('valid-token');
    const result = await firstValueFrom(runGuard());
    expect(result).toBe(true);
  });

  it('should redirect to /auth/login when not authenticated', async () => {
    const result = await firstValueFrom(runGuard());
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toBeTruthy();
    expect(result).not.toBe(true);
  });
});

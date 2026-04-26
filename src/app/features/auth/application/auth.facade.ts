import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthApiService } from '../infrastructure/auth-api.service';
import { TokenStoreService } from '../infrastructure/token-store.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { LoginCommand, RegisterCommand } from '../domain/interfaces/auth.repository';

@Injectable({ providedIn: 'root' })
export class AuthFacade {
  private readonly authApi = inject(AuthApiService);
  private readonly tokenStore = inject(TokenStoreService);
  private readonly router = inject(Router);
  private readonly errorHandler = inject(ErrorHandlerService);

  readonly isAuthenticated$ = this.tokenStore.isAuthenticated$;
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  login(command: LoginCommand): void {
    this.loading.set(true);
    this.error.set(null);

    this.authApi.login(command).subscribe({
      next: (token) => {
        this.tokenStore.setToken(token.token);
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.errorHandler.extractMessage(err));
      },
    });
  }

  register(command: RegisterCommand): void {
    this.loading.set(true);
    this.error.set(null);

    this.authApi.register(command).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(this.errorHandler.extractMessage(err));
      },
    });
  }

  logout(): void {
    this.tokenStore.clearToken();
    this.router.navigate(['/auth/login']);
  }
}

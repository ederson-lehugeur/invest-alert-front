import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Token } from '../domain/models/token.model';

const STORAGE_KEY_ACCESS_TOKEN = 'auth.accessToken';
const STORAGE_KEY_REFRESH_TOKEN = 'auth.refreshToken';
const STORAGE_KEY_EXPIRES_AT = 'auth.accessTokenExpiresAt';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly tokenSubject = new BehaviorSubject<string | null>(
    this.isBrowser ? localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN) : null
  );
  private readonly permissionsSubject = new BehaviorSubject<readonly string[]>(
    this.extractPermissions(
      this.isBrowser ? (localStorage.getItem(STORAGE_KEY_ACCESS_TOKEN) ?? '') : ''
    )
  );

  readonly token$ = this.tokenSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((token) => token !== null));
  readonly permissions$ = this.permissionsSubject.asObservable();

  setTokens(tokenResponse: Token): void {
    const expiresAt = Date.now() + tokenResponse.accessTokenExpiresIn * 1000;

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_ACCESS_TOKEN, tokenResponse.accessToken);
      localStorage.setItem(STORAGE_KEY_REFRESH_TOKEN, tokenResponse.refreshToken);
      localStorage.setItem(STORAGE_KEY_EXPIRES_AT, String(expiresAt));
    }

    this.tokenSubject.next(tokenResponse.accessToken);
    this.permissionsSubject.next(this.extractPermissions(tokenResponse.accessToken));
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem(STORAGE_KEY_REFRESH_TOKEN) : null;
  }

  isAccessTokenExpired(): boolean {
    if (!this.isBrowser) {
      return true;
    }
    const expiresAt = localStorage.getItem(STORAGE_KEY_EXPIRES_AT);
    if (expiresAt === null) {
      return true;
    }
    // Consider expired 10 seconds early to avoid edge-case races
    return Date.now() >= Number(expiresAt) - 10_000;
  }

  clearTokens(): void {
    if (this.isBrowser) {
      localStorage.removeItem(STORAGE_KEY_ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEY_REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEY_EXPIRES_AT);
    }

    this.tokenSubject.next(null);
    this.permissionsSubject.next([]);
  }

  private extractPermissions(token: string): readonly string[] {
    try {
      const parts = token.split('.');
      if (parts.length < 2) {
        return [];
      }
      const payload = JSON.parse(atob(parts[1])) as Record<string, unknown>;
      return Array.isArray(payload['permissions'])
        ? (payload['permissions'] as string[])
        : [];
    } catch {
      return [];
    }
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Token } from '../domain/models/token.model';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private readonly permissionsSubject = new BehaviorSubject<readonly string[]>([]);
  private refreshToken: string | null = null;
  private accessTokenExpiresAt: number | null = null; // epoch ms

  readonly token$ = this.tokenSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((token) => token !== null));
  readonly permissions$ = this.permissionsSubject.asObservable();

  setTokens(tokenResponse: Token): void {
    this.tokenSubject.next(tokenResponse.accessToken);
    this.refreshToken = tokenResponse.refreshToken;
    this.accessTokenExpiresAt = Date.now() + tokenResponse.accessTokenExpiresIn * 1000;
    this.permissionsSubject.next(this.extractPermissions(tokenResponse.accessToken));
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  isAccessTokenExpired(): boolean {
    if (this.accessTokenExpiresAt === null) {
      return true;
    }
    // Consider expired 10 seconds early to avoid edge-case races
    return Date.now() >= this.accessTokenExpiresAt - 10_000;
  }

  clearTokens(): void {
    this.tokenSubject.next(null);
    this.refreshToken = null;
    this.accessTokenExpiresAt = null;
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

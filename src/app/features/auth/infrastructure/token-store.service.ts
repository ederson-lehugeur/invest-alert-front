import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);
  private readonly permissionsSubject = new BehaviorSubject<readonly string[]>([]);

  readonly token$ = this.tokenSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((token) => token !== null));
  readonly permissions$ = this.permissionsSubject.asObservable();

  setToken(token: string): void {
    this.tokenSubject.next(token);
    this.permissionsSubject.next(this.extractPermissions(token));
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  clearToken(): void {
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

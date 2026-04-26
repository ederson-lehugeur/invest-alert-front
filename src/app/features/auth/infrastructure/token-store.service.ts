import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TokenStoreService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(null);

  readonly token$ = this.tokenSubject.asObservable();
  readonly isAuthenticated$ = this.token$.pipe(map((token) => token !== null));

  setToken(token: string): void {
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    return this.tokenSubject.getValue();
  }

  clearToken(): void {
    this.tokenSubject.next(null);
  }
}

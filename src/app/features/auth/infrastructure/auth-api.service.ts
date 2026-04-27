import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthRepository, RegisterCommand, LoginCommand } from '../domain/interfaces/auth.repository';
import { User } from '../domain/models/user.model';
import { Token } from '../domain/models/token.model';
import { mapUserResponse, UserApiResponse } from './mappers/user.mapper';

@Injectable({ providedIn: 'root' })
export class AuthApiService implements AuthRepository {
  private readonly http = inject(HttpClient);

  register(command: RegisterCommand): Observable<User> {
    return this.http
      .post<UserApiResponse>('/api/v1/auth/register', command)
      .pipe(map(mapUserResponse));
  }

  login(command: LoginCommand): Observable<Token> {
    return this.http.post<Token>('/api/v1/auth/login', command);
  }
}

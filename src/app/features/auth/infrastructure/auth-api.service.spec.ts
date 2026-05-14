import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';
import { UserApiResponse } from './mappers/user.mapper';
import { Token } from '../domain/models/token.model';

const mockTokenResponse: Token = {
  accessToken: 'jwt-token-123',
  refreshToken: 'rt-abc',
  accessTokenExpiresIn: 900,
  refreshTokenExpiresIn: 604800,
};

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthApiService,
      ],
    });

    service = TestBed.inject(AuthApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('register', () => {
    it('should POST to /api/v1/auth/register and map response to User domain model', () => {
      const command = { name: 'John', email: 'john@example.com', password: 'secret' };
      const apiResponse: UserApiResponse = {
        id: 1,
        name: 'John',
        email: 'john@example.com',
        createdAt: '2025-06-01T12:00:00.000Z',
      };

      service.register(command).subscribe((user) => {
        expect(user.id).toBe(1);
        expect(user.name).toBe('John');
        expect(user.email).toBe('john@example.com');
        expect(user.createdAt).toBeInstanceOf(Date);
        expect(user.createdAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
      });

      const req = httpTesting.expectOne('/api/v1/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(apiResponse);
    });
  });

  describe('login', () => {
    it('should POST to /api/v1/auth/login and return Token with all fields', () => {
      const command = { email: 'john@example.com', password: 'secret' };

      service.login(command).subscribe((token) => {
        expect(token.accessToken).toBe('jwt-token-123');
        expect(token.refreshToken).toBe('rt-abc');
        expect(token.accessTokenExpiresIn).toBe(900);
        expect(token.refreshTokenExpiresIn).toBe(604800);
      });

      const req = httpTesting.expectOne('/api/v1/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(mockTokenResponse);
    });
  });

  describe('refresh', () => {
    it('should POST to /api/v1/auth/refresh with refreshToken body and return new Token', () => {
      service.refresh('rt-abc').subscribe((token) => {
        expect(token.accessToken).toBe('jwt-token-123');
        expect(token.refreshToken).toBe('rt-abc');
        expect(token.accessTokenExpiresIn).toBe(900);
        expect(token.refreshTokenExpiresIn).toBe(604800);
      });

      const req = httpTesting.expectOne('/api/v1/auth/refresh');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'rt-abc' });
      req.flush(mockTokenResponse);
    });
  });

  describe('logout', () => {
    it('should POST to /api/v1/auth/logout with refreshToken body', () => {
      service.logout('rt-abc').subscribe();

      const req = httpTesting.expectOne('/api/v1/auth/logout');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refreshToken: 'rt-abc' });
      req.flush(null, { status: 204, statusText: 'No Content' });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';
import { UserApiResponse } from './mappers/user.mapper';

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
    it('should POST to /api/auth/register and map response to User domain model', () => {
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

      const req = httpTesting.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(apiResponse);
    });
  });

  describe('login', () => {
    it('should POST to /api/auth/login and return Token directly', () => {
      const command = { email: 'john@example.com', password: 'secret' };
      const tokenResponse = { token: 'jwt-token-123', expiresIn: 3600 };

      service.login(command).subscribe((token) => {
        expect(token.token).toBe('jwt-token-123');
        expect(token.expiresIn).toBe(3600);
      });

      const req = httpTesting.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(command);
      req.flush(tokenResponse);
    });
  });
});

import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    service = new ErrorHandlerService();
  });

  it('should extract message from a valid ErrorResponse body', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: {
        timestamp: '2025-01-01T00:00:00Z',
        status: 400,
        error: 'Bad Request',
        message: 'Ticker is required',
      },
    });

    expect(service.extractMessage(error)).toBe('Ticker is required');
  });

  it('should extract message from 409 ErrorResponse body', () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: {
        timestamp: '2025-01-01T00:00:00Z',
        status: 409,
        error: 'Conflict',
        message: 'Email already exists',
      },
    });

    expect(service.extractMessage(error)).toBe('Email already exists');
  });

  it('should return default message for 400 without ErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 400, error: 'bad' });
    expect(service.extractMessage(error)).toBe(
      'Invalid request. Please check your input.'
    );
  });

  it('should return default message for 401 without ErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 401, error: null });
    expect(service.extractMessage(error)).toBe(
      'Invalid credentials. Please try again.'
    );
  });

  it('should return default message for 403 without ErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 403, error: null });
    expect(service.extractMessage(error)).toBe(
      'Access denied. You do not have permission to perform this action.'
    );
  });

  it('should return default message for 404 without ErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 404, error: null });
    expect(service.extractMessage(error)).toBe(
      'The requested resource was not found.'
    );
  });

  it('should return default message for 409 without ErrorResponse body', () => {
    const error = new HttpErrorResponse({ status: 409, error: null });
    expect(service.extractMessage(error)).toBe(
      'A conflict occurred. The resource may already exist.'
    );
  });

  it('should return generic server message for 500 errors', () => {
    const error = new HttpErrorResponse({ status: 500, error: null });
    expect(service.extractMessage(error)).toBe(
      'Server is unavailable. Please try again later.'
    );
  });

  it('should return generic server message for 503 errors', () => {
    const error = new HttpErrorResponse({ status: 503, error: null });
    expect(service.extractMessage(error)).toBe(
      'Server is unavailable. Please try again later.'
    );
  });

  it('should return network error message for status 0', () => {
    const error = new HttpErrorResponse({ status: 0, error: null });
    expect(service.extractMessage(error)).toBe(
      'Unable to connect to the server. Please check your connection.'
    );
  });

  it('should return generic message for unknown status codes', () => {
    const error = new HttpErrorResponse({ status: 418, error: null });
    expect(service.extractMessage(error)).toBe('An unexpected error occurred.');
  });
});

import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../../shared/models/error-response.model';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input.',
  401: 'Invalid credentials. Please try again.',
  403: 'Access denied. You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. The resource may already exist.',
};

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  extractMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'Unable to connect to the server. Please check your connection.';
    }

    if (this.isErrorResponse(error.error)) {
      return error.error.message;
    }

    if (error.status >= 500) {
      return 'Server is unavailable. Please try again later.';
    }

    return STATUS_MESSAGES[error.status] ?? 'An unexpected error occurred.';
  }

  private isErrorResponse(body: unknown): body is ErrorResponse {
    return (
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      'status' in body &&
      'error' in body &&
      'timestamp' in body
    );
  }
}

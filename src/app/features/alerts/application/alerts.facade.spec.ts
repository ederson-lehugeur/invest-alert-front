import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AlertsFacade } from './alerts.facade';
import { AlertsApiService } from '../infrastructure/alerts-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Alert } from '../domain/models/alert.model';
import { PageResult } from '../../../shared/models/page-result.model';

describe('AlertsFacade', () => {
  let facade: AlertsFacade;
  let alertsApi: { list: ReturnType<typeof vi.fn> };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

  const mockAlert: Alert = {
    id: 1,
    ticker: 'PETR4',
    status: 'PENDING',
    details: 'Price crossed threshold',
    createdAt: new Date('2025-06-01T12:00:00.000Z'),
    sentAt: null,
  };

  const mockPageResult: PageResult<Alert> = {
    content: [mockAlert],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(() => {
    alertsApi = {
      list: vi.fn(),
    };

    errorHandler = {
      extractMessage: vi.fn().mockReturnValue('Something went wrong'),
    };

    TestBed.configureTestingModule({
      providers: [
        AlertsFacade,
        { provide: AlertsApiService, useValue: alertsApi },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    facade = TestBed.inject(AlertsFacade);
  });

  describe('loadAlerts', () => {
    it('should load alerts and update state on success', () => {
      alertsApi.list.mockReturnValue(of(mockPageResult));

      let alerts: PageResult<Alert> | null = null;
      facade.alerts$.subscribe((v) => (alerts = v));

      facade.loadAlerts({}, 0, 20);

      expect(alertsApi.list).toHaveBeenCalledWith({}, 0, 20);
      expect(alerts).toEqual(mockPageResult);
    });

    it('should set isLoading to false after successful load', () => {
      alertsApi.list.mockReturnValue(of(mockPageResult));

      let isLoading = true;
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadAlerts({}, 0, 20);

      expect(isLoading).toBe(false);
    });

    it('should set error and reset loading on failure', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: null });
      alertsApi.list.mockReturnValue(throwError(() => httpError));
      errorHandler.extractMessage.mockReturnValue('Server is unavailable. Please try again later.');

      let error: string | null = null;
      let isLoading = true;
      facade.error$.subscribe((v) => (error = v));
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadAlerts({}, 0, 20);

      expect(isLoading).toBe(false);
      expect(error).toBe('Server is unavailable. Please try again later.');
      expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
    });

    it('should clear previous error when loading starts', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: null });
      alertsApi.list.mockReturnValue(throwError(() => httpError));
      facade.loadAlerts({}, 0, 20);

      alertsApi.list.mockReturnValue(of(mockPageResult));

      let error: string | null = 'old error';
      facade.error$.subscribe((v) => (error = v));

      facade.loadAlerts({}, 0, 20);

      expect(error).toBeNull();
    });

    it('should pass filter params to API service', () => {
      alertsApi.list.mockReturnValue(of(mockPageResult));

      const filter = { ticker: 'PETR4', status: 'PENDING' as const };
      facade.loadAlerts(filter, 1, 10);

      expect(alertsApi.list).toHaveBeenCalledWith(filter, 1, 10);
    });
  });
});

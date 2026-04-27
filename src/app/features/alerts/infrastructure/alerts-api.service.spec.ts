import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AlertsApiService } from './alerts-api.service';
import { AlertApiResponse } from './mappers/alert.mapper';
import { PageResult } from '../../../shared/models/page-result.model';

describe('AlertsApiService', () => {
  let service: AlertsApiService;
  let httpTesting: HttpTestingController;

  const alertApiResponse: AlertApiResponse = {
    id: 1,
    ticker: 'PETR4',
    status: 'PENDING',
    details: 'Price crossed threshold',
    createdAt: '2025-06-01T12:00:00.000Z',
    sentAt: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AlertsApiService,
      ],
    });

    service = TestBed.inject(AlertsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    const apiPage: PageResult<AlertApiResponse> = {
      content: [alertApiResponse],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    it('should GET /api/v1/alerts with only page and size when no filters', () => {
      service.list({}, 0, 20).subscribe((result) => {
        expect(result.page).toBe(0);
        expect(result.size).toBe(20);
        expect(result.totalElements).toBe(1);
        expect(result.totalPages).toBe(1);
        expect(result.content).toHaveLength(1);
        expect(result.content[0].ticker).toBe('PETR4');
        expect(result.content[0].createdAt).toBeInstanceOf(Date);
      });

      const req = httpTesting.expectOne('/api/v1/alerts?page=0&size=20');
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });

    it('should include ticker param when filter has ticker', () => {
      service.list({ ticker: 'VALE3' }, 0, 20).subscribe();

      const req = httpTesting.expectOne('/api/v1/alerts?page=0&size=20&ticker=VALE3');
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });

    it('should include status param when filter has status', () => {
      service.list({ status: 'SENT' }, 0, 20).subscribe();

      const req = httpTesting.expectOne('/api/v1/alerts?page=0&size=20&status=SENT');
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });

    it('should include both ticker and status params when both filters are set', () => {
      service.list({ ticker: 'PETR4', status: 'PENDING' }, 1, 10).subscribe();

      const req = httpTesting.expectOne(
        '/api/v1/alerts?page=1&size=10&ticker=PETR4&status=PENDING',
      );
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });

    it('should map response through mapAlertResponse', () => {
      const sentAlert: AlertApiResponse = {
        id: 2,
        ticker: 'VALE3',
        status: 'SENT',
        details: 'Dividend yield alert',
        createdAt: '2025-06-01T10:00:00.000Z',
        sentAt: '2025-06-01T11:00:00.000Z',
      };

      const pageWithSentAlert: PageResult<AlertApiResponse> = {
        content: [sentAlert],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };

      service.list({}, 0, 20).subscribe((result) => {
        const alert = result.content[0];
        expect(alert.id).toBe(2);
        expect(alert.ticker).toBe('VALE3');
        expect(alert.status).toBe('SENT');
        expect(alert.details).toBe('Dividend yield alert');
        expect(alert.createdAt).toBeInstanceOf(Date);
        expect(alert.createdAt.toISOString()).toBe('2025-06-01T10:00:00.000Z');
        expect(alert.sentAt).toBeInstanceOf(Date);
        expect(alert.sentAt!.toISOString()).toBe('2025-06-01T11:00:00.000Z');
      });

      const req = httpTesting.expectOne('/api/v1/alerts?page=0&size=20');
      expect(req.request.method).toBe('GET');
      req.flush(pageWithSentAlert);
    });
  });
});

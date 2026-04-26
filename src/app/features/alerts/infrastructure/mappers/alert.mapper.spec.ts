import {
  AlertApiResponse,
  mapAlertResponse,
  mapAlertToApiFormat,
  mapPageResult,
} from './alert.mapper';
import { Alert } from '../../domain/models/alert.model';
import { PageResult } from '../../../../shared/models/page-result.model';

describe('alert.mapper', () => {
  const apiResponse: AlertApiResponse = {
    id: 1,
    ticker: 'PETR4',
    status: 'SENT',
    details: 'Price crossed threshold',
    createdAt: '2025-06-01T12:00:00.000Z',
    sentAt: '2025-06-01T12:05:00.000Z',
  };

  const pendingApiResponse: AlertApiResponse = {
    id: 2,
    ticker: 'VALE3',
    status: 'PENDING',
    details: 'Dividend yield alert',
    createdAt: '2025-07-15T08:30:00.000Z',
    sentAt: null,
  };

  describe('mapAlertResponse', () => {
    it('should convert API response to Alert domain model with sentAt date', () => {
      const alert = mapAlertResponse(apiResponse);

      expect(alert.id).toBe(1);
      expect(alert.ticker).toBe('PETR4');
      expect(alert.status).toBe('SENT');
      expect(alert.details).toBe('Price crossed threshold');
      expect(alert.createdAt).toBeInstanceOf(Date);
      expect(alert.createdAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
      expect(alert.sentAt).toBeInstanceOf(Date);
      expect(alert.sentAt!.toISOString()).toBe('2025-06-01T12:05:00.000Z');
    });

    it('should convert API response with null sentAt to null', () => {
      const alert = mapAlertResponse(pendingApiResponse);

      expect(alert.id).toBe(2);
      expect(alert.ticker).toBe('VALE3');
      expect(alert.status).toBe('PENDING');
      expect(alert.createdAt).toBeInstanceOf(Date);
      expect(alert.sentAt).toBeNull();
    });
  });

  describe('mapAlertToApiFormat', () => {
    it('should convert Alert domain model to API format with ISO strings', () => {
      const alert: Alert = {
        id: 1,
        ticker: 'PETR4',
        status: 'SENT',
        details: 'Price crossed threshold',
        createdAt: new Date('2025-06-01T12:00:00.000Z'),
        sentAt: new Date('2025-06-01T12:05:00.000Z'),
      };

      const result = mapAlertToApiFormat(alert);

      expect(result.id).toBe(1);
      expect(result.ticker).toBe('PETR4');
      expect(result.status).toBe('SENT');
      expect(result.details).toBe('Price crossed threshold');
      expect(typeof result.createdAt).toBe('string');
      expect(result.createdAt).toBe('2025-06-01T12:00:00.000Z');
      expect(typeof result.sentAt).toBe('string');
      expect(result.sentAt).toBe('2025-06-01T12:05:00.000Z');
    });

    it('should convert Alert with null sentAt to null in API format', () => {
      const alert: Alert = {
        id: 2,
        ticker: 'VALE3',
        status: 'PENDING',
        details: 'Dividend yield alert',
        createdAt: new Date('2025-07-15T08:30:00.000Z'),
        sentAt: null,
      };

      const result = mapAlertToApiFormat(alert);

      expect(result.sentAt).toBeNull();
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapAlertResponse then mapAlertToApiFormat', () => {
      const roundTripped = mapAlertToApiFormat(mapAlertResponse(apiResponse));
      expect(roundTripped).toEqual(apiResponse);
    });

    it('should produce equivalent object for alert with null sentAt', () => {
      const roundTripped = mapAlertToApiFormat(mapAlertResponse(pendingApiResponse));
      expect(roundTripped).toEqual(pendingApiResponse);
    });
  });

  describe('mapPageResult (re-exported)', () => {
    it('should map a PageResult of AlertApiResponse to PageResult of Alert', () => {
      const apiPage: PageResult<AlertApiResponse> = {
        content: [apiResponse, pendingApiResponse],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      };

      const result = mapPageResult(apiPage, mapAlertResponse);

      expect(result.page).toBe(0);
      expect(result.size).toBe(20);
      expect(result.totalElements).toBe(2);
      expect(result.totalPages).toBe(1);
      expect(result.content).toHaveLength(2);
      expect(result.content[0].createdAt).toBeInstanceOf(Date);
      expect(result.content[0].sentAt).toBeInstanceOf(Date);
      expect(result.content[1].sentAt).toBeNull();
    });
  });
});

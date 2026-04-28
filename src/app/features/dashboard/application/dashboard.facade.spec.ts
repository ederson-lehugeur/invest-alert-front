import { TestBed } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardFacade } from './dashboard.facade';
import { AssetsApiService } from '../../assets/infrastructure/assets-api.service';
import { AlertsApiService } from '../../alerts/infrastructure/alerts-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { PageResult } from '../../../shared/models/page-result.model';
import { Asset } from '../../assets/domain/models/asset.model';
import { Alert } from '../../alerts/domain/models/alert.model';

function buildAssetPage(totalElements: number): PageResult<Asset> {
  return { content: [], page: 0, size: 1, totalElements, totalPages: totalElements };
}

function buildAlertPage(totalElements: number, content: Alert[] = []): PageResult<Alert> {
  return { content, page: 0, size: content.length || 1, totalElements, totalPages: 1 };
}

const sampleAlerts: Alert[] = [
  { id: 1, ticker: 'PETR4', status: 'PENDING', details: 'Price > 30', createdAt: new Date(), sentAt: null },
  { id: 2, ticker: 'VALE3', status: 'SENT', details: 'DY < 5%', createdAt: new Date(), sentAt: new Date() },
];

describe('DashboardFacade', () => {
  let facade: DashboardFacade;
  let assetsApi: { list: ReturnType<typeof vi.fn> };
  let alertsApi: { list: ReturnType<typeof vi.fn> };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    assetsApi = { list: vi.fn() };
    alertsApi = { list: vi.fn() };
    errorHandler = { extractMessage: vi.fn().mockReturnValue('Something went wrong') };

    TestBed.configureTestingModule({
      providers: [
        DashboardFacade,
        { provide: AssetsApiService, useValue: assetsApi },
        { provide: AlertsApiService, useValue: alertsApi },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    facade = TestBed.inject(DashboardFacade);
  });

  function setupSuccessResponses(
    totalAssets = 42,
    totalPending = 7,
    totalSent = 15,
    recentContent: Alert[] = sampleAlerts,
  ): void {
    assetsApi.list.mockReturnValue(of(buildAssetPage(totalAssets)));
    alertsApi.list.mockImplementation((filter: { status?: string }, _page: number, _size: number) => {
      if (filter.status === 'PENDING') return of(buildAlertPage(totalPending));
      if (filter.status === 'SENT') return of(buildAlertPage(totalSent));
      return of(buildAlertPage(recentContent.length, recentContent));
    });
  }

  it('should set isLoading to true when loadDashboard is called', () => {
    const assets$ = new Subject<PageResult<Asset>>();
    const pending$ = new Subject<PageResult<Alert>>();
    const sent$ = new Subject<PageResult<Alert>>();
    const recent$ = new Subject<PageResult<Alert>>();

    assetsApi.list.mockReturnValue(assets$.asObservable());
    alertsApi.list.mockImplementation((filter: { status?: string }) => {
      if (filter.status === 'PENDING') return pending$.asObservable();
      if (filter.status === 'SENT') return sent$.asObservable();
      return recent$.asObservable();
    });

    let isLoading: boolean | undefined;
    facade.isLoading$.subscribe((v) => (isLoading = v));

    facade.loadDashboard();

    expect(isLoading).toBe(true);
  });

  it('should correctly extract totalElements from assets API response', () => {
    setupSuccessResponses(100);

    let totalAssets: number | null | undefined;
    facade.totalAssets$.subscribe((v) => (totalAssets = v));

    facade.loadDashboard();

    expect(totalAssets).toBe(100);
  });

  it('should correctly extract totalElements from pending alerts API response', () => {
    setupSuccessResponses(42, 23);

    let pendingAlerts: number | null | undefined;
    facade.pendingAlerts$.subscribe((v) => (pendingAlerts = v));

    facade.loadDashboard();

    expect(pendingAlerts).toBe(23);
  });

  it('should correctly extract totalElements from sent alerts API response', () => {
    setupSuccessResponses(42, 7, 99);

    let sentAlerts: number | null | undefined;
    facade.sentAlerts$.subscribe((v) => (sentAlerts = v));

    facade.loadDashboard();

    expect(sentAlerts).toBe(99);
  });

  it('should correctly extract content from recent alerts API response', () => {
    setupSuccessResponses(42, 7, 15, sampleAlerts);

    let recentAlerts: Alert[] | undefined;
    facade.recentAlerts$.subscribe((v) => (recentAlerts = v));

    facade.loadDashboard();

    expect(recentAlerts).toEqual(sampleAlerts);
  });

  it('should set isLoading to false after successful load', () => {
    setupSuccessResponses();

    let isLoading: boolean | undefined;
    facade.isLoading$.subscribe((v) => (isLoading = v));

    facade.loadDashboard();

    expect(isLoading).toBe(false);
  });

  it('should set error state on API failure', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    assetsApi.list.mockReturnValue(throwError(() => httpError));
    alertsApi.list.mockReturnValue(of(buildAlertPage(0)));

    let error: string | null | undefined;
    facade.error$.subscribe((v) => (error = v));

    facade.loadDashboard();

    expect(error).toBe('Something went wrong');
  });

  it('should set isLoading to false after API failure', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    assetsApi.list.mockReturnValue(throwError(() => httpError));
    alertsApi.list.mockReturnValue(of(buildAlertPage(0)));

    let isLoading: boolean | undefined;
    facade.isLoading$.subscribe((v) => (isLoading = v));

    facade.loadDashboard();

    expect(isLoading).toBe(false);
  });

  it('should call ErrorHandlerService.extractMessage() on API failure', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    assetsApi.list.mockReturnValue(throwError(() => httpError));
    alertsApi.list.mockReturnValue(of(buildAlertPage(0)));

    facade.loadDashboard();

    expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
  });
});

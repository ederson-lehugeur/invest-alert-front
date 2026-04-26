import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { AlertsPageComponent } from './alerts-page.component';
import { AlertsFacade } from '../../application/alerts.facade';
import { Alert } from '../../domain/models/alert.model';
import { PageResult } from '../../../../shared/models/page-result.model';

describe('AlertsPageComponent', () => {
  let component: AlertsPageComponent;
  let fixture: ComponentFixture<AlertsPageComponent>;
  let mockFacade: {
    loadAlerts: ReturnType<typeof vi.fn>;
    alerts$: BehaviorSubject<PageResult<Alert> | null>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };

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

  beforeEach(async () => {
    mockFacade = {
      loadAlerts: vi.fn(),
      alerts$: new BehaviorSubject<PageResult<Alert> | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AlertsPageComponent],
      providers: [
        { provide: AlertsFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call loadAlerts on init with default params', () => {
    expect(mockFacade.loadAlerts).toHaveBeenCalledWith({}, 0, 20);
  });

  it('should display loading indicator when loading', () => {
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should not display loading indicator when not loading', () => {
    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeFalsy();
  });

  it('should display error message when error exists', () => {
    mockFacade.error$.next('Something went wrong');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should render alerts table when data is available', () => {
    mockFacade.alerts$.next(mockPageResult);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.alerts-table__row');
    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll('td');
    expect(cells[0].textContent).toContain('PETR4');
    expect(cells[1].textContent).toContain('PENDING');
    expect(cells[2].textContent).toContain('Price crossed threshold');
  });

  it('should display empty message when no alerts', () => {
    mockFacade.alerts$.next({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.alerts-page__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('No alerts found');
  });

  it('should render pagination when multiple pages exist', () => {
    mockFacade.alerts$.next({
      ...mockPageResult,
      totalPages: 3,
    });
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('app-pagination');
    expect(pagination).toBeTruthy();
  });

  it('should call loadAlerts with new page on page change preserving current filter', () => {
    component.filterTicker = 'PETR4';
    component.filterStatus = 'PENDING';
    mockFacade.loadAlerts.mockClear();

    component['onPageChange'](2);

    expect(mockFacade.loadAlerts).toHaveBeenCalledWith(
      { ticker: 'PETR4', status: 'PENDING' },
      2,
      20,
    );
  });

  it('should render filter controls', () => {
    const tickerInput = fixture.nativeElement.querySelector('.alerts-page__filter-input');
    const statusSelect = fixture.nativeElement.querySelector('.alerts-page__filter-select');
    const filterButton = fixture.nativeElement.querySelector('.alerts-page__filter-button');

    expect(tickerInput).toBeTruthy();
    expect(statusSelect).toBeTruthy();
    expect(filterButton).toBeTruthy();
  });

  it('should call loadAlerts with filter and page 0 when filter is applied', () => {
    component.filterTicker = 'VALE3';
    component.filterStatus = 'SENT';
    mockFacade.loadAlerts.mockClear();

    component['onFilterChange']();

    expect(mockFacade.loadAlerts).toHaveBeenCalledWith(
      { ticker: 'VALE3', status: 'SENT' },
      0,
      20,
    );
  });
});

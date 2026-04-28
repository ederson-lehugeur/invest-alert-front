import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { AlertsPageComponent } from './alerts-page.component';
import { AlertsFacade } from '../../application/alerts.facade';
import { FilterStateService } from '../../../../core/services/filter-state.service';
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
  let mockFilterStateService: {
    save: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
  };

  const mockAlert: Alert = {
    id: 1,
    ticker: 'PETR4',
    status: 'PENDING',
    details: 'Price crossed threshold',
    createdAt: new Date('2025-06-01T12:00:00.000Z'),
    sentAt: null,
  };

  const mockSentAlert: Alert = {
    id: 2,
    ticker: 'VALE3',
    status: 'SENT',
    details: 'Dividend yield alert',
    createdAt: new Date('2025-06-01T10:00:00.000Z'),
    sentAt: new Date('2025-06-01T11:00:00.000Z'),
  };

  const mockPageResult: PageResult<Alert> = {
    content: [mockAlert, mockSentAlert],
    page: 0,
    size: 20,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockFacade = {
      loadAlerts: vi.fn(),
      alerts$: new BehaviorSubject<PageResult<Alert> | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
    };

    mockFilterStateService = {
      save: vi.fn(),
      load: vi.fn().mockReturnValue(null),
      clear: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AlertsPageComponent, BrowserAnimationsModule],
      providers: [
        { provide: AlertsFacade, useValue: mockFacade },
        { provide: FilterStateService, useValue: mockFilterStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call loadAlerts on init with default params', () => {
    expect(mockFacade.loadAlerts).toHaveBeenCalledWith({}, 0, 20);
  });

  it('should display skeleton loader when loading', () => {
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should not display skeleton loader when not loading', () => {
    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeFalsy();
  });

  it('should display error message when error exists', () => {
    mockFacade.error$.next('Something went wrong');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should render reusable table when data is available', () => {
    mockFacade.alerts$.next(mockPageResult);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('app-reusable-table');
    expect(table).toBeTruthy();
  });

  it('should display empty state when no alerts match', () => {
    mockFacade.alerts$.next({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('should render filter controls with MatFormField', () => {
    const formFields = fixture.nativeElement.querySelectorAll('mat-form-field');
    expect(formFields.length).toBe(2);
  });

  it('should render status chips with correct CSS classes', () => {
    mockFacade.alerts$.next(mockPageResult);
    fixture.detectChanges();

    const chips = fixture.nativeElement.querySelectorAll('mat-chip');
    expect(chips.length).toBe(2);

    const pendingChip = fixture.nativeElement.querySelector('.chip--pending');
    const sentChip = fixture.nativeElement.querySelector('.chip--sent');
    expect(pendingChip).toBeTruthy();
    expect(sentChip).toBeTruthy();
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

  it('should save filter state when filter changes', () => {
    component.filterTicker = 'PETR4';
    component.filterStatus = 'PENDING';

    component['onFilterChange']();

    expect(mockFilterStateService.save).toHaveBeenCalledWith('alerts-filter', {
      ticker: 'PETR4',
      status: 'PENDING',
    });
  });

  it('should restore filter state from FilterStateService on init', async () => {
    mockFilterStateService.load.mockReturnValue({
      ticker: 'ITUB4',
      status: 'SENT',
    });
    mockFacade.loadAlerts.mockClear();

    const newFixture = TestBed.createComponent(AlertsPageComponent);
    const newComponent = newFixture.componentInstance;
    newFixture.detectChanges();

    expect(newComponent.filterTicker).toBe('ITUB4');
    expect(newComponent.filterStatus).toBe('SENT');
    expect(mockFacade.loadAlerts).toHaveBeenCalledWith(
      { ticker: 'ITUB4', status: 'SENT' },
      0,
      20,
    );
  });

  it('should call loadAlerts with new page on page change preserving current filter', () => {
    component.filterTicker = 'PETR4';
    component.filterStatus = 'PENDING';
    mockFacade.loadAlerts.mockClear();

    component['onPageChange']({ pageIndex: 2, pageSize: 20, length: 100 });

    expect(mockFacade.loadAlerts).toHaveBeenCalledWith(
      { ticker: 'PETR4', status: 'PENDING' },
      2,
      20,
    );
  });

  it('should render mat-paginator when data is available', () => {
    mockFacade.alerts$.next(mockPageResult);
    fixture.detectChanges();

    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
  });
});

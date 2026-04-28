import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardFacade } from '../../application/dashboard.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { Alert } from '../../../alerts/domain/models/alert.model';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  const isLoading$ = new BehaviorSubject<boolean>(false);
  const totalAssets$ = new BehaviorSubject<number | null>(null);
  const pendingAlerts$ = new BehaviorSubject<number | null>(null);
  const sentAlerts$ = new BehaviorSubject<number | null>(null);
  const recentAlerts$ = new BehaviorSubject<Alert[]>([]);
  const error$ = new BehaviorSubject<string | null>(null);

  const mockFacade = {
    loadDashboard: vi.fn(),
    isLoading$,
    totalAssets$,
    pendingAlerts$,
    sentAlerts$,
    recentAlerts$,
    error$,
  };

  const mockNotificationService = {
    showError: vi.fn(),
    showSuccess: vi.fn(),
  };

  const sampleAlerts: Alert[] = [
    { id: 1, ticker: 'PETR4', status: 'PENDING', details: 'Price above 30', createdAt: new Date(), sentAt: null },
    { id: 2, ticker: 'VALE3', status: 'SENT', details: 'Dividend yield below 5%', createdAt: new Date(), sentAt: new Date() },
  ];

  beforeEach(async () => {
    // Reset subjects to defaults
    isLoading$.next(false);
    totalAssets$.next(null);
    pendingAlerts$.next(null);
    sentAlerts$.next(null);
    recentAlerts$.next([]);
    error$.next(null);
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: DashboardFacade, useValue: mockFacade },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
  });

  it('should call facade.loadDashboard() on init', () => {
    fixture.detectChanges();
    expect(mockFacade.loadDashboard).toHaveBeenCalledTimes(1);
  });

  it('should show skeleton loaders while loading', () => {
    isLoading$.next(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton-loader');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should show summary cards when data is loaded', () => {
    isLoading$.next(false);
    totalAssets$.next(42);
    pendingAlerts$.next(7);
    sentAlerts$.next(15);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('app-reusable-card');
    expect(cards.length).toBe(3);

    const values = fixture.nativeElement.querySelectorAll('.card-value');
    expect(values[0].textContent.trim()).toBe('42');
    expect(values[1].textContent.trim()).toBe('7');
    expect(values[2].textContent.trim()).toBe('15');
  });

  it('should display recent alerts in a table', () => {
    isLoading$.next(false);
    recentAlerts$.next(sampleAlerts);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(2);
  });

  it('should show empty state when no recent alerts', () => {
    isLoading$.next(false);
    recentAlerts$.next([]);
    fixture.detectChanges();

    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No recent alerts');
  });

  it('should call notificationService.showError() when facade emits an error', () => {
    fixture.detectChanges();
    error$.next('Something went wrong');

    expect(mockNotificationService.showError).toHaveBeenCalledWith('Something went wrong');
  });

  it('should render the dashboard title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.dashboard__title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Dashboard');
  });
});

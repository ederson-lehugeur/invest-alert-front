/**
 * Bug Condition Exploration Test - Property 1: Date Rendered with Wrong Format Token
 *
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5**
 *
 * CRITICAL: This test MUST FAIL on unfixed code.
 * Failure confirms the bug exists. DO NOT fix the templates in this task.
 *
 * The test encodes the expected behavior (DD/MM/YYYY HH:mm:ss) and will pass
 * once the fix is applied in Task 3.
 *
 * Known date used: 2026-04-27T15:00:00Z
 * Expected output pattern: /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/
 * Example expected value: "27/04/2026 22:27:00" (UTC+7 offset example; exact time depends on TZ)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';

import { DashboardPageComponent } from './dashboard-page.component';
import { DashboardFacade } from '../../application/dashboard.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { Alert } from '../../../alerts/domain/models/alert.model';

import { AlertsPageComponent } from '../../../alerts/presentation/alerts-page/alerts-page.component';
import { AlertsFacade } from '../../../alerts/application/alerts.facade';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { PageResult } from '../../../../shared/models/page-result.model';

import { AssetsPageComponent } from '../../../assets/presentation/assets-page/assets-page.component';
import { AssetDetailPageComponent } from '../../../assets/presentation/asset-detail-page/asset-detail-page.component';
import { AssetsFacade } from '../../../assets/application/assets.facade';
import { Asset } from '../../../assets/domain/models/asset.model';

// Fixed known date used across all five binding sites
const KNOWN_DATE = new Date('2026-04-27T15:00:00Z');

// Expected output pattern: DD/MM/YYYY HH:mm:ss
const DATE_FORMAT_PATTERN = /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildAlertPageResult(alerts: Alert[]): PageResult<Alert> {
  return { content: alerts, page: 0, size: alerts.length, totalElements: alerts.length, totalPages: 1 };
}

function buildAssetPageResult(assets: Asset[]): PageResult<Asset> {
  return { content: assets, page: 0, size: assets.length, totalElements: assets.length, totalPages: 1 };
}

// ─── Binding Site 1: dashboard-page.component.html - alert.createdAt | date:'short' ───

describe('Bug Condition - Binding Site 1: dashboard-page alert.createdAt | date:\'short\'', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;

  const isLoading$ = new BehaviorSubject<boolean>(false);
  const totalAssets$ = new BehaviorSubject<number | null>(null);
  const pendingAlerts$ = new BehaviorSubject<number | null>(null);
  const sentAlerts$ = new BehaviorSubject<number | null>(null);
  const recentAlerts$ = new BehaviorSubject<Alert[]>([]);
  const error$ = new BehaviorSubject<string | null>(null);

  const mockDashboardFacade = {
    loadDashboard: vi.fn(),
    isLoading$,
    totalAssets$,
    pendingAlerts$,
    sentAlerts$,
    recentAlerts$,
    error$,
  };

  const mockNotificationService = { showError: vi.fn(), showSuccess: vi.fn() };

  const knownAlert: Alert = {
    id: 1,
    ticker: 'PETR4',
    status: 'PENDING',
    details: 'Price above threshold',
    createdAt: KNOWN_DATE,
    sentAt: null,
  };

  beforeEach(async () => {
    isLoading$.next(false);
    recentAlerts$.next([]);
    error$.next(null);
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: DashboardFacade, useValue: mockDashboardFacade },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
  });

  it('should render createdAt in DD/MM/YYYY HH:mm:ss format (FAILS on unfixed code)', () => {
    recentAlerts$.next([knownAlert]);
    fixture.detectChanges();

    // Find the createdAt cell in the recent alerts table
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBeGreaterThan(0);

    // The createdAt column is the 4th column (ticker, status, details, createdAt)
    const createdAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[3];
    expect(createdAtCell).toBeTruthy();

    const renderedText = createdAtCell.textContent?.trim() ?? '';
    // EXPECTED TO FAIL on unfixed code: 'short' format produces e.g. "4/27/26, 3:00 PM"
    expect(renderedText).toMatch(DATE_FORMAT_PATTERN);
  });
});

// ─── Binding Site 2: alerts-page.component.html - row.createdAt | date:'short' ───

describe('Bug Condition - Binding Site 2: alerts-page row.createdAt | date:\'short\'', () => {
  let fixture: ComponentFixture<AlertsPageComponent>;

  const mockAlertsFacade = {
    loadAlerts: vi.fn(),
    alerts$: new BehaviorSubject<PageResult<Alert> | null>(null),
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };

  const mockFilterStateService = {
    save: vi.fn(),
    load: vi.fn().mockReturnValue(null),
    clear: vi.fn(),
  };

  const knownAlert: Alert = {
    id: 1,
    ticker: 'PETR4',
    status: 'PENDING',
    details: 'Price above threshold',
    createdAt: KNOWN_DATE,
    sentAt: null,
  };

  beforeEach(async () => {
    mockAlertsFacade.alerts$.next(null);
    mockAlertsFacade.isLoading$.next(false);
    mockAlertsFacade.error$.next(null);
    vi.clearAllMocks();
    mockFilterStateService.load.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [AlertsPageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AlertsFacade, useValue: mockAlertsFacade },
        { provide: FilterStateService, useValue: mockFilterStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPageComponent);
    fixture.detectChanges();
  });

  it('should render createdAt in DD/MM/YYYY HH:mm:ss format (FAILS on unfixed code)', () => {
    mockAlertsFacade.alerts$.next(buildAlertPageResult([knownAlert]));
    fixture.detectChanges();

    // Find the createdAt cell - column index 3 (ticker, status, details, createdAt, sentAt)
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBeGreaterThan(0);

    const createdAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[3];
    expect(createdAtCell).toBeTruthy();

    const renderedText = createdAtCell.textContent?.trim() ?? '';
    // EXPECTED TO FAIL on unfixed code: 'short' format produces e.g. "4/27/26, 3:00 PM"
    expect(renderedText).toMatch(DATE_FORMAT_PATTERN);
  });
});

// ─── Binding Site 3: alerts-page.component.html - row.sentAt | date:'short' (non-null) ───

describe('Bug Condition - Binding Site 3: alerts-page row.sentAt | date:\'short\' (non-null)', () => {
  let fixture: ComponentFixture<AlertsPageComponent>;

  const mockAlertsFacade = {
    loadAlerts: vi.fn(),
    alerts$: new BehaviorSubject<PageResult<Alert> | null>(null),
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };

  const mockFilterStateService = {
    save: vi.fn(),
    load: vi.fn().mockReturnValue(null),
    clear: vi.fn(),
  };

  const knownAlertWithSentAt: Alert = {
    id: 2,
    ticker: 'VALE3',
    status: 'SENT',
    details: 'Dividend yield alert',
    createdAt: new Date('2026-04-27T14:00:00Z'),
    sentAt: KNOWN_DATE,
  };

  beforeEach(async () => {
    mockAlertsFacade.alerts$.next(null);
    mockAlertsFacade.isLoading$.next(false);
    mockAlertsFacade.error$.next(null);
    vi.clearAllMocks();
    mockFilterStateService.load.mockReturnValue(null);

    await TestBed.configureTestingModule({
      imports: [AlertsPageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AlertsFacade, useValue: mockAlertsFacade },
        { provide: FilterStateService, useValue: mockFilterStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPageComponent);
    fixture.detectChanges();
  });

  it('should render sentAt in DD/MM/YYYY HH:mm:ss format when non-null (FAILS on unfixed code)', () => {
    mockAlertsFacade.alerts$.next(buildAlertPageResult([knownAlertWithSentAt]));
    fixture.detectChanges();

    // sentAt is the 5th column (index 4): ticker, status, details, createdAt, sentAt
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBeGreaterThan(0);

    const sentAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[4];
    expect(sentAtCell).toBeTruthy();

    const renderedText = sentAtCell.textContent?.trim() ?? '';
    // EXPECTED TO FAIL on unfixed code: 'short' format produces e.g. "4/27/26, 3:00 PM"
    expect(renderedText).toMatch(DATE_FORMAT_PATTERN);
  });
});

// ─── Binding Site 4: assets-page.component.html - row.updatedAt | date:'short' ───

describe('Bug Condition - Binding Site 4: assets-page row.updatedAt | date:\'short\'', () => {
  let fixture: ComponentFixture<AssetsPageComponent>;
  let mockAssetsFacade: {
    loadAssets: ReturnType<typeof vi.fn>;
    loadAssetByTicker: ReturnType<typeof vi.fn>;
    assets$: BehaviorSubject<PageResult<Asset> | null>;
    selectedAsset$: BehaviorSubject<Asset | null>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };

  const knownAsset: Asset = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: KNOWN_DATE,
  };

  beforeEach(async () => {
    mockAssetsFacade = {
      loadAssets: vi.fn(),
      loadAssetByTicker: vi.fn(),
      assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
      selectedAsset$: new BehaviorSubject<Asset | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AssetsPageComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: AssetsFacade, useValue: mockAssetsFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetsPageComponent);
    // Set initial data before ngOnInit so the BehaviorSubject emits on subscription
    mockAssetsFacade.assets$.next(buildAssetPageResult([knownAsset]));
    fixture.detectChanges();
  });

  it('should render updatedAt in DD/MM/YYYY HH:mm:ss format (FAILS on unfixed code)', () => {
    // updatedAt is the 6th column (index 5): ticker, name, currentPrice, dividendYield, pVp, updatedAt
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBeGreaterThan(0);

    const updatedAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[5];
    expect(updatedAtCell).toBeTruthy();

    const renderedText = updatedAtCell.textContent?.trim() ?? '';
    // EXPECTED TO FAIL on unfixed code: 'short' format produces e.g. "4/27/26, 3:00 PM"
    expect(renderedText).toMatch(DATE_FORMAT_PATTERN);
  });
});

// ─── Binding Site 5: asset-detail-page.component.html - asset.updatedAt | date:'medium' ───

describe('Bug Condition - Binding Site 5: asset-detail-page asset.updatedAt | date:\'medium\'', () => {
  let fixture: ComponentFixture<AssetDetailPageComponent>;

  const mockAssetsFacade = {
    loadAssets: vi.fn(),
    loadAssetByTicker: vi.fn(),
    assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
    selectedAsset$: new BehaviorSubject<Asset | null>(null),
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };

  const knownAsset: Asset = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: KNOWN_DATE,
  };

  beforeEach(async () => {
    mockAssetsFacade.selectedAsset$.next(null);
    mockAssetsFacade.isLoading$.next(false);
    mockAssetsFacade.error$.next(null);
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [AssetDetailPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AssetsFacade, useValue: mockAssetsFacade },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: (_key: string) => 'PETR4' } },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AssetDetailPageComponent);
    fixture.detectChanges();
  });

  it('should render updatedAt in DD/MM/YYYY HH:mm:ss format (FAILS on unfixed code)', () => {
    mockAssetsFacade.selectedAsset$.next(knownAsset);
    fixture.detectChanges();

    // The "Updated At" detail row is the 4th detail row (index 3)
    const detailRows = fixture.nativeElement.querySelectorAll('.detail-row');
    expect(detailRows.length).toBe(4);

    const updatedAtRow = detailRows[3];
    const dd = updatedAtRow.querySelector('dd');
    expect(dd).toBeTruthy();

    const renderedText = dd.textContent?.trim() ?? '';
    // EXPECTED TO FAIL on unfixed code: 'medium' format produces e.g. "Apr 27, 2026, 3:00:00 PM"
    expect(renderedText).toMatch(DATE_FORMAT_PATTERN);
  });
});

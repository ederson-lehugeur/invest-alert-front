/**
 * Preservation Property Tests - Property 2: Non-Date and Null-Date Bindings Unchanged
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * IMPORTANT: These tests MUST PASS on UNFIXED code.
 * They verify existing correct behavior that must be preserved after the fix.
 * They should continue to pass after the fix is applied (regression prevention).
 *
 * Observation-first methodology:
 * - sentAt = null renders '-' (ternary guard: row.sentAt ? ... : '-')
 * - Non-date columns (ticker, status, details, name, price, dividendYield, pVp) render raw values
 * - Loading skeleton states display while data is being fetched
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ActivatedRoute } from '@angular/router';
import * as fc from 'fast-check';

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

// ─── Arbitraries ────────────────────────────────────────────────────────────

/** Generates arbitrary valid Date objects spanning a wide range */
const dateArb = fc.date({
  min: new Date('2000-01-01T00:00:00Z'),
  max: new Date('2099-12-31T23:59:59Z'),
});

/** Generates arbitrary non-empty ticker strings (uppercase alphanumeric, 1-6 chars) */
const tickerArb = fc.stringMatching(/^[A-Z][A-Z0-9]{0,5}$/);

/** Generates arbitrary status values */
const statusArb = fc.constantFrom<'PENDING' | 'SENT'>('PENDING', 'SENT');

/** Generates arbitrary non-empty details strings (printable ASCII, no leading/trailing whitespace) */
const detailsArb = fc.string({ minLength: 1, maxLength: 80 }).filter(s => s.trim() === s && s.length > 0);

/** Generates arbitrary non-empty name strings (no leading/trailing whitespace) */
const nameArb = fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim() === s && s.length > 0);

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildAlertPageResult(alerts: Alert[]): PageResult<Alert> {
  return {
    content: alerts,
    page: 0,
    size: alerts.length,
    totalElements: alerts.length,
    totalPages: 1,
  };
}

function buildAssetPageResult(assets: Asset[]): PageResult<Asset> {
  return {
    content: assets,
    page: 0,
    size: assets.length,
    totalElements: assets.length,
    totalPages: 1,
  };
}

/**
 * Creates a fresh AlertsPageComponent fixture with the given alerts pre-loaded.
 * A fresh TestBed is used per call to avoid OnPush change detection stale state.
 */
async function createAlertsFixture(alerts: Alert[]): Promise<ComponentFixture<AlertsPageComponent>> {
  const alerts$ = new BehaviorSubject<PageResult<Alert> | null>(buildAlertPageResult(alerts));

  const mockAlertsFacade = {
    loadAlerts: vi.fn(),
    alerts$,
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };

  const mockFilterStateService = {
    save: vi.fn(),
    load: vi.fn().mockReturnValue(null),
    clear: vi.fn(),
  };

  await TestBed.configureTestingModule({
    imports: [AlertsPageComponent],
    providers: [
      provideNoopAnimations(),
      { provide: AlertsFacade, useValue: mockAlertsFacade },
      { provide: FilterStateService, useValue: mockFilterStateService },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AlertsPageComponent);
  fixture.detectChanges();
  return fixture;
}

/**
 * Creates a fresh AssetsPageComponent fixture with the given assets pre-loaded.
 */
async function createAssetsFixture(assets: Asset[]): Promise<ComponentFixture<AssetsPageComponent>> {
  const assets$ = new BehaviorSubject<PageResult<Asset> | null>(buildAssetPageResult(assets));

  const mockAssetsFacade = {
    loadAssets: vi.fn(),
    loadAssetByTicker: vi.fn(),
    assets$,
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

  const fixture = TestBed.createComponent(AssetsPageComponent);
  fixture.detectChanges();
  return fixture;
}

/**
 * Creates a fresh AssetDetailPageComponent fixture with the given asset pre-loaded.
 */
async function createAssetDetailFixture(asset: Asset): Promise<ComponentFixture<AssetDetailPageComponent>> {
  const selectedAsset$ = new BehaviorSubject<Asset | null>(asset);

  const mockAssetsFacade = {
    loadAssets: vi.fn(),
    loadAssetByTicker: vi.fn(),
    assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
    selectedAsset$,
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };

  await TestBed.configureTestingModule({
    imports: [AssetDetailPageComponent],
    providers: [
      provideRouter([]),
      provideAnimationsAsync(),
      { provide: AssetsFacade, useValue: mockAssetsFacade },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { paramMap: { get: (_key: string) => asset.ticker } },
        },
      },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(AssetDetailPageComponent);
  fixture.detectChanges();
  return fixture;
}

// ─── Preservation 1: Null sentAt renders '-' in alerts page ─────────────────

describe('Preservation - Null sentAt renders \'-\' in alerts page', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('null sentAt always renders \'-\' regardless of other alert fields (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(
        tickerArb,
        statusArb,
        detailsArb,
        dateArb,
        async (ticker, status, details, createdAt) => {
          TestBed.resetTestingModule();

          const alert: Alert = { id: 1, ticker, status, details, createdAt, sentAt: null };
          const fixture = await createAlertsFixture([alert]);

          const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
          expect(rows.length).toBeGreaterThan(0);

          // sentAt is the 5th column (index 4): ticker, status, details, createdAt, sentAt
          const sentAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[4];
          expect(sentAtCell).toBeTruthy();
          expect(sentAtCell.textContent?.trim()).toBe('-');
        },
      ),
      { numRuns: 10 },
    );
  });

  it('null sentAt renders \'-\' for a concrete known alert', async () => {
    const alert: Alert = {
      id: 1,
      ticker: 'PETR4',
      status: 'PENDING',
      details: 'Test',
      createdAt: new Date('2026-01-01T00:00:00Z'),
      sentAt: null,
    };

    const fixture = await createAlertsFixture([alert]);
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    const sentAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[4];
    expect(sentAtCell.textContent?.trim()).toBe('-');
  });
});

// ─── Preservation 2: Non-date columns in alerts page render raw values ───────

describe('Preservation - Non-date columns in alerts page render raw values unchanged', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('ticker column renders the raw ticker string unchanged (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(tickerArb, dateArb, async (ticker, createdAt) => {
        TestBed.resetTestingModule();

        const alert: Alert = {
          id: 1,
          ticker,
          status: 'PENDING',
          details: 'Test details',
          createdAt,
          sentAt: null,
        };

        const fixture = await createAlertsFixture([alert]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // ticker is the 1st column (index 0)
        const tickerCell = rows[0].querySelectorAll('td.mat-mdc-cell')[0];
        expect(tickerCell.textContent?.trim()).toBe(ticker);
      }),
      { numRuns: 10 },
    );
  });

  it('details column renders the raw details string unchanged (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(detailsArb, dateArb, async (details, createdAt) => {
        TestBed.resetTestingModule();

        const alert: Alert = {
          id: 1,
          ticker: 'VALE3',
          status: 'SENT',
          details,
          createdAt,
          sentAt: null,
        };

        const fixture = await createAlertsFixture([alert]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // details is the 3rd column (index 2)
        const detailsCell = rows[0].querySelectorAll('td.mat-mdc-cell')[2];
        expect(detailsCell.textContent?.trim()).toBe(details);
      }),
      { numRuns: 10 },
    );
  });
});

// ─── Preservation 3: Non-date columns in assets page render raw values ───────

describe('Preservation - Non-date columns in assets page render raw values unchanged', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('ticker column renders the raw ticker string unchanged (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(tickerArb, dateArb, async (ticker, updatedAt) => {
        TestBed.resetTestingModule();

        const asset: Asset = {
          ticker,
          name: 'Test Asset',
          currentPrice: 10.0,
          dividendYield: 5.0,
          pVp: 1.0,
          updatedAt,
        };

        const fixture = await createAssetsFixture([asset]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // ticker is the 1st column (index 0)
        const tickerCell = rows[0].querySelectorAll('td.mat-mdc-cell')[0];
        expect(tickerCell.textContent?.trim()).toBe(ticker);
      }),
      { numRuns: 10 },
    );
  });

  it('name column renders the raw name string unchanged (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(nameArb, dateArb, async (name, updatedAt) => {
        TestBed.resetTestingModule();

        const asset: Asset = {
          ticker: 'TEST1',
          name,
          currentPrice: 10.0,
          dividendYield: 5.0,
          pVp: 1.0,
          updatedAt,
        };

        const fixture = await createAssetsFixture([asset]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // name is the 2nd column (index 1)
        const nameCell = rows[0].querySelectorAll('td.mat-mdc-cell')[1];
        expect(nameCell.textContent?.trim()).toBe(name);
      }),
      { numRuns: 10 },
    );
  });
});

// ─── Preservation 4: Non-date fields in asset detail page render raw values ──

describe('Preservation - Non-date fields in asset detail page render raw values unchanged', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('ticker and name in card header render unchanged (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(tickerArb, nameArb, dateArb, async (ticker, name, updatedAt) => {
        TestBed.resetTestingModule();

        const asset: Asset = {
          ticker,
          name,
          currentPrice: 10.0,
          dividendYield: 5.0,
          pVp: 1.0,
          updatedAt,
        };

        const fixture = await createAssetDetailFixture(asset);

        const cardTitle = fixture.nativeElement.querySelector('mat-card-title');
        const cardSubtitle = fixture.nativeElement.querySelector('mat-card-subtitle');

        expect(cardTitle?.textContent?.trim()).toBe(ticker);
        expect(cardSubtitle?.textContent?.trim()).toBe(name);
      }),
      { numRuns: 10 },
    );
  });
});

// ─── Preservation 5: Loading skeleton states display while fetching ──────────

describe('Preservation - Loading skeleton states display while data is being fetched', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('alerts page shows skeleton loader when isLoading is true', async () => {
    const mockAlertsFacade = {
      loadAlerts: vi.fn(),
      alerts$: new BehaviorSubject<PageResult<Alert> | null>(null),
      isLoading$: new BehaviorSubject<boolean>(true),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AlertsPageComponent],
      providers: [
        provideNoopAnimations(),
        { provide: AlertsFacade, useValue: mockAlertsFacade },
        { provide: FilterStateService, useValue: { save: vi.fn(), load: vi.fn().mockReturnValue(null), clear: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AlertsPageComponent);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();

    // Table should NOT be visible while loading
    const table = fixture.nativeElement.querySelector('app-reusable-table');
    expect(table).toBeFalsy();
  });

  it('assets page shows skeleton loader when isLoading is true', async () => {
    const mockAssetsFacade = {
      loadAssets: vi.fn(),
      loadAssetByTicker: vi.fn(),
      assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
      selectedAsset$: new BehaviorSubject<Asset | null>(null),
      isLoading$: new BehaviorSubject<boolean>(true),
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

    const fixture = TestBed.createComponent(AssetsPageComponent);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();

    const table = fixture.nativeElement.querySelector('app-reusable-table');
    expect(table).toBeFalsy();
  });

  it('asset detail page shows skeleton loader when isLoading is true', async () => {
    const mockAssetsFacade = {
      loadAssets: vi.fn(),
      loadAssetByTicker: vi.fn(),
      assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
      selectedAsset$: new BehaviorSubject<Asset | null>(null),
      isLoading$: new BehaviorSubject<boolean>(true),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AssetDetailPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: AssetsFacade, useValue: mockAssetsFacade },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: (_key: string) => 'PETR4' } } },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AssetDetailPageComponent);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('dashboard page shows skeleton loader when isLoading is true', async () => {
    const mockDashboardFacade = {
      loadDashboard: vi.fn(),
      isLoading$: new BehaviorSubject<boolean>(true),
      totalAssets$: new BehaviorSubject<number | null>(null),
      pendingAlerts$: new BehaviorSubject<number | null>(null),
      sentAlerts$: new BehaviorSubject<number | null>(null),
      recentAlerts$: new BehaviorSubject<Alert[]>([]),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideRouter([]),
        provideAnimationsAsync(),
        { provide: DashboardFacade, useValue: mockDashboardFacade },
        { provide: NotificationService, useValue: { showError: vi.fn(), showSuccess: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton-loader');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});

// ─── Preservation 6: DatePipe always produces a non-empty string for any valid Date ─
//
// On UNFIXED code these tests observe the CURRENT (wrong) format pattern.
// The key preservation property is: the output is ALWAYS a non-empty string
// (DatePipe never crashes or returns null for a valid Date).

describe('Preservation - DatePipe always produces a non-empty string for any valid Date', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('createdAt cell is always a non-empty string for any valid Date (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(dateArb, async (createdAt) => {
        TestBed.resetTestingModule();

        const alert: Alert = {
          id: 1,
          ticker: 'PETR4',
          status: 'PENDING',
          details: 'Test',
          createdAt,
          sentAt: null,
        };

        const fixture = await createAlertsFixture([alert]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // createdAt is the 4th column (index 3)
        const createdAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[3];
        const renderedText = createdAtCell.textContent?.trim() ?? '';
        expect(renderedText.length).toBeGreaterThan(0);
      }),
      { numRuns: 10 },
    );
  });

  it('non-null sentAt cell is always a non-empty string and not \'-\' for any valid Date (property-based)', async () => {
    await fc.assert(
      fc.asyncProperty(dateArb, dateArb, async (createdAt, sentAt) => {
        TestBed.resetTestingModule();

        const alert: Alert = {
          id: 1,
          ticker: 'VALE3',
          status: 'SENT',
          details: 'Test',
          createdAt,
          sentAt,
        };

        const fixture = await createAlertsFixture([alert]);
        const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
        expect(rows.length).toBeGreaterThan(0);

        // sentAt is the 5th column (index 4)
        const sentAtCell = rows[0].querySelectorAll('td.mat-mdc-cell')[4];
        const renderedText = sentAtCell.textContent?.trim() ?? '';
        // Must be non-empty and NOT '-' (since sentAt is non-null)
        expect(renderedText.length).toBeGreaterThan(0);
        expect(renderedText).not.toBe('-');
      }),
      { numRuns: 10 },
    );
  });
});

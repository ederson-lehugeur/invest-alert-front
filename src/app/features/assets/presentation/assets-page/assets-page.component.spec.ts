import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AssetsPageComponent } from './assets-page.component';
import { AssetsFacade } from '../../application/assets.facade';
import { Asset } from '../../domain/models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

describe('AssetsPageComponent', () => {
  let component: AssetsPageComponent;
  let fixture: ComponentFixture<AssetsPageComponent>;
  let mockFacade: {
    loadAssets: ReturnType<typeof vi.fn>;
    loadAssetByTicker: ReturnType<typeof vi.fn>;
    assets$: BehaviorSubject<PageResult<Asset> | null>;
    selectedAsset$: BehaviorSubject<Asset | null>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };
  let router: Router;

  const mockAsset: Asset = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: new Date('2025-06-01T12:00:00.000Z'),
  };

  const mockPageResult: PageResult<Asset> = {
    content: [mockAsset],
    page: 0,
    size: 20,
    totalElements: 1,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockFacade = {
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
        { provide: AssetsFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(AssetsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call loadAssets on init with default params', () => {
    expect(mockFacade.loadAssets).toHaveBeenCalledWith(0, 20);
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

  it('should render assets table when data is available', () => {
    mockFacade.assets$.next(mockPageResult);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.assets-table__row');
    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll('td');
    expect(cells[0].textContent).toContain('PETR4');
    expect(cells[1].textContent).toContain('Petrobras PN');
  });

  it('should display empty message when no assets', () => {
    mockFacade.assets$.next({
      content: [],
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    });
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.assets-page__empty');
    expect(empty).toBeTruthy();
    expect(empty.textContent).toContain('No assets found');
  });

  it('should navigate to asset detail on row click', () => {
    mockFacade.assets$.next(mockPageResult);
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('.assets-table__row');
    row.click();

    expect(router.navigate).toHaveBeenCalledWith(['/assets', 'PETR4']);
  });

  it('should render pagination when multiple pages exist', () => {
    mockFacade.assets$.next({
      ...mockPageResult,
      totalPages: 3,
    });
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('app-pagination');
    expect(pagination).toBeTruthy();
  });

  it('should not render pagination controls when single page', () => {
    mockFacade.assets$.next(mockPageResult);
    fixture.detectChanges();

    const paginationNav = fixture.nativeElement.querySelector('.pagination');
    expect(paginationNav).toBeFalsy();
  });

  it('should call loadAssets with new page on page change', () => {
    mockFacade.loadAssets.mockClear();
    component['onPageChange'](2);
    expect(mockFacade.loadAssets).toHaveBeenCalledWith(2, 20);
  });
});

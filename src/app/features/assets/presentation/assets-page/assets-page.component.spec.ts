import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
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
    assetType: 'STOCK',
    indicators: [{ code: 'PRICE', value: 35.5 }, { code: 'DIVIDEND_YIELD', value: 8.2 }],
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
        provideAnimationsAsync(),
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

  it('should display skeleton loader when loading', () => {
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should not display skeleton loader when not loading', () => {
    mockFacade.isLoading$.next(false);
    fixture.detectChanges();

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
    mockFacade.assets$.next(mockPageResult);
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('app-reusable-table');
    expect(table).toBeTruthy();
  });

  it('should display empty state when no assets', () => {
    mockFacade.assets$.next({
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

  it('should navigate to asset detail on row click', () => {
    mockFacade.assets$.next(mockPageResult);
    fixture.detectChanges();

    component['onRowClick'](mockAsset);

    expect(router.navigate).toHaveBeenCalledWith(['/assets', 'PETR4']);
  });

  it('should call loadAssets with new page on page change', () => {
    mockFacade.loadAssets.mockClear();
    component['onPageChange']({ pageIndex: 2, pageSize: 20, length: 100 });
    expect(mockFacade.loadAssets).toHaveBeenCalledWith(2, 20);
  });

  it('should sort data ascending by string column', () => {
    const asset1: Asset = { ...mockAsset, ticker: 'C', name: 'Charlie' };
    const asset2: Asset = { ...mockAsset, ticker: 'A', name: 'Alpha' };
    const asset3: Asset = { ...mockAsset, ticker: 'B', name: 'Bravo' };

    mockFacade.assets$.next({
      content: [asset1, asset2, asset3],
      page: 0,
      size: 20,
      totalElements: 3,
      totalPages: 1,
    });
    fixture.detectChanges();

    component['onSortChange']({ active: 'ticker', direction: 'asc' });

    expect(component['sortedData'].map((a) => a.ticker)).toEqual(['A', 'B', 'C']);
  });

  it('should sort data descending by string column', () => {
    const asset1: Asset = { ...mockAsset, ticker: 'C', name: 'Charlie' };
    const asset2: Asset = { ...mockAsset, ticker: 'A', name: 'Alpha' };
    const asset3: Asset = { ...mockAsset, ticker: 'B', name: 'Bravo' };

    mockFacade.assets$.next({
      content: [asset1, asset2, asset3],
      page: 0,
      size: 20,
      totalElements: 3,
      totalPages: 1,
    });
    fixture.detectChanges();

    component['onSortChange']({ active: 'ticker', direction: 'desc' });

    expect(component['sortedData'].map((a) => a.ticker)).toEqual(['C', 'B', 'A']);
  });

  it('should reset sort when direction is empty', () => {
    const asset1: Asset = { ...mockAsset, ticker: 'C' };
    const asset2: Asset = { ...mockAsset, ticker: 'A' };

    mockFacade.assets$.next({
      content: [asset1, asset2],
      page: 0,
      size: 20,
      totalElements: 2,
      totalPages: 1,
    });
    fixture.detectChanges();

    // Sort first
    component['onSortChange']({ active: 'ticker', direction: 'asc' });
    expect(component['sortedData'][0].ticker).toBe('A');

    // Reset sort
    component['onSortChange']({ active: 'ticker', direction: '' });
    expect(component['sortedData'][0].ticker).toBe('C');
  });
});

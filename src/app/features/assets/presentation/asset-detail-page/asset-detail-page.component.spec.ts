import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { AssetDetailPageComponent } from './asset-detail-page.component';
import { AssetsFacade } from '../../application/assets.facade';
import { Asset } from '../../domain/models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

describe('AssetDetailPageComponent', () => {
  let component: AssetDetailPageComponent;
  let fixture: ComponentFixture<AssetDetailPageComponent>;
  let mockFacade: {
    loadAssetByTicker: ReturnType<typeof vi.fn>;
    loadAssets: ReturnType<typeof vi.fn>;
    assets$: BehaviorSubject<PageResult<Asset> | null>;
    selectedAsset$: BehaviorSubject<Asset | null>;
    isLoading$: BehaviorSubject<boolean>;
    error$: BehaviorSubject<string | null>;
  };

  const mockAsset: Asset = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: new Date('2025-06-01T12:00:00.000Z'),
  };

  function createComponent(ticker: string = 'PETR4'): void {
    TestBed.overrideProvider(ActivatedRoute, {
      useValue: {
        snapshot: {
          paramMap: {
            get: (key: string) => (key === 'ticker' ? ticker : null),
          },
        },
      },
    });

    fixture = TestBed.createComponent(AssetDetailPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    mockFacade = {
      loadAssetByTicker: vi.fn(),
      loadAssets: vi.fn(),
      assets$: new BehaviorSubject<PageResult<Asset> | null>(null),
      selectedAsset$: new BehaviorSubject<Asset | null>(null),
      isLoading$: new BehaviorSubject<boolean>(false),
      error$: new BehaviorSubject<string | null>(null),
    };

    await TestBed.configureTestingModule({
      imports: [AssetDetailPageComponent],
      providers: [
        provideRouter([]),
        { provide: AssetsFacade, useValue: mockFacade },
      ],
    }).compileComponents();
  });

  it('should call loadAssetByTicker on init with route param', () => {
    createComponent('PETR4');
    expect(mockFacade.loadAssetByTicker).toHaveBeenCalledWith('PETR4');
  });

  it('should display loading indicator when loading', () => {
    createComponent();
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should display asset details when loaded', () => {
    createComponent();
    mockFacade.selectedAsset$.next(mockAsset);
    fixture.detectChanges();

    const title = fixture.nativeElement.querySelector('.asset-card__title');
    expect(title.textContent).toContain('PETR4');

    const name = fixture.nativeElement.querySelector('.asset-card__name');
    expect(name.textContent).toContain('Petrobras PN');

    const details = fixture.nativeElement.querySelectorAll('.detail-row dd');
    expect(details.length).toBe(4);
  });

  it('should display error message on error', () => {
    createComponent();
    mockFacade.error$.next('The requested resource was not found.');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should display not found message when no asset and error present', () => {
    createComponent();
    mockFacade.error$.next('The requested resource was not found.');
    mockFacade.isLoading$.next(false);
    mockFacade.selectedAsset$.next(null);
    fixture.detectChanges();

    const notFound = fixture.nativeElement.querySelector('.asset-detail__not-found');
    expect(notFound).toBeTruthy();
    expect(notFound.textContent).toContain('Asset not found');
  });

  it('should have a back link to assets page', () => {
    createComponent();
    const backLink = fixture.nativeElement.querySelector('.asset-detail__back');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute('href')).toBe('/assets');
  });
});

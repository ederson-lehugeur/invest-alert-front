import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
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
        provideNoopAnimations(),
        { provide: AssetsFacade, useValue: mockFacade },
      ],
    }).compileComponents();
  });

  it('should call loadAssetByTicker on init with route param', () => {
    createComponent('PETR4');
    expect(mockFacade.loadAssetByTicker).toHaveBeenCalledWith('PETR4');
  });

  it('should display skeleton loader when loading', () => {
    createComponent();
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const skeleton = fixture.nativeElement.querySelector('app-skeleton-loader');
    expect(skeleton).toBeTruthy();
  });

  it('should display asset details in a mat-card when loaded', () => {
    createComponent();
    mockFacade.selectedAsset$.next(mockAsset);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('mat-card');
    expect(card).toBeTruthy();

    const title = fixture.nativeElement.querySelector('mat-card-title');
    expect(title.textContent).toContain('PETR4');

    const subtitle = fixture.nativeElement.querySelector('mat-card-subtitle');
    expect(subtitle.textContent).toContain('Petrobras PN');

    const details = fixture.nativeElement.querySelectorAll('.detail-row dd');
    expect(details.length).toBe(4);
  });

  it('should apply positive class for positive dividend yield', () => {
    createComponent();
    mockFacade.selectedAsset$.next(mockAsset);
    fixture.detectChanges();

    const dividendDd = fixture.nativeElement.querySelectorAll('.detail-row dd')[1];
    expect(dividendDd.classList.contains('positive')).toBe(true);
  });

  it('should apply negative class for negative dividend yield', () => {
    createComponent();
    mockFacade.selectedAsset$.next({ ...mockAsset, dividendYield: -2.5 });
    fixture.detectChanges();

    const dividendDd = fixture.nativeElement.querySelectorAll('.detail-row dd')[1];
    expect(dividendDd.classList.contains('negative')).toBe(true);
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

  it('should have a back button with mat-icon linking to assets page', () => {
    createComponent();
    const backButton = fixture.nativeElement.querySelector('.asset-detail__back');
    expect(backButton).toBeTruthy();
    expect(backButton.tagName.toLowerCase()).toBe('button');

    const icon = backButton.querySelector('mat-icon');
    expect(icon).toBeTruthy();
    expect(icon.textContent.trim()).toBe('arrow_back');
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AssetsFacade } from './assets.facade';
import { AssetsApiService } from '../infrastructure/assets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Asset } from '../domain/models/asset.model';
import { PageResult } from '../../../shared/models/page-result.model';

describe('AssetsFacade', () => {
  let facade: AssetsFacade;
  let assetsApi: { list: ReturnType<typeof vi.fn>; getByTicker: ReturnType<typeof vi.fn> };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

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

  beforeEach(() => {
    assetsApi = {
      list: vi.fn(),
      getByTicker: vi.fn(),
    };

    errorHandler = {
      extractMessage: vi.fn().mockReturnValue('Something went wrong'),
    };

    TestBed.configureTestingModule({
      providers: [
        AssetsFacade,
        { provide: AssetsApiService, useValue: assetsApi },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    facade = TestBed.inject(AssetsFacade);
  });

  describe('loadAssets', () => {
    it('should load assets and update state on success', () => {
      assetsApi.list.mockReturnValue(of(mockPageResult));

      let assets: PageResult<Asset> | null = null;
      facade.assets$.subscribe((v) => (assets = v));

      facade.loadAssets(0, 20);

      expect(assetsApi.list).toHaveBeenCalledWith(0, 20);
      expect(assets).toEqual(mockPageResult);
    });

    it('should set isLoading to false after successful load', () => {
      assetsApi.list.mockReturnValue(of(mockPageResult));

      let isLoading = true;
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadAssets(0, 20);

      expect(isLoading).toBe(false);
    });

    it('should set error and reset loading on failure', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: null });
      assetsApi.list.mockReturnValue(throwError(() => httpError));
      errorHandler.extractMessage.mockReturnValue('Server is unavailable. Please try again later.');

      let error: string | null = null;
      let isLoading = true;
      facade.error$.subscribe((v) => (error = v));
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadAssets(0, 20);

      expect(isLoading).toBe(false);
      expect(error).toBe('Server is unavailable. Please try again later.');
      expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
    });

    it('should clear previous error when loading starts', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: null });
      assetsApi.list.mockReturnValue(throwError(() => httpError));
      facade.loadAssets(0, 20);

      assetsApi.list.mockReturnValue(of(mockPageResult));

      let error: string | null = 'old error';
      facade.error$.subscribe((v) => (error = v));

      facade.loadAssets(0, 20);

      expect(error).toBeNull();
    });
  });

  describe('loadAssetByTicker', () => {
    it('should load asset by ticker and update selectedAsset on success', () => {
      assetsApi.getByTicker.mockReturnValue(of(mockAsset));

      let selectedAsset: Asset | null = null;
      facade.selectedAsset$.subscribe((v) => (selectedAsset = v));

      facade.loadAssetByTicker('PETR4');

      expect(assetsApi.getByTicker).toHaveBeenCalledWith('PETR4');
      expect(selectedAsset).toEqual(mockAsset);
    });

    it('should set isLoading to false after successful load', () => {
      assetsApi.getByTicker.mockReturnValue(of(mockAsset));

      let isLoading = true;
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadAssetByTicker('PETR4');

      expect(isLoading).toBe(false);
    });

    it('should set error on 404 failure', () => {
      const httpError = new HttpErrorResponse({ status: 404, error: null });
      assetsApi.getByTicker.mockReturnValue(throwError(() => httpError));
      errorHandler.extractMessage.mockReturnValue('The requested resource was not found.');

      let error: string | null = null;
      facade.error$.subscribe((v) => (error = v));

      facade.loadAssetByTicker('INVALID');

      expect(error).toBe('The requested resource was not found.');
      expect(errorHandler.extractMessage).toHaveBeenCalledWith(httpError);
    });

    it('should clear selectedAsset when loading starts', () => {
      assetsApi.getByTicker.mockReturnValue(of(mockAsset));
      facade.loadAssetByTicker('PETR4');

      assetsApi.getByTicker.mockReturnValue(of(mockAsset));

      let selectedAsset: Asset | null = mockAsset;
      facade.selectedAsset$.subscribe((v) => (selectedAsset = v));

      facade.loadAssetByTicker('VALE3');

      expect(selectedAsset).toEqual(mockAsset);
    });
  });
});

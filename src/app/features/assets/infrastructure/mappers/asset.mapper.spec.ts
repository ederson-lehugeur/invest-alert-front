import {
  AssetApiResponse,
  mapAssetResponse,
  mapAssetToApiFormat,
  mapPageResult,
} from './asset.mapper';
import { Asset } from '../../domain/models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

describe('asset.mapper', () => {
  const apiResponse: AssetApiResponse = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: '2025-06-01T12:00:00.000Z',
  };

  describe('mapAssetResponse', () => {
    it('should convert API response to Asset domain model', () => {
      const asset = mapAssetResponse(apiResponse);

      expect(asset.ticker).toBe('PETR4');
      expect(asset.name).toBe('Petrobras PN');
      expect(asset.currentPrice).toBe(35.5);
      expect(asset.dividendYield).toBe(8.2);
      expect(asset.pVp).toBe(1.15);
      expect(asset.updatedAt).toBeInstanceOf(Date);
      expect(asset.updatedAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
    });
  });

  describe('mapAssetToApiFormat', () => {
    it('should convert Asset domain model to API format with ISO string', () => {
      const asset: Asset = {
        ticker: 'VALE3',
        name: 'Vale ON',
        currentPrice: 62.3,
        dividendYield: 6.5,
        pVp: 0.95,
        updatedAt: new Date('2025-07-15T08:30:00.000Z'),
      };

      const result = mapAssetToApiFormat(asset);

      expect(result.ticker).toBe('VALE3');
      expect(result.name).toBe('Vale ON');
      expect(result.currentPrice).toBe(62.3);
      expect(result.dividendYield).toBe(6.5);
      expect(result.pVp).toBe(0.95);
      expect(typeof result.updatedAt).toBe('string');
      expect(result.updatedAt).toBe('2025-07-15T08:30:00.000Z');
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapAssetResponse then mapAssetToApiFormat', () => {
      const roundTripped = mapAssetToApiFormat(mapAssetResponse(apiResponse));
      expect(roundTripped).toEqual(apiResponse);
    });
  });

  describe('mapPageResult', () => {
    it('should map a PageResult of API responses to a PageResult of domain models', () => {
      const apiPage: PageResult<AssetApiResponse> = {
        content: [apiResponse],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };

      const result = mapPageResult(apiPage, mapAssetResponse);

      expect(result.page).toBe(0);
      expect(result.size).toBe(20);
      expect(result.totalElements).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].ticker).toBe('PETR4');
      expect(result.content[0].updatedAt).toBeInstanceOf(Date);
    });

    it('should handle empty content', () => {
      const emptyPage: PageResult<AssetApiResponse> = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
      };

      const result = mapPageResult(emptyPage, mapAssetResponse);

      expect(result.content).toHaveLength(0);
      expect(result.totalElements).toBe(0);
    });

    it('should map multiple items', () => {
      const secondResponse: AssetApiResponse = {
        ticker: 'VALE3',
        name: 'Vale ON',
        currentPrice: 62.3,
        dividendYield: 6.5,
        pVp: 0.95,
        updatedAt: '2025-07-15T08:30:00.000Z',
      };

      const multiPage: PageResult<AssetApiResponse> = {
        content: [apiResponse, secondResponse],
        page: 0,
        size: 20,
        totalElements: 2,
        totalPages: 1,
      };

      const result = mapPageResult(multiPage, mapAssetResponse);

      expect(result.content).toHaveLength(2);
      expect(result.content[0].ticker).toBe('PETR4');
      expect(result.content[1].ticker).toBe('VALE3');
    });
  });
});

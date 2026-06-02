import * as fc from 'fast-check';
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
    assetType: 'STOCK',
    indicators: [
      { code: 'PRICE', value: 35.5 },
      { code: 'DIVIDEND_YIELD', value: 8.2 },
    ],
    updatedAt: '2025-06-01T12:00:00.000Z',
  };

  describe('mapAssetResponse', () => {
    it('should convert API response to Asset domain model', () => {
      const asset = mapAssetResponse(apiResponse);

      expect(asset.ticker).toBe('PETR4');
      expect(asset.name).toBe('Petrobras PN');
      expect(asset.assetType).toBe('STOCK');
      expect(asset.indicators).toEqual([
        { code: 'PRICE', value: 35.5 },
        { code: 'DIVIDEND_YIELD', value: 8.2 },
      ]);
      expect(asset.updatedAt).toBeInstanceOf(Date);
      expect(asset.updatedAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
    });
  });

  describe('mapAssetToApiFormat', () => {
    it('should convert Asset domain model to API format with ISO string', () => {
      const asset: Asset = {
        ticker: 'VALE3',
        name: 'Vale ON',
        assetType: 'FII',
        indicators: [{ code: 'PVP', value: 0.95 }],
        updatedAt: new Date('2025-07-15T08:30:00.000Z'),
      };

      const result = mapAssetToApiFormat(asset);

      expect(result.ticker).toBe('VALE3');
      expect(result.name).toBe('Vale ON');
      expect(result.assetType).toBe('FII');
      expect(result.indicators).toEqual([{ code: 'PVP', value: 0.95 }]);
      expect(typeof result.updatedAt).toBe('string');
      expect(result.updatedAt).toBe('2025-07-15T08:30:00.000Z');
    });
  });

  describe('Property 1: Asset Mapper Round-Trip', () => {
    /**
     * Validates: Requirements 2.1, 2.2, 2.3, 2.4
     *
     * For any valid AssetApiResponse, applying mapAssetResponse followed by
     * mapAssetToApiFormat SHALL produce an object deeply equal to the original response.
     */
    const assetTypeArb = fc.constantFrom('FII' as const, 'STOCK' as const, 'CRYPTOCURRENCY' as const);

    const indicatorArb = fc.record({
      code: fc.stringMatching(/^[A-Z_]{1,20}$/),
      value: fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }),
    });

    const assetApiResponseArb: fc.Arbitrary<AssetApiResponse> = fc.record({
      ticker: fc.string({ minLength: 1, maxLength: 10 }),
      name: fc.string({ minLength: 1, maxLength: 50 }),
      assetType: assetTypeArb,
      indicators: fc.array(indicatorArb, { minLength: 0, maxLength: 10 }),
      updatedAt: fc.date({ min: new Date('2020-01-01T00:00:00.000Z'), max: new Date('2030-01-01T00:00:00.000Z') })
        .filter(d => !isNaN(d.getTime()))
        .map(d => d.toISOString()),
    });

    it('should produce equivalent object after round-trip mapAssetResponse -> mapAssetToApiFormat', () => {
      fc.assert(
        fc.property(assetApiResponseArb, (response) => {
          const roundTripped = mapAssetToApiFormat(mapAssetResponse(response));
          expect(roundTripped).toEqual(response);
        }),
        { numRuns: 100 },
      );
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
      expect(result.content[0].assetType).toBe('STOCK');
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
        assetType: 'CRYPTOCURRENCY',
        indicators: [{ code: 'PRICE', value: 62.3 }],
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

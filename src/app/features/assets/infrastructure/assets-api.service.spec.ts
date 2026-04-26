import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { AssetsApiService } from './assets-api.service';
import { AssetApiResponse } from './mappers/asset.mapper';
import { PageResult } from '../../../shared/models/page-result.model';

describe('AssetsApiService', () => {
  let service: AssetsApiService;
  let httpTesting: HttpTestingController;

  const assetApiResponse: AssetApiResponse = {
    ticker: 'PETR4',
    name: 'Petrobras PN',
    currentPrice: 35.5,
    dividendYield: 8.2,
    pVp: 1.15,
    updatedAt: '2025-06-01T12:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AssetsApiService,
      ],
    });

    service = TestBed.inject(AssetsApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('list', () => {
    it('should GET /api/assets with pagination params and map response', () => {
      const apiPage: PageResult<AssetApiResponse> = {
        content: [assetApiResponse],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
      };

      service.list(0, 20).subscribe((result) => {
        expect(result.page).toBe(0);
        expect(result.size).toBe(20);
        expect(result.totalElements).toBe(1);
        expect(result.totalPages).toBe(1);
        expect(result.content).toHaveLength(1);
        expect(result.content[0].ticker).toBe('PETR4');
        expect(result.content[0].updatedAt).toBeInstanceOf(Date);
      });

      const req = httpTesting.expectOne('/api/assets?page=0&size=20');
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });

    it('should pass correct page and size params', () => {
      const apiPage: PageResult<AssetApiResponse> = {
        content: [],
        page: 2,
        size: 10,
        totalElements: 25,
        totalPages: 3,
      };

      service.list(2, 10).subscribe((result) => {
        expect(result.page).toBe(2);
        expect(result.size).toBe(10);
      });

      const req = httpTesting.expectOne('/api/assets?page=2&size=10');
      expect(req.request.method).toBe('GET');
      req.flush(apiPage);
    });
  });

  describe('getByTicker', () => {
    it('should GET /api/assets/:ticker and map response to Asset domain model', () => {
      service.getByTicker('PETR4').subscribe((asset) => {
        expect(asset.ticker).toBe('PETR4');
        expect(asset.name).toBe('Petrobras PN');
        expect(asset.currentPrice).toBe(35.5);
        expect(asset.dividendYield).toBe(8.2);
        expect(asset.pVp).toBe(1.15);
        expect(asset.updatedAt).toBeInstanceOf(Date);
        expect(asset.updatedAt.toISOString()).toBe('2025-06-01T12:00:00.000Z');
      });

      const req = httpTesting.expectOne('/api/assets/PETR4');
      expect(req.request.method).toBe('GET');
      req.flush(assetApiResponse);
    });
  });
});

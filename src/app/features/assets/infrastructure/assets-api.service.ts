import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AssetRepository } from '../domain/interfaces/asset.repository';
import { Asset } from '../domain/models/asset.model';
import { PageResult } from '../../../shared/models/page-result.model';
import { AssetApiResponse, mapAssetResponse, mapPageResult } from './mappers/asset.mapper';

@Injectable({ providedIn: 'root' })
export class AssetsApiService implements AssetRepository {
  private readonly http = inject(HttpClient);

  list(page: number, size: number): Observable<PageResult<Asset>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http
      .get<PageResult<AssetApiResponse>>('/api/v1/assets', { params })
      .pipe(map((response) => mapPageResult(response, mapAssetResponse)));
  }

  getByTicker(ticker: string): Observable<Asset> {
    return this.http
      .get<AssetApiResponse>(`/api/v1/assets/${ticker}`)
      .pipe(map(mapAssetResponse));
  }
}

import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

export interface AssetRepository {
  list(page: number, size: number): Observable<PageResult<Asset>>;
  getByTicker(ticker: string): Observable<Asset>;
}

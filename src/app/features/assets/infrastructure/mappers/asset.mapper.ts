import { Asset } from '../../domain/models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

export interface AssetApiResponse {
  readonly ticker: string;
  readonly name: string;
  readonly currentPrice: number;
  readonly dividendYield: number;
  readonly pVp: number;
  readonly updatedAt: string;
}

export function mapAssetResponse(response: AssetApiResponse): Asset {
  return {
    ticker: response.ticker,
    name: response.name,
    currentPrice: response.currentPrice,
    dividendYield: response.dividendYield,
    pVp: response.pVp,
    updatedAt: new Date(response.updatedAt),
  };
}

export function mapAssetToApiFormat(asset: Asset): AssetApiResponse {
  return {
    ticker: asset.ticker,
    name: asset.name,
    currentPrice: asset.currentPrice,
    dividendYield: asset.dividendYield,
    pVp: asset.pVp,
    updatedAt: asset.updatedAt.toISOString(),
  };
}

export function mapPageResult<TApi, TDomain>(
  response: PageResult<TApi>,
  mapper: (item: TApi) => TDomain,
): PageResult<TDomain> {
  return {
    content: response.content.map(mapper),
    page: response.page,
    size: response.size,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
  };
}

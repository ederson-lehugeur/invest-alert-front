import { Asset, AssetType, IndicatorValue } from '../../domain/models/asset.model';
import { PageResult } from '../../../../shared/models/page-result.model';

export interface IndicatorValueApiResponse {
  readonly code: string;
  readonly value: number;
}

export interface AssetApiResponse {
  readonly ticker: string;
  readonly name: string;
  readonly assetType: string;
  readonly indicators: readonly IndicatorValueApiResponse[];
  readonly updatedAt: string;
}

export function mapAssetResponse(response: AssetApiResponse): Asset {
  return {
    ticker: response.ticker,
    name: response.name,
    assetType: response.assetType as AssetType,
    indicators: response.indicators.map(ind => ({
      code: ind.code,
      value: ind.value,
    })),
    updatedAt: new Date(response.updatedAt),
  };
}

export function mapAssetToApiFormat(asset: Asset): AssetApiResponse {
  return {
    ticker: asset.ticker,
    name: asset.name,
    assetType: asset.assetType,
    indicators: asset.indicators.map(ind => ({
      code: ind.code,
      value: ind.value,
    })),
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

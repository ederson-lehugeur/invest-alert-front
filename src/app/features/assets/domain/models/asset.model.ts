export type AssetType = 'FII' | 'STOCK' | 'CRYPTOCURRENCY';

export interface IndicatorValue {
  readonly code: string;
  readonly value: number;
}

export interface Asset {
  readonly ticker: string;
  readonly name: string;
  readonly assetType: AssetType;
  readonly indicators: readonly IndicatorValue[];
  readonly updatedAt: Date;
}

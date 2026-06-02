import { Asset, AssetType, IndicatorValue } from '../../domain/models/asset.model';
import { ColumnConfig } from '../../../../shared/components/reusable-table/column-config.model';
import { Sort } from '@angular/material/sort';
import { formatIndicatorCode } from '../../../../shared/utils/indicator-format.util';

export { formatIndicatorCode } from '../../../../shared/utils/indicator-format.util';

/** Partition result keyed by AssetType */
export interface AssetPartition {
  readonly FII: readonly Asset[];
  readonly STOCK: readonly Asset[];
  readonly CRYPTOCURRENCY: readonly Asset[];
}

/** Tab metadata */
export interface TabDefinition {
  readonly label: string;
  readonly type: AssetType;
}

export const TABS: readonly TabDefinition[] = [
  { label: 'FII', type: 'FII' },
  { label: 'Stocks', type: 'STOCK' },
  { label: 'Cryptocurrency', type: 'CRYPTOCURRENCY' },
] as const;

export const FIXED_COLUMNS: readonly ColumnConfig[] = [
  { key: 'ticker', header: 'Ticker', sortable: true },
  { key: 'name', header: 'Name', sortable: true },
  { key: 'updatedAt', header: 'Updated At', sortable: true },
];

/**
 * Partitions an array of assets into groups by AssetType.
 * Every asset appears in exactly one group.
 */
export function partitionByType(assets: readonly Asset[]): AssetPartition {
  const partition: { FII: Asset[]; STOCK: Asset[]; CRYPTOCURRENCY: Asset[] } = {
    FII: [],
    STOCK: [],
    CRYPTOCURRENCY: [],
  };

  for (const asset of assets) {
    partition[asset.assetType].push(asset);
  }

  return partition;
}

/**
 * Builds the full ColumnConfig[] for a given set of assets.
 * Always includes fixed columns (ticker, name, updatedAt) followed by
 * one column per distinct indicator code found in the assets.
 * All columns are sortable.
 */
export function buildColumnsForTab(assets: readonly Asset[]): ColumnConfig[] {
  const distinctCodes = new Set<string>();

  for (const asset of assets) {
    for (const indicator of asset.indicators) {
      distinctCodes.add(indicator.code);
    }
  }

  const indicatorColumns: ColumnConfig[] = Array.from(distinctCodes).map(code => ({
    key: code,
    header: formatIndicatorCode(code),
    sortable: true,
    align: 'right' as const,
  }));

  return [...FIXED_COLUMNS, ...indicatorColumns];
}

/**
 * Retrieves the numeric value for a given indicator code from an asset,
 * or undefined if the asset does not have that indicator.
 */
export function getIndicatorValue(asset: Asset, code: string): number | undefined {
  const indicator = asset.indicators.find(ind => ind.code === code);
  return indicator?.value;
}

/**
 * Sorts assets by the given Sort criteria.
 * For indicator columns, missing values are treated as -Infinity (lowest).
 * Returns a new sorted array without mutating the input.
 */
export function sortAssets(
  assets: readonly Asset[],
  sort: Sort,
  indicatorCodes: readonly string[],
): Asset[] {
  if (sort.direction === '') {
    return [...assets];
  }

  const directionMultiplier = sort.direction === 'asc' ? 1 : -1;
  const isIndicatorColumn = indicatorCodes.includes(sort.active);

  return [...assets].sort((a, b) => {
    let comparison: number;

    if (isIndicatorColumn) {
      const valueA = getIndicatorValue(a, sort.active) ?? -Infinity;
      const valueB = getIndicatorValue(b, sort.active) ?? -Infinity;
      comparison = valueA - valueB;
    } else {
      switch (sort.active) {
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          comparison = 0;
      }
    }

    return comparison * directionMultiplier;
  });
}

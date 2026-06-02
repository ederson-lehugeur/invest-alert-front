import { describe, it, expect } from 'vitest';
import {
  formatIndicatorCode,
  buildColumnsForTab,
  getIndicatorValue,
  partitionByType,
  sortAssets,
  FIXED_COLUMNS,
} from './asset-tab.utils';
import { Asset } from '../../domain/models/asset.model';
import { Sort } from '@angular/material/sort';

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    ticker: 'TEST',
    name: 'Test Asset',
    assetType: 'FII',
    indicators: [],
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

describe('formatIndicatorCode', () => {
  it('converts "DIVIDEND_YIELD" to "Dividend Yield"', () => {
    expect(formatIndicatorCode('DIVIDEND_YIELD')).toBe('Dividend Yield');
  });

  it('converts "PRICE" to "Price"', () => {
    expect(formatIndicatorCode('PRICE')).toBe('Price');
  });

  it('converts "PVP" to "P/VP"', () => {
    expect(formatIndicatorCode('PVP')).toBe('P/VP');
  });
});

describe('buildColumnsForTab', () => {
  it('returns only 3 fixed columns when given an empty array', () => {
    const columns = buildColumnsForTab([]);

    expect(columns).toHaveLength(3);
    expect(columns[0].key).toBe('ticker');
    expect(columns[1].key).toBe('name');
    expect(columns[2].key).toBe('updatedAt');
  });

  it('returns fixed columns plus indicator columns for assets with indicators', () => {
    const assets: Asset[] = [
      makeAsset({
        indicators: [
          { code: 'DIVIDEND_YIELD', value: 5.2 },
          { code: 'PVP', value: 0.8 },
        ],
      }),
      makeAsset({
        ticker: 'OTHER',
        indicators: [{ code: 'PRICE', value: 100 }],
      }),
    ];

    const columns = buildColumnsForTab(assets);

    expect(columns.length).toBe(3 + 3); // 3 fixed + 3 indicator
    expect(columns[3].key).toBe('DIVIDEND_YIELD');
    expect(columns[3].header).toBe('Dividend Yield');
    expect(columns[4].key).toBe('PVP');
    expect(columns[5].key).toBe('PRICE');
  });

  it('sets align: "right" and sortable: true on indicator columns', () => {
    const assets: Asset[] = [
      makeAsset({ indicators: [{ code: 'PRICE', value: 10 }] }),
    ];

    const columns = buildColumnsForTab(assets);
    const indicatorCol = columns[3];

    expect(indicatorCol.align).toBe('right');
    expect(indicatorCol.sortable).toBe(true);
  });

  it('does not produce duplicate indicator columns when multiple assets share the same code', () => {
    const assets: Asset[] = [
      makeAsset({ ticker: 'A', indicators: [{ code: 'PRICE', value: 10 }] }),
      makeAsset({ ticker: 'B', indicators: [{ code: 'PRICE', value: 20 }] }),
      makeAsset({ ticker: 'C', indicators: [{ code: 'PRICE', value: 30 }] }),
    ];

    const columns = buildColumnsForTab(assets);
    const priceColumns = columns.filter(col => col.key === 'PRICE');

    expect(priceColumns).toHaveLength(1);
  });
});

describe('getIndicatorValue', () => {
  it('returns value when indicator code exists in asset', () => {
    const asset = makeAsset({
      indicators: [
        { code: 'DIVIDEND_YIELD', value: 7.5 },
        { code: 'PRICE', value: 25.0 },
      ],
    });

    expect(getIndicatorValue(asset, 'DIVIDEND_YIELD')).toBe(7.5);
    expect(getIndicatorValue(asset, 'PRICE')).toBe(25.0);
  });

  it('returns undefined when indicator code does not exist in asset', () => {
    const asset = makeAsset({
      indicators: [{ code: 'PRICE', value: 25.0 }],
    });

    expect(getIndicatorValue(asset, 'NONEXISTENT')).toBeUndefined();
  });
});

describe('partitionByType', () => {
  it('correctly groups assets by type', () => {
    const assets: Asset[] = [
      makeAsset({ ticker: 'FII1', assetType: 'FII' }),
      makeAsset({ ticker: 'STK1', assetType: 'STOCK' }),
      makeAsset({ ticker: 'CRY1', assetType: 'CRYPTOCURRENCY' }),
      makeAsset({ ticker: 'FII2', assetType: 'FII' }),
      makeAsset({ ticker: 'STK2', assetType: 'STOCK' }),
    ];

    const partition = partitionByType(assets);

    expect(partition.FII).toHaveLength(2);
    expect(partition.STOCK).toHaveLength(2);
    expect(partition.CRYPTOCURRENCY).toHaveLength(1);
    expect(partition.FII[0].ticker).toBe('FII1');
    expect(partition.FII[1].ticker).toBe('FII2');
    expect(partition.CRYPTOCURRENCY[0].ticker).toBe('CRY1');
  });

  it('returns empty partition when given empty input', () => {
    const partition = partitionByType([]);

    expect(partition.FII).toHaveLength(0);
    expect(partition.STOCK).toHaveLength(0);
    expect(partition.CRYPTOCURRENCY).toHaveLength(0);
  });
});

describe('sortAssets', () => {
  const assetsForSort: Asset[] = [
    makeAsset({ ticker: 'BRAVO', name: 'Bravo Fund' }),
    makeAsset({ ticker: 'ALPHA', name: 'Alpha Fund' }),
    makeAsset({ ticker: 'CHARLIE', name: 'Charlie Fund' }),
  ];

  it('ascending by ticker sorts alphabetically', () => {
    const sort: Sort = { active: 'ticker', direction: 'asc' };
    const sorted = sortAssets(assetsForSort, sort, []);

    expect(sorted[0].ticker).toBe('ALPHA');
    expect(sorted[1].ticker).toBe('BRAVO');
    expect(sorted[2].ticker).toBe('CHARLIE');
  });

  it('descending by ticker sorts reverse alphabetically', () => {
    const sort: Sort = { active: 'ticker', direction: 'desc' };
    const sorted = sortAssets(assetsForSort, sort, []);

    expect(sorted[0].ticker).toBe('CHARLIE');
    expect(sorted[1].ticker).toBe('BRAVO');
    expect(sorted[2].ticker).toBe('ALPHA');
  });

  it('empty direction returns a copy of input without sorting', () => {
    const sort: Sort = { active: 'ticker', direction: '' };
    const sorted = sortAssets(assetsForSort, sort, []);

    expect(sorted).toEqual(assetsForSort);
    expect(sorted).not.toBe(assetsForSort); // new array, not same reference
  });

  it('ascending by indicator column places missing values first', () => {
    const assets: Asset[] = [
      makeAsset({ ticker: 'HAS1', indicators: [{ code: 'PRICE', value: 50 }] }),
      makeAsset({ ticker: 'MISSING', indicators: [] }),
      makeAsset({ ticker: 'HAS2', indicators: [{ code: 'PRICE', value: 10 }] }),
    ];

    const sort: Sort = { active: 'PRICE', direction: 'asc' };
    const sorted = sortAssets(assets, sort, ['PRICE']);

    expect(sorted[0].ticker).toBe('MISSING');
    expect(sorted[1].ticker).toBe('HAS2');
    expect(sorted[2].ticker).toBe('HAS1');
  });

  it('descending by indicator column places missing values last', () => {
    const assets: Asset[] = [
      makeAsset({ ticker: 'HAS1', indicators: [{ code: 'PRICE', value: 50 }] }),
      makeAsset({ ticker: 'MISSING', indicators: [] }),
      makeAsset({ ticker: 'HAS2', indicators: [{ code: 'PRICE', value: 10 }] }),
    ];

    const sort: Sort = { active: 'PRICE', direction: 'desc' };
    const sorted = sortAssets(assets, sort, ['PRICE']);

    expect(sorted[0].ticker).toBe('HAS1');
    expect(sorted[1].ticker).toBe('HAS2');
    expect(sorted[2].ticker).toBe('MISSING');
  });
});

import { describe, it } from 'vitest';
import fc from 'fast-check';
import { partitionByType, buildColumnsForTab, formatIndicatorCode, getIndicatorValue, sortAssets } from './asset-tab.utils';
import { Asset, AssetType } from '../../domain/models/asset.model';
import { Sort } from '@angular/material/sort';

const assetArbitrary: fc.Arbitrary<Asset> = fc.record({
  ticker: fc.string({ minLength: 1, maxLength: 10 }),
  name: fc.string({ minLength: 1, maxLength: 30 }),
  assetType: fc.constantFrom<AssetType>('FII', 'STOCK', 'CRYPTOCURRENCY'),
  indicators: fc.array(
    fc.record({
      code: fc.string(),
      value: fc.double({ min: 0, max: 10000, noNaN: true }),
    }),
  ),
  updatedAt: fc.date(),
});

describe('partitionByType - Property Tests', () => {
  /**
   * Property 1: Partitioning preserves all assets and ensures type-correctness
   * Validates: Requirements 1.3, 3.1, 3.4
   */
  it('partitioning preserves all assets and ensures type-correctness', () => {
    fc.assert(
      fc.property(fc.array(assetArbitrary), (assets) => {
        const partition = partitionByType(assets);

        // Total count across partitions equals input length
        const totalCount =
          partition.FII.length +
          partition.STOCK.length +
          partition.CRYPTOCURRENCY.length;
        if (totalCount !== assets.length) {
          return false;
        }

        // Every asset in each partition has the matching AssetType
        const fiiCorrect = partition.FII.every((a) => a.assetType === 'FII');
        const stockCorrect = partition.STOCK.every((a) => a.assetType === 'STOCK');
        const cryptoCorrect = partition.CRYPTOCURRENCY.every(
          (a) => a.assetType === 'CRYPTOCURRENCY',
        );

        return fiiCorrect && stockCorrect && cryptoCorrect;
      }),
      { numRuns: 100 },
    );
  });
});

describe('buildColumnsForTab - Property Tests', () => {
  /**
   * Property 2: Column generation produces fixed columns plus exactly the distinct indicator columns
   * Validates: Requirements 2.1, 2.6
   */
  it('produces fixed columns plus exactly the distinct indicator columns', () => {
    fc.assert(
      fc.property(fc.array(assetArbitrary, { minLength: 1 }), (assets) => {
        const columns = buildColumnsForTab(assets);

        // First 3 columns are always ticker, name, updatedAt
        const fixedKeys = columns.slice(0, 3).map((col) => col.key);
        if (
          fixedKeys[0] !== 'ticker' ||
          fixedKeys[1] !== 'name' ||
          fixedKeys[2] !== 'updatedAt'
        ) {
          return false;
        }

        // Collect distinct indicator codes from the input assets
        const expectedCodes = new Set<string>();
        for (const asset of assets) {
          for (const indicator of asset.indicators) {
            expectedCodes.add(indicator.code);
          }
        }

        // Remaining columns' keys must match exactly the distinct indicator codes
        const indicatorColumnKeys = new Set(columns.slice(3).map((col) => col.key));

        if (indicatorColumnKeys.size !== expectedCodes.size) {
          return false;
        }

        for (const code of expectedCodes) {
          if (!indicatorColumnKeys.has(code)) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });
});

describe('formatIndicatorCode - Property Tests', () => {
  /**
   * Property 3: Indicator code formatting replaces underscores with spaces and title-cases words
   * Validates: Requirements 2.2
   */

  const upperWordArbitrary: fc.Arbitrary<string> = fc
    .array(fc.constantFrom(...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')), { minLength: 1, maxLength: 10 })
    .map(chars => chars.join(''));

  const indicatorCodeArbitrary: fc.Arbitrary<string> = fc
    .array(upperWordArbitrary, { minLength: 1, maxLength: 5 })
    .map(parts => parts.join('_'));

  it('replaces underscores with spaces and title-cases each word', () => {
    fc.assert(
      fc.property(indicatorCodeArbitrary, (code) => {
        const result = formatIndicatorCode(code);

        // Output contains no underscores
        if (result.includes('_')) {
          return false;
        }

        // Each word starts with uppercase, remaining characters are lowercase
        const words = result.split(' ');
        for (const word of words) {
          if (word.length === 0) {
            return false;
          }
          if (word[0] !== word[0].toUpperCase()) {
            return false;
          }
          if (word.slice(1) !== word.slice(1).toLowerCase()) {
            return false;
          }
        }

        return true;
      }),
      { numRuns: 100 },
    );
  });
});

describe('getIndicatorValue - Property Tests', () => {
  /**
   * Property 4: Indicator value lookup returns the correct value or undefined for missing codes
   * Validates: Requirements 2.3
   */

  const indicatorArbitrary = fc.record({
    code: fc.string({ minLength: 1, maxLength: 20 }),
    value: fc.double({ min: 0, max: 10000, noNaN: true }),
  });

  it('returns the correct value for a present indicator code', () => {
    fc.assert(
      fc.property(
        fc.array(indicatorArbitrary, { minLength: 1, maxLength: 10 }),
        fc.nat(),
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.constantFrom<AssetType>('FII', 'STOCK', 'CRYPTOCURRENCY'),
        fc.date(),
        (indicators, rawIndex, ticker, name, assetType, updatedAt) => {
          const index = rawIndex % indicators.length;
          const targetCode = indicators[index].code;
          const expectedValue = indicators[index].value;

          const asset: Asset = { ticker, name, assetType, indicators, updatedAt };
          const result = getIndicatorValue(asset, targetCode);

          return result === expectedValue;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('returns undefined for an absent indicator code', () => {
    fc.assert(
      fc.property(
        assetArbitrary,
        fc.string({ minLength: 1, maxLength: 20 }),
        (asset, randomCode) => {
          const absentCode = `__ABSENT__${randomCode}`;
          const existingCodes = asset.indicators.map(ind => ind.code);

          // Only test if the generated absent code is truly absent
          if (existingCodes.includes(absentCode)) {
            return true; // skip this case
          }

          const result = getIndicatorValue(asset, absentCode);
          return result === undefined;
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('sortAssets - Property Tests', () => {
  /**
   * Property 5: Sorting with missing indicator values treats them as lowest
   * Validates: Requirements 5.1, 5.3
   */

  const INDICATOR_CODE = 'TEST_INDICATOR';

  const assetWithIndicator: fc.Arbitrary<Asset> = fc.record({
    ticker: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    assetType: fc.constantFrom<AssetType>('FII', 'STOCK', 'CRYPTOCURRENCY'),
    indicators: fc
      .double({ min: 0, max: 10000, noNaN: true })
      .map(value => [{ code: INDICATOR_CODE, value }]),
    updatedAt: fc.date(),
  });

  const assetWithoutIndicator: fc.Arbitrary<Asset> = fc.record({
    ticker: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    assetType: fc.constantFrom<AssetType>('FII', 'STOCK', 'CRYPTOCURRENCY'),
    indicators: fc.constant([]),
    updatedAt: fc.date(),
  });

  it('ascending sort places missing-value assets before all present-value assets', () => {
    fc.assert(
      fc.property(
        fc.array(assetWithIndicator, { minLength: 1, maxLength: 10 }),
        fc.array(assetWithoutIndicator, { minLength: 1, maxLength: 10 }),
        (withIndicator, withoutIndicator) => {
          const combined = [...withIndicator, ...withoutIndicator];
          const sort: Sort = { active: INDICATOR_CODE, direction: 'asc' };

          const sorted = sortAssets(combined, sort, [INDICATOR_CODE]);

          // All assets without the indicator should appear before all assets with it
          const missingCount = withoutIndicator.length;
          const firstPart = sorted.slice(0, missingCount);
          const secondPart = sorted.slice(missingCount);

          const allFirstAreMissing = firstPart.every(
            asset => getIndicatorValue(asset, INDICATOR_CODE) === undefined,
          );
          const allSecondArePresent = secondPart.every(
            asset => getIndicatorValue(asset, INDICATOR_CODE) !== undefined,
          );

          return allFirstAreMissing && allSecondArePresent;
        },
      ),
      { numRuns: 100 },
    );
  });

  it('descending sort places missing-value assets after all present-value assets', () => {
    fc.assert(
      fc.property(
        fc.array(assetWithIndicator, { minLength: 1, maxLength: 10 }),
        fc.array(assetWithoutIndicator, { minLength: 1, maxLength: 10 }),
        (withIndicator, withoutIndicator) => {
          const combined = [...withIndicator, ...withoutIndicator];
          const sort: Sort = { active: INDICATOR_CODE, direction: 'desc' };

          const sorted = sortAssets(combined, sort, [INDICATOR_CODE]);

          // All assets with the indicator should appear before all assets without it
          const presentCount = withIndicator.length;
          const firstPart = sorted.slice(0, presentCount);
          const secondPart = sorted.slice(presentCount);

          const allFirstArePresent = firstPart.every(
            asset => getIndicatorValue(asset, INDICATOR_CODE) !== undefined,
          );
          const allSecondAreMissing = secondPart.every(
            asset => getIndicatorValue(asset, INDICATOR_CODE) === undefined,
          );

          return allFirstArePresent && allSecondAreMissing;
        },
      ),
      { numRuns: 100 },
    );
  });
});

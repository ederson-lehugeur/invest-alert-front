// Feature: material-dashboard-redesign, Property 3: Client-side asset sorting correctness
import * as fc from 'fast-check';

type SortableColumn = 'currentPrice' | 'dividendYield' | 'pVp';
type SortDirection = 'asc' | 'desc';

interface AssetLike {
  readonly currentPrice: number;
  readonly dividendYield: number;
  readonly pVp: number;
}

/**
 * Pure sorting function extracted from AssetsPageComponent.onSortChange().
 * Mirrors the exact logic used in the component:
 *   [...data].sort((a, b) => direction === 'asc' ? aVal - bVal : bVal - aVal)
 */
function sortAssets<T extends AssetLike>(
  data: readonly T[],
  column: SortableColumn,
  direction: SortDirection,
): T[] {
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

/**
 * **Validates: Requirements 6.3**
 *
 * Property 3: Client-side asset sorting correctness
 * For any non-empty array of Asset objects and any valid sortable column
 * with any direction (asc or desc), the sorted result should be ordered
 * such that for every consecutive pair of elements, the value in the sort
 * column respects the specified direction.
 */
describe('AssetsPage - Client-side sorting property test', () => {
  const assetArb = fc.record({
    currentPrice: fc.double({ min: 0, max: 100_000, noNaN: true, noDefaultInfinity: true }),
    dividendYield: fc.double({ min: 0, max: 100, noNaN: true, noDefaultInfinity: true }),
    pVp: fc.double({ min: 0, max: 1000, noNaN: true, noDefaultInfinity: true }),
  });

  const columnArb = fc.constantFrom<SortableColumn>('currentPrice', 'dividendYield', 'pVp');
  const directionArb = fc.constantFrom<SortDirection>('asc', 'desc');

  it('ordering invariant holds for every consecutive pair after sorting', () => {
    fc.assert(
      fc.property(
        fc.array(assetArb, { minLength: 1, maxLength: 50 }),
        columnArb,
        directionArb,
        (assets, column, direction) => {
          const sorted = sortAssets(assets, column, direction);

          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i][column];
            const next = sorted[i + 1][column];

            if (direction === 'asc') {
              expect(current).toBeLessThanOrEqual(next);
            } else {
              expect(current).toBeGreaterThanOrEqual(next);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

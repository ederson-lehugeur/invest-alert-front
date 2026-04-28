// Feature: material-dashboard-redesign, Property 4: Filter state persistence round-trip
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import * as fc from 'fast-check';
import { FilterStateService } from './filter-state.service';

/**
 * **Validates: Requirements 7.5, 7.6**
 *
 * Property 4: Filter state persistence round-trip
 * For any valid AlertFilterState object (with arbitrary ticker string and status value),
 * saving it via FilterStateService and loading it back should produce an equivalent object.
 */
describe('FilterStateService - Property Tests', () => {
  function createService(): FilterStateService {
    const storage: Record<string, string> = {};

    const localStorageMock = {
      getItem: (key: string): string | null => storage[key] ?? null,
      setItem: (key: string, value: string): void => {
        storage[key] = value;
      },
      removeItem: (key: string): void => {
        delete storage[key];
      },
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });

    TestBed.configureTestingModule({
      providers: [
        FilterStateService,
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    return TestBed.inject(FilterStateService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('saving and loading back any AlertFilterState produces an equivalent object', () => {
    fc.assert(
      fc.property(
        fc.record({
          ticker: fc.string(),
          status: fc.constantFrom('', 'PENDING', 'SENT'),
        }),
        (filterState) => {
          const service = createService();

          service.save('alerts-filter', filterState);
          const loaded = service.load<{ ticker: string; status: string }>('alerts-filter');

          expect(loaded).toEqual(filterState);

          TestBed.resetTestingModule();
        },
      ),
      { numRuns: 100 },
    );
  });
});

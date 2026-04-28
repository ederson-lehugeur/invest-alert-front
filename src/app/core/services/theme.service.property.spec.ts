// Feature: material-dashboard-redesign, Property 1: Theme toggle self-inverse
import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import * as fc from 'fast-check';
import { ThemeService, ThemeMode } from './theme.service';

/**
 * **Validates: Requirements 3.2**
 *
 * Property 1: Theme toggle self-inverse
 * For any initial ThemeMode, toggling twice returns to the original mode.
 */
describe('ThemeService - Property Tests', () => {
  function createService(initialTheme: ThemeMode): ThemeService {
    const storage: Record<string, string> = {
      'investalert-theme': initialTheme,
    };

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

    const mockDocument = {
      documentElement: {
        classList: {
          add: vi.fn(),
          remove: vi.fn(),
        },
      },
    } as unknown as Document;

    TestBed.configureTestingModule({
      providers: [
        ThemeService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    return TestBed.inject(ThemeService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('toggling theme twice returns to the original mode', () => {
    fc.assert(
      fc.property(fc.constantFrom<ThemeMode>('dark', 'light'), (initialMode) => {
        const service = createService(initialMode);
        TestBed.flushEffects();

        expect(service.themeMode()).toBe(initialMode);

        service.toggleTheme();
        service.toggleTheme();

        expect(service.themeMode()).toBe(initialMode);

        TestBed.resetTestingModule();
      }),
      { numRuns: 100 },
    );
  });

  // Feature: material-dashboard-redesign, Property 2: Theme persistence round-trip
  /**
   * **Validates: Requirements 3.3, 3.4**
   *
   * Property 2: Theme persistence round-trip
   * For any valid ThemeMode, persisting and loading back produces the same value.
   */
  it('persisting a theme and loading it back on a new service instance produces the same value', () => {
    fc.assert(
      fc.property(fc.constantFrom<ThemeMode>('dark', 'light'), (mode) => {
        // Shared storage backing both service instances
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

        const createMockDocument = (): Document =>
          ({
            documentElement: {
              classList: {
                add: vi.fn(),
                remove: vi.fn(),
              },
            },
          }) as unknown as Document;

        // 1. Create first service and set the theme to the generated mode
        TestBed.configureTestingModule({
          providers: [
            ThemeService,
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DOCUMENT, useValue: createMockDocument() },
          ],
        });

        const firstService = TestBed.inject(ThemeService);
        TestBed.flushEffects();

        // Toggle to the opposite first, then toggle to the desired mode.
        // This guarantees persistTheme() is called with the target mode,
        // since toggleTheme() is the only public method that persists.
        if (firstService.themeMode() === mode) {
          firstService.toggleTheme(); // move away
        }
        firstService.toggleTheme(); // arrive at desired mode (persists it)

        expect(firstService.themeMode()).toBe(mode);

        // Verify localStorage was written
        expect(storage['investalert-theme']).toBe(mode);

        TestBed.resetTestingModule();

        // 2. Create a NEW service instance that loads from the same mock localStorage
        TestBed.configureTestingModule({
          providers: [
            ThemeService,
            { provide: PLATFORM_ID, useValue: 'browser' },
            { provide: DOCUMENT, useValue: createMockDocument() },
          ],
        });

        const secondService = TestBed.inject(ThemeService);
        TestBed.flushEffects();

        // 3. Assert the loaded theme matches the original
        expect(secondService.themeMode()).toBe(mode);

        TestBed.resetTestingModule();
      }),
      { numRuns: 100 },
    );
  });
});

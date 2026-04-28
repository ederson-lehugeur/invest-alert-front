import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { FilterStateService } from './filter-state.service';

describe('FilterStateService', () => {
  let service: FilterStateService;
  let storage: Record<string, string>;

  function createService(platformId: string = 'browser'): FilterStateService {
    storage = {};

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
      providers: [FilterStateService, { provide: PLATFORM_ID, useValue: platformId }],
    });

    return TestBed.inject(FilterStateService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('save', () => {
    it('should persist state as JSON in localStorage', () => {
      service = createService('browser');
      const state = { ticker: 'PETR4', status: 'PENDING' };

      service.save('alerts-filter', state);

      expect(storage['alerts-filter']).toBe(JSON.stringify(state));
    });

    it('should not write to localStorage during SSR', () => {
      service = createService('server');

      service.save('alerts-filter', { ticker: 'PETR4' });

      expect(storage['alerts-filter']).toBeUndefined();
    });
  });

  describe('load', () => {
    it('should return parsed state from localStorage', () => {
      service = createService('browser');
      const state = { ticker: 'VALE3', status: 'SENT' };
      storage['alerts-filter'] = JSON.stringify(state);

      const result = service.load<{ ticker: string; status: string }>('alerts-filter');

      expect(result).toEqual(state);
    });

    it('should return null when key does not exist', () => {
      service = createService('browser');

      const result = service.load('nonexistent-key');

      expect(result).toBeNull();
    });

    it('should return null during SSR', () => {
      service = createService('server');
      storage['alerts-filter'] = JSON.stringify({ ticker: 'PETR4' });

      const result = service.load('alerts-filter');

      expect(result).toBeNull();
    });

    it('should return null for invalid JSON', () => {
      service = createService('browser');
      storage['alerts-filter'] = '{invalid-json';

      const result = service.load('alerts-filter');

      expect(result).toBeNull();
    });
  });

  describe('clear', () => {
    it('should remove the key from localStorage', () => {
      service = createService('browser');
      storage['alerts-filter'] = JSON.stringify({ ticker: 'PETR4' });

      service.clear('alerts-filter');

      expect(storage['alerts-filter']).toBeUndefined();
    });

    it('should not attempt removal during SSR', () => {
      service = createService('server');
      storage['alerts-filter'] = JSON.stringify({ ticker: 'PETR4' });

      service.clear('alerts-filter');

      expect(storage['alerts-filter']).toBeDefined();
    });
  });

  describe('round-trip', () => {
    it('should save and load back the same object', () => {
      service = createService('browser');
      const state = { ticker: 'BBDC4', status: 'PENDING' };

      service.save('test-key', state);
      const loaded = service.load<typeof state>('test-key');

      expect(loaded).toEqual(state);
    });
  });
});

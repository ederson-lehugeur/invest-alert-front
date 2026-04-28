import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ThemeService, ThemeMode } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let mockDocument: Document;

  function createService(
    platformId: string = 'browser',
    storedTheme: string | null = null,
  ): ThemeService {
    const storage: Record<string, string> = {};
    if (storedTheme !== null) {
      storage['investalert-theme'] = storedTheme;
    }

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

    mockDocument = {
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
        { provide: PLATFORM_ID, useValue: platformId },
        { provide: DOCUMENT, useValue: mockDocument },
      ],
    });

    return TestBed.inject(ThemeService);
  }

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('loadInitialTheme', () => {
    it('should default to dark mode when no preference is stored', () => {
      service = createService('browser', null);
      TestBed.flushEffects();

      expect(service.themeMode()).toBe('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should restore light theme from localStorage', () => {
      service = createService('browser', 'light');
      TestBed.flushEffects();

      expect(service.themeMode()).toBe('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should restore dark theme from localStorage', () => {
      service = createService('browser', 'dark');
      TestBed.flushEffects();

      expect(service.themeMode()).toBe('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should default to dark mode for invalid stored value', () => {
      service = createService('browser', 'invalid');
      TestBed.flushEffects();

      expect(service.themeMode()).toBe('dark');
    });

    it('should default to dark mode during SSR', () => {
      service = createService('server', 'light');
      TestBed.flushEffects();

      expect(service.themeMode()).toBe('dark');
    });
  });

  describe('toggleTheme', () => {
    it('should switch from dark to light', () => {
      service = createService('browser', 'dark');
      TestBed.flushEffects();

      service.toggleTheme();

      expect(service.themeMode()).toBe('light');
      expect(service.isDarkMode()).toBe(false);
    });

    it('should switch from light to dark', () => {
      service = createService('browser', 'light');
      TestBed.flushEffects();

      service.toggleTheme();

      expect(service.themeMode()).toBe('dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should persist the new theme to localStorage', () => {
      service = createService('browser', 'dark');
      TestBed.flushEffects();

      service.toggleTheme();

      expect(localStorage.getItem('investalert-theme')).toBe('light');
    });

    it('should not persist during SSR', () => {
      service = createService('server', null);
      TestBed.flushEffects();

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      service.toggleTheme();

      expect(setItemSpy).not.toHaveBeenCalled();
      setItemSpy.mockRestore();
    });
  });

  describe('applyTheme (via effect)', () => {
    it('should add light-theme class when theme is light', () => {
      service = createService('browser', 'light');
      TestBed.flushEffects();

      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('light-theme');
    });

    it('should remove light-theme class when theme is dark', () => {
      service = createService('browser', 'dark');
      TestBed.flushEffects();

      expect(mockDocument.documentElement.classList.remove).toHaveBeenCalledWith('light-theme');
    });

    it('should update CSS class when toggling theme', () => {
      service = createService('browser', 'dark');
      TestBed.flushEffects();

      service.toggleTheme();
      TestBed.flushEffects();

      expect(mockDocument.documentElement.classList.add).toHaveBeenCalledWith('light-theme');
    });
  });

  describe('isDarkMode computed', () => {
    it('should return true when themeMode is dark', () => {
      service = createService('browser', 'dark');
      expect(service.isDarkMode()).toBe(true);
    });

    it('should return false when themeMode is light', () => {
      service = createService('browser', 'light');
      expect(service.isDarkMode()).toBe(false);
    });
  });
});

import { computed, effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

export type ThemeMode = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly STORAGE_KEY = 'investalert-theme';

  readonly themeMode = signal<ThemeMode>(this.loadInitialTheme());
  readonly isDarkMode = computed(() => this.themeMode() === 'dark');

  constructor() {
    effect(() => {
      this.applyTheme(this.themeMode());
    });
  }

  toggleTheme(): void {
    const next: ThemeMode = this.themeMode() === 'dark' ? 'light' : 'dark';
    this.themeMode.set(next);
    this.persistTheme(next);
  }

  private loadInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'dark';
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch {
      // localStorage may be unavailable - fall through to default
    }

    return 'dark';
  }

  private persistTheme(mode: ThemeMode): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, mode);
    } catch {
      // localStorage may be unavailable - silently ignore
    }
  }

  private applyTheme(mode: ThemeMode): void {
    const htmlElement = this.document.documentElement;
    if (!htmlElement) {
      return;
    }

    if (mode === 'light') {
      htmlElement.classList.add('light-theme');
    } else {
      htmlElement.classList.remove('light-theme');
    }
  }
}

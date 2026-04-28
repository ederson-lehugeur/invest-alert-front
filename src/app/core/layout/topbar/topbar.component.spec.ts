import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal, WritableSignal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { TopbarComponent } from './topbar.component';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

interface MockThemeService {
  themeMode: WritableSignal<ThemeMode>;
  isDarkMode: WritableSignal<boolean>;
  toggleTheme: ReturnType<typeof vi.fn>;
}

interface MockAuthFacade {
  logout: ReturnType<typeof vi.fn>;
  isAuthenticated$: Observable<boolean>;
}

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let mockThemeService: MockThemeService;
  let mockAuthFacade: MockAuthFacade;
  let breakpointSubject: BehaviorSubject<BreakpointState>;

  function setup(isMobile = false): void {
    breakpointSubject = new BehaviorSubject<BreakpointState>({
      matches: isMobile,
      breakpoints: { '(max-width: 767.98px)': isMobile },
    });

    mockThemeService = {
      themeMode: signal<ThemeMode>('dark'),
      isDarkMode: signal(true),
      toggleTheme: vi.fn(),
    };

    mockAuthFacade = {
      logout: vi.fn(),
      isAuthenticated$: new BehaviorSubject(true),
    };

    TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthFacade, useValue: mockAuthFacade },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpointSubject.asObservable() },
        },
      ],
    });

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should display the application name "InvestAlert"', () => {
    setup();
    const appName = fixture.debugElement.query(By.css('.app-name'));
    expect(appName.nativeElement.textContent.trim()).toBe('InvestAlert');
  });

  it('should render a logout button with aria-label', () => {
    setup();
    const logoutBtn = fixture.debugElement.query(
      By.css('button[aria-label="Logout"]'),
    );
    expect(logoutBtn).toBeTruthy();
  });

  it('should call authFacade.logout when logout button is clicked', () => {
    setup();
    const logoutBtn = fixture.debugElement.query(
      By.css('button[aria-label="Logout"]'),
    );
    logoutBtn.nativeElement.click();
    expect(mockAuthFacade.logout).toHaveBeenCalled();
  });

  it('should render theme toggle button', () => {
    setup();
    const themeBtn = fixture.debugElement.queryAll(
      By.css('button[mat-icon-button]'),
    );
    const themeBtnWithLabel = themeBtn.find((btn) => {
      const label = btn.nativeElement.getAttribute('aria-label') ?? '';
      return label.includes('Switch to');
    });
    expect(themeBtnWithLabel).toBeTruthy();
  });

  it('should show dark_mode icon when in dark mode', () => {
    setup();
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const iconTexts = icons.map((i) => i.nativeElement.textContent.trim());
    expect(iconTexts).toContain('dark_mode');
  });

  it('should show light_mode icon when in light mode', () => {
    setup();
    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const iconTexts = icons.map((i) => i.nativeElement.textContent.trim());
    expect(iconTexts).toContain('light_mode');
  });

  it('should call themeService.toggleTheme when theme button is clicked', () => {
    setup();
    const buttons = fixture.debugElement.queryAll(
      By.css('button[mat-icon-button]'),
    );
    const themeBtn = buttons.find((btn) => {
      const label = btn.nativeElement.getAttribute('aria-label') ?? '';
      return label.includes('Switch to');
    });
    themeBtn!.nativeElement.click();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('should NOT show menu toggle button on desktop', () => {
    setup(false);
    const menuBtn = fixture.debugElement.query(
      By.css('button[aria-label="Toggle menu"]'),
    );
    expect(menuBtn).toBeNull();
  });

  it('should show menu toggle button on mobile', () => {
    setup(true);
    const menuBtn = fixture.debugElement.query(
      By.css('button[aria-label="Toggle menu"]'),
    );
    expect(menuBtn).toBeTruthy();
  });

  it('should emit menuToggle when menu button is clicked on mobile', () => {
    setup(true);
    const emitSpy = vi.spyOn(component.menuToggle, 'emit');
    const menuBtn = fixture.debugElement.query(
      By.css('button[aria-label="Toggle menu"]'),
    );
    menuBtn.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should render menu icon in the menu toggle button', () => {
    setup(true);
    const menuBtn = fixture.debugElement.query(
      By.css('button[aria-label="Toggle menu"]'),
    );
    const icon = menuBtn.query(By.css('mat-icon'));
    expect(icon.nativeElement.textContent.trim()).toBe('menu');
  });

  it('should use MatToolbar', () => {
    setup();
    const toolbar = fixture.debugElement.query(By.css('mat-toolbar'));
    expect(toolbar).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { Component, signal, WritableSignal } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { LayoutShellComponent } from './layout-shell.component';
import { ThemeService, ThemeMode } from '../../services/theme.service';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

@Component({ standalone: true, template: '' })
class DummyComponent {}

interface MockThemeService {
  themeMode: WritableSignal<ThemeMode>;
  isDarkMode: WritableSignal<boolean>;
  toggleTheme: ReturnType<typeof vi.fn>;
}

interface MockAuthFacade {
  logout: ReturnType<typeof vi.fn>;
  isAuthenticated$: Observable<boolean>;
}

describe('LayoutShellComponent', () => {
  let component: LayoutShellComponent;
  let fixture: ComponentFixture<LayoutShellComponent>;
  let breakpointSubject: BehaviorSubject<BreakpointState>;
  let mockThemeService: MockThemeService;
  let mockAuthFacade: MockAuthFacade;

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
      imports: [LayoutShellComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'assets', component: DummyComponent },
          { path: 'rules', component: DummyComponent },
          { path: 'alerts', component: DummyComponent },
        ]),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: AuthFacade, useValue: mockAuthFacade },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => breakpointSubject.asObservable() },
        },
      ],
    });

    fixture = TestBed.createComponent(LayoutShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('should default sidenavMode to "side" on desktop', () => {
    setup(false);
    expect(component.sidenavMode()).toBe('side');
  });

  it('should default sidenavOpened to true on desktop', () => {
    setup(false);
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should set sidenavMode to "over" on mobile breakpoint', () => {
    setup(true);
    expect(component.sidenavMode()).toBe('over');
  });

  it('should close sidenav on mobile breakpoint', () => {
    setup(true);
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should toggle sidenavOpened when toggleSidenav is called', () => {
    setup(false);
    expect(component.sidenavOpened()).toBe(true);
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(false);
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should close sidenav on link click when in "over" mode', () => {
    setup(true);
    // Mobile mode: sidenavMode is 'over', sidenavOpened is false
    // Open it first
    component.sidenavOpened.set(true);
    expect(component.sidenavOpened()).toBe(true);

    component.onSidebarLinkClicked();
    expect(component.sidenavOpened()).toBe(false);
  });

  it('should NOT close sidenav on link click when in "side" mode', () => {
    setup(false);
    expect(component.sidenavMode()).toBe('side');
    expect(component.sidenavOpened()).toBe(true);

    component.onSidebarLinkClicked();
    expect(component.sidenavOpened()).toBe(true);
  });

  it('should contain a <main role="main"> element', () => {
    setup();
    const main = fixture.debugElement.query(By.css('main[role="main"]'));
    expect(main).toBeTruthy();
  });

  it('should contain a router-outlet', () => {
    setup();
    const outlet = fixture.debugElement.query(By.css('router-outlet'));
    expect(outlet).toBeTruthy();
  });

  it('should switch from desktop to mobile when breakpoint changes', () => {
    setup(false);
    expect(component.sidenavMode()).toBe('side');
    expect(component.sidenavOpened()).toBe(true);

    breakpointSubject.next({
      matches: true,
      breakpoints: { '(max-width: 767.98px)': true },
    });
    fixture.detectChanges();

    expect(component.sidenavMode()).toBe('over');
    expect(component.sidenavOpened()).toBe(false);
  });
});

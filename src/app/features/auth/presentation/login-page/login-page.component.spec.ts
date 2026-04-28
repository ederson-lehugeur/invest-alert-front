import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { AuthFacade } from '../../application/auth.facade';
import { ThemeService } from '../../../../core/services/theme.service';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockAuthFacade: { login: ReturnType<typeof vi.fn>; loading: WritableSignal<boolean>; error: WritableSignal<string | null> };
  let mockThemeService: { isDarkMode: WritableSignal<boolean>; toggleTheme: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockAuthFacade = {
      login: vi.fn(),
      loading: signal(false),
      error: signal<string | null>(null),
    };

    mockThemeService = {
      isDarkMode: signal(false),
      toggleTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Material form fields (Task 4.2) ---

  it('renders email mat-form-field with matInput', () => {
    const emailInput = fixture.nativeElement.querySelector('input[type="email"][ng-reflect-name="email"]') ??
      fixture.nativeElement.querySelector('mat-form-field input[type="email"]');
    expect(emailInput).toBeTruthy();
  });

  it('renders password mat-form-field with matInput', () => {
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]');
    expect(passwordInput).toBeTruthy();
  });

  it('each mat-form-field has a mat-label', () => {
    const labels = fixture.nativeElement.querySelectorAll('mat-label');
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it('email input has autocomplete="email"', () => {
    const emailInput = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    expect(emailInput.getAttribute('autocomplete')).toBe('email');
  });

  it('password input has autocomplete="current-password"', () => {
    const passwordInput = fixture.nativeElement.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput.getAttribute('autocomplete')).toBe('current-password');
  });

  it('shows mat-error for email when form submitted empty', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
    const emailError = Array.from(errors).find((el) =>
      el.textContent?.includes('Email is required')
    );
    expect(emailError).toBeTruthy();
  });

  it('shows mat-error for password when form submitted empty', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
    const passwordError = Array.from(errors).find((el) =>
      el.textContent?.includes('Password is required')
    );
    expect(passwordError).toBeTruthy();
  });

  // --- Submit button and loading state (Task 4.3) ---

  it('renders submit button with mat-flat-button and color="primary"', () => {
    const button = fixture.nativeElement.querySelector('button[mat-flat-button]') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.getAttribute('color') ?? button.getAttribute('ng-reflect-color')).toBe('primary');
  });

  it('submit button is disabled when authFacade.loading() is true', () => {
    mockAuthFacade.loading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  // --- Product heading (Task 4.4) ---

  it('displays "InvestAlert" heading above the form', () => {
    const heading = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(heading).toBeTruthy();
    expect(heading.textContent?.trim()).toBe('InvestAlert');
  });

  it('heading has Material typography class mat-headline-medium', () => {
    const heading = fixture.nativeElement.querySelector('h1') as HTMLElement;
    expect(heading.classList.contains('mat-headline-medium')).toBe(true);
  });

  // --- Theme toggle (Task 4.5) ---

  it('theme toggle button is present', () => {
    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(toggle).toBeTruthy();
  });

  it('clicking theme toggle calls ThemeService.toggleTheme()', () => {
    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    toggle.click();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('shows dark_mode icon when isDarkMode is true', () => {
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('button[mat-icon-button] mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('dark_mode');
  });

  it('shows light_mode icon when isDarkMode is false', () => {
    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('button[mat-icon-button] mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('light_mode');
  });

  it('aria-label is "Switch to light mode" when isDarkMode is true', () => {
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('aria-label is "Switch to dark mode" when isDarkMode is false', () => {
    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  // --- Existing tests that still apply ---

  it('should call authFacade.login with correct data on valid submission', () => {
    component['loginForm'].controls.email.setValue('john@example.com');
    component['loginForm'].controls.password.setValue('secret123');

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockAuthFacade.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'secret123',
    });
  });

  it('should not call authFacade.login on invalid submission', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockAuthFacade.login).not.toHaveBeenCalled();
  });

  it('should have a register link', () => {
    const link = fixture.nativeElement.querySelector('a[href="/auth/register"]');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Register');
  });
});

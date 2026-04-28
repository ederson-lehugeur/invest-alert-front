import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import fc from 'fast-check';
import { RegisterPageComponent } from './register-page.component';
import { AuthFacade } from '../../application/auth.facade';
import { ThemeService } from '../../../../core/services/theme.service';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;
  let mockAuthFacade: {
    register: ReturnType<typeof vi.fn>;
    loading: WritableSignal<boolean>;
    error: WritableSignal<string | null>;
  };
  let mockThemeService: {
    isDarkMode: WritableSignal<boolean>;
    toggleTheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthFacade = {
      register: vi.fn(),
      loading: signal(false),
      error: signal<string | null>(null),
    };

    mockThemeService = {
      isDarkMode: signal(false),
      toggleTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideAnimationsAsync(),
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // --- Task 5.1: Material structure (Req 1) ---

  it('renders mat-card', () => {
    const card = fixture.nativeElement.querySelector('mat-card');
    expect(card).toBeTruthy();
  });

  it('renders mat-card-content', () => {
    const cardContent = fixture.nativeElement.querySelector('mat-card-content');
    expect(cardContent).toBeTruthy();
  });

  it('renders three mat-form-field elements with appearance="outline"', () => {
    const fields = fixture.nativeElement.querySelectorAll('mat-form-field') as NodeListOf<HTMLElement>;
    expect(fields.length).toBe(3);
    fields.forEach((field) => {
      expect(field.getAttribute('appearance') ?? field.getAttribute('ng-reflect-appearance')).toBe('outline');
    });
  });

  it('all inputs inside mat-form-field carry the matInput directive', () => {
    const inputs = fixture.nativeElement.querySelectorAll('mat-form-field input') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(3);
    inputs.forEach((input) => {
      expect(input.hasAttribute('mat-input-element') || input.classList.contains('mat-mdc-input-element') || input.hasAttribute('matinput')).toBe(true);
    });
  });

  it('submit button has mat-flat-button directive', () => {
    const button = fixture.nativeElement.querySelector('button[mat-flat-button]');
    expect(button).toBeTruthy();
  });

  // --- Task 5.2: Theme toggle (Req 3) ---

  it('theme toggle button is rendered', () => {
    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]');
    expect(toggle).toBeTruthy();
  });

  it('clicking theme toggle button calls themeService.toggleTheme()', () => {
    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    toggle.click();
    expect(mockThemeService.toggleTheme).toHaveBeenCalled();
  });

  it('shows dark_mode icon when isDarkMode() is true', () => {
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('button[mat-icon-button] mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('dark_mode');
  });

  it('shows light_mode icon when isDarkMode() is false', () => {
    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('button[mat-icon-button] mat-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('light_mode');
  });

  it('aria-label is "Switch to light mode" when isDarkMode() is true', () => {
    mockThemeService.isDarkMode.set(true);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Switch to light mode');
  });

  it('aria-label is "Switch to dark mode" when isDarkMode() is false', () => {
    mockThemeService.isDarkMode.set(false);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('button[mat-icon-button]') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  // --- Task 5.3: Loading state (Req 4) ---

  it('mat-progress-bar is present when loading() is true', () => {
    mockAuthFacade.loading.set(true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeTruthy();
  });

  it('mat-progress-bar is absent when loading() is false', () => {
    mockAuthFacade.loading.set(false);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector('mat-progress-bar');
    expect(progressBar).toBeFalsy();
  });

  it('submit button is disabled when loading() is true', () => {
    mockAuthFacade.loading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  // --- Task 5.4: Validation errors (Req 5) ---

  it('shows mat-error "Name is required" on empty name submit', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
    const nameError = Array.from(errors).find((el) => el.textContent?.includes('Name is required'));
    expect(nameError).toBeTruthy();
  });

  it('shows mat-error "Email is required" on empty email submit', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
    const emailError = Array.from(errors).find((el) => el.textContent?.includes('Email is required'));
    expect(emailError).toBeTruthy();
  });

  it('shows mat-error "Password is required" on empty password submit', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
    const passwordError = Array.from(errors).find((el) => el.textContent?.includes('Password is required'));
    expect(passwordError).toBeTruthy();
  });

  // --- Task 5.5: Removed components and OnPush (Req 6) ---

  it('does not render app-loading-indicator element', () => {
    const el = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(el).toBeFalsy();
  });

  it('does not render app-error-message element', () => {
    const el = fixture.nativeElement.querySelector('app-error-message');
    expect(el).toBeFalsy();
  });

  it('uses ChangeDetectionStrategy.OnPush', () => {
    expect((RegisterPageComponent as any).ɵcmp?.onPush).toBe(true);
  });

  // --- Task 5.6: Accessibility attributes (Req 7) ---

  it('name input has autocomplete="name"', () => {
    const input = fixture.nativeElement.querySelector('input[type="text"]') as HTMLInputElement;
    expect(input.getAttribute('autocomplete')).toBe('name');
  });

  it('email input has autocomplete="email"', () => {
    const input = fixture.nativeElement.querySelector('input[type="email"]') as HTMLInputElement;
    expect(input.getAttribute('autocomplete')).toBe('email');
  });

  it('password input has autocomplete="new-password"', () => {
    const input = fixture.nativeElement.querySelector('input[type="password"]') as HTMLInputElement;
    expect(input.getAttribute('autocomplete')).toBe('new-password');
  });

  it('form element has novalidate attribute', () => {
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    expect(form.hasAttribute('novalidate')).toBe(true);
  });

  // --- Task 6.1: Property 1 - Invalid email strings always trigger the email validation error ---
  // Validates: Requirements 5.3

  it('Property 1: invalid email strings always trigger the email validation error', () => {
    fc.assert(
      fc.property(fc.string(), (str) => {
        const ctrl = new FormControl(str, [Validators.email]);
        fc.pre(ctrl.invalid);

        component['registerForm'].controls.name.setValue('John');
        component['registerForm'].controls.email.setValue(str);
        component['registerForm'].controls.password.setValue('secret123');
        component['submitted'].set(false);

        const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
        form.dispatchEvent(new Event('submit'));
        fixture.detectChanges();

        const errors = fixture.nativeElement.querySelectorAll('mat-error') as NodeListOf<HTMLElement>;
        const emailError = Array.from(errors).find((el) =>
          el.textContent?.includes('Enter a valid email address')
        );
        expect(emailError).toBeTruthy();

        // Reset for next iteration
        component['submitted'].set(false);
        component['registerForm'].reset();
        fixture.detectChanges();
      }),
      { numRuns: 100 }
    );
  });

  // --- Task 6.2: Property 2 - Any non-null facade error string is rendered in the template ---
  // Validates: Requirements 5.5

  it('Property 2: any non-null facade error string is rendered in the template', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), (errorMsg) => {
        mockAuthFacade.error.set(errorMsg);
        fixture.detectChanges();

        const errorEl = fixture.nativeElement.querySelector('.register-error') as HTMLElement;
        expect(errorEl).toBeTruthy();
        expect(errorEl.textContent).toContain(errorMsg);

        // Reset for next iteration
        mockAuthFacade.error.set(null);
        fixture.detectChanges();
      }),
      { numRuns: 100 }
    );
  });
});

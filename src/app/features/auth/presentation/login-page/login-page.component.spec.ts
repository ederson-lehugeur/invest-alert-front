import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { LoginPageComponent } from './login-page.component';
import { AuthFacade } from '../../application/auth.facade';
import { LoginCommand } from '../../domain/interfaces/auth.repository';

interface MockAuthFacade {
  login: ReturnType<typeof vi.fn>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  isAuthenticated$: Observable<boolean>;
}

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let mockAuthFacade: MockAuthFacade;

  beforeEach(async () => {
    mockAuthFacade = {
      login: vi.fn(),
      loading: signal(false),
      error: signal<string | null>(null),
      isAuthenticated$: of(false),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render email and password fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input#email')).toBeTruthy();
    expect(compiled.querySelector('input#password')).toBeTruthy();
  });

  it('should show validation errors on empty submission', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = compiled.querySelectorAll('.form-field__error');
    expect(errors.length).toBe(2);
    expect(errors[0].textContent).toContain('Email is required');
    expect(errors[1].textContent).toContain('Password is required');
  });

  it('should disable submit button when loading', () => {
    mockAuthFacade.loading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should show loading indicator when loading', () => {
    mockAuthFacade.loading.set(true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should not show loading indicator when not loading', () => {
    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeFalsy();
  });

  it('should display API error via ErrorMessageComponent', () => {
    mockAuthFacade.error.set('Invalid credentials. Please try again.');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should call authFacade.login with correct data on valid submission', () => {
    component['loginForm'].controls.email.setValue('john@example.com');
    component['loginForm'].controls.password.setValue('secret123');

    const form = fixture.nativeElement.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockAuthFacade.login).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'secret123',
    });
  });

  it('should not call authFacade.login on invalid submission', () => {
    const form = fixture.nativeElement.querySelector('form')!;
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

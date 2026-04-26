import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WritableSignal, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { provideRouter } from '@angular/router';
import { RegisterPageComponent } from './register-page.component';
import { AuthFacade } from '../../application/auth.facade';
import { RegisterCommand } from '../../domain/interfaces/auth.repository';

interface MockAuthFacade {
  register: ReturnType<typeof vi.fn>;
  loading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
  isAuthenticated$: Observable<boolean>;
}

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;
  let mockAuthFacade: MockAuthFacade;

  beforeEach(async () => {
    mockAuthFacade = {
      register: vi.fn(),
      loading: signal(false),
      error: signal<string | null>(null),
      isAuthenticated$: of(false),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        { provide: AuthFacade, useValue: mockAuthFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render name, email, and password fields', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input#name')).toBeTruthy();
    expect(compiled.querySelector('input#email')).toBeTruthy();
    expect(compiled.querySelector('input#password')).toBeTruthy();
  });

  it('should show validation errors on empty submission', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const form = compiled.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = compiled.querySelectorAll('.form-field__error');
    expect(errors.length).toBe(3);
    expect(errors[0].textContent).toContain('Name is required');
    expect(errors[1].textContent).toContain('Email is required');
    expect(errors[2].textContent).toContain('Password is required');
  });

  it('should show email format validation error', () => {
    component['registerForm'].controls.name.setValue('John');
    component['registerForm'].controls.email.setValue('not-an-email');
    component['registerForm'].controls.password.setValue('secret');

    const form = fixture.nativeElement.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    const errors = fixture.nativeElement.querySelectorAll('.form-field__error');
    expect(errors.length).toBe(1);
    expect(errors[0].textContent).toContain('Please enter a valid email address');
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
    mockAuthFacade.error.set('Email already exists');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should call authFacade.register with correct data on valid submission', () => {
    component['registerForm'].controls.name.setValue('John Doe');
    component['registerForm'].controls.email.setValue('john@example.com');
    component['registerForm'].controls.password.setValue('secret123');

    const form = fixture.nativeElement.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockAuthFacade.register).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    });
  });

  it('should not call authFacade.register on invalid submission', () => {
    const form = fixture.nativeElement.querySelector('form')!;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(mockAuthFacade.register).not.toHaveBeenCalled();
  });

  it('should have a login link', () => {
    const link = fixture.nativeElement.querySelector('a[href="/auth/login"]');
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('Sign In');
  });
});

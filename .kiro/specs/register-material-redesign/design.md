# Design Document - register-material-redesign

## Overview

This feature migrates `RegisterPageComponent` from a custom HTML/CSS implementation to Angular Material M3, aligning it with the existing `LoginPageComponent` pattern already established in the project.

The scope is intentionally narrow: no business logic changes, no new routes, no new services. The work is purely a UI layer migration within `src/app/features/auth/presentation/register-page/`. The result must be visually and behaviorally identical to `LoginPageComponent`, extended with the three-field register form (name, email, password).

### Goals

- Replace custom HTML/CSS with Angular Material components (`mat-card`, `mat-form-field`, `mat-progress-bar`, `mat-flat-button`, `mat-icon-button`).
- Consume the global M3 theme (`--mat-sys-*` tokens) so dark/light toggle works automatically.
- Remove `LoadingIndicatorComponent` and `ErrorMessageComponent` from the component's imports.
- Preserve all existing business logic, `ChangeDetectionStrategy.OnPush`, and signal usage.

---

## Architecture

The migration touches only the **presentation layer**. No changes are required in the application, domain, or infrastructure layers.

```
Presentation (register-page)
  └── RegisterPageComponent          <- template + styles rewritten
        ├── AuthFacade               <- unchanged (loading, error signals, register())
        └── ThemeService             <- unchanged (isDarkMode(), toggleTheme())
```

The component continues to follow the same dependency direction: presentation -> application. No new dependencies are introduced.

---

## Components and Interfaces

### RegisterPageComponent (migrated)

**File:** `src/app/features/auth/presentation/register-page/register-page.component.ts`

Imports added:
- `MatCardModule`
- `MatFormFieldModule`
- `MatInputModule`
- `MatButtonModule`
- `MatIconModule`
- `MatProgressBarModule`

Imports removed:
- `LoadingIndicatorComponent`
- `ErrorMessageComponent`

New injection:
- `ThemeService` (same pattern as `LoginPageComponent`)

No changes to `registerForm`, `submitted` signal, or `onSubmit()` logic.

### Template structure

```
<div class="register-page">
  <mat-card class="register-card">
    <!-- theme toggle button (top-right, absolute) -->
    <button mat-icon-button class="register-theme-toggle" ...>
      <mat-icon>...</mat-icon>
    </button>

    <mat-card-content>
      <h1 class="mat-headline-medium">Create Account</h1>

      <!-- facade error -->
      @if (authFacade.error()) {
        <p class="register-error">{{ authFacade.error() }}</p>
      }

      <!-- loading indicator -->
      @if (authFacade.loading()) {
        <mat-progress-bar mode="indeterminate" />
      }

      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
        <!-- name field -->
        <mat-form-field appearance="outline" class="register-field">
          <mat-label>Name</mat-label>
          <input matInput type="text" formControlName="name" autocomplete="name" />
          @if (submitted() && registerForm.controls.name.hasError('required')) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <!-- email field -->
        <mat-form-field appearance="outline" class="register-field">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" autocomplete="email" />
          @if (submitted() && registerForm.controls.email.hasError('required')) {
            <mat-error>Email is required</mat-error>
          }
          @if (submitted() && !registerForm.controls.email.hasError('required') && registerForm.controls.email.hasError('email')) {
            <mat-error>Enter a valid email address</mat-error>
          }
        </mat-form-field>

        <!-- password field -->
        <mat-form-field appearance="outline" class="register-field">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password" />
          @if (submitted() && registerForm.controls.password.hasError('required')) {
            <mat-error>Password is required</mat-error>
          }
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit"
                class="register-submit" [disabled]="authFacade.loading()">
          Create Account
        </button>
      </form>

      <p class="register-footer">
        Already have an account? <a routerLink="/auth/login">Sign In</a>
      </p>
    </mat-card-content>
  </mat-card>
</div>
```

### Styles

The custom SCSS is replaced entirely. The new stylesheet mirrors `login-page.component.scss`:

```scss
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 1rem;
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
}

.register-card {
  position: relative;
  width: 100%;
  max-width: 420px;

  mat-card-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
  }
}

.register-field   { width: 100%; }
.register-submit  { width: 100%; }

.register-error {
  margin: 0;
  color: var(--mat-sys-error);
}

.register-footer {
  margin: 0;
  text-align: center;
}

.register-theme-toggle {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}
```

No hardcoded color values. All colors come from `--mat-sys-*` tokens provided by the global M3 theme.

---

## Data Models

No new data models. The component continues to use the existing `RegisterCommand` interface from the domain layer:

```typescript
interface RegisterCommand {
  name: string;
  email: string;
  password: string;
}
```

The reactive form shape is unchanged:

```typescript
registerForm = new FormGroup({
  name:     new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  email:    new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
  password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
});
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Most acceptance criteria in this feature are structural or binary-state checks best covered by example-based tests. Two criteria involve a genuinely large input space and are suitable for property-based testing.

### Property 1: Invalid email strings always trigger the email validation error

*For any* string that is not a valid email address (i.e., fails `Validators.email`), when the form is submitted with that string in the email field and the name and password fields are non-empty, the component SHALL display a `mat-error` containing `'Enter a valid email address'`.

**Validates: Requirements 5.3**

### Property 2: Any non-null facade error string is rendered in the template

*For any* non-empty string returned by `authFacade.error()`, the component SHALL render that exact string in the template with the `var(--mat-sys-error)` color class applied.

**Validates: Requirements 5.5**

---

## Error Handling

| Scenario | Handling |
|---|---|
| Facade error (API failure, conflict, etc.) | `authFacade.error()` signal is set; component renders the message in a `<p class="register-error">` using `--mat-sys-error` color |
| Form submitted while invalid | `submitted` signal set to `true`; `mat-error` elements become visible via `@if` guards; `onSubmit()` returns early without calling the facade |
| Submit while loading | Button is `[disabled]`; `onSubmit()` is not reachable via normal interaction |
| Theme toggle failure | `ThemeService.toggleTheme()` handles localStorage errors silently; no component-level error handling needed |

---

## Testing Strategy

### Approach

This feature uses a **dual testing approach**:

- **Example-based unit tests** for structural, binary-state, and specific interaction checks.
- **Property-based tests** for the two properties identified above, using [fast-check](https://github.com/dubzzz/fast-check) (already available in the Angular ecosystem via `@fast-check/vitest` or direct `fast-check` with Vitest).

### Example-based tests (unit)

Grouped by requirement:

**Req 1 - Material structure**
- Renders `mat-card` and `mat-card-content`
- Renders three `mat-form-field` elements with `appearance="outline"`
- All inputs have `matInput` directive
- Submit button has `mat-flat-button` directive

**Req 2 - Theme integration**
- Container has `background: var(--mat-sys-surface)` class/style applied

**Req 3 - Theme toggle**
- `ThemeService` is injected
- Theme toggle button is rendered
- Clicking the toggle button calls `themeService.toggleTheme()`
- Shows `dark_mode` icon when `isDarkMode()` is `true`
- Shows `light_mode` icon when `isDarkMode()` is `false`
- `aria-label` is `'Switch to light mode'` in dark mode
- `aria-label` is `'Switch to dark mode'` in light mode

**Req 4 - Loading state**
- `mat-progress-bar` is present when `loading()` is `true`
- `mat-progress-bar` is absent when `loading()` is `false`
- Submit button is `disabled` when `loading()` is `true`

**Req 5 - Validation errors (example cases)**
- Submitting with empty name shows `mat-error` `'Name is required'`
- Submitting with empty email shows `mat-error` `'Email is required'`
- Submitting with empty password shows `mat-error` `'Password is required'`

**Req 6 - Removed components**
- `LoadingIndicatorComponent` is not in the component's imports array
- `ErrorMessageComponent` is not in the component's imports array
- `ChangeDetectionStrategy.OnPush` is set

**Req 7 - Accessibility attributes**
- All three inputs have correct `autocomplete` attributes (`name`, `email`, `new-password`)
- Form element has `novalidate` attribute

### Property-based tests

Each property test runs a minimum of **100 iterations**.

**Property 1: Invalid email strings always trigger the email validation error**

```
Feature: register-material-redesign, Property 1: Invalid email strings always trigger the email validation error
```

- Use `fast-check` to generate arbitrary strings that do not match a valid email pattern.
- For each generated string: set it as the email field value, set valid values for name and password, submit the form.
- Assert: a `mat-error` with text `'Enter a valid email address'` is present in the DOM.

**Property 2: Any non-null facade error string is rendered**

```
Feature: register-material-redesign, Property 2: Any non-null facade error string is rendered in the template
```

- Use `fast-check` to generate arbitrary non-empty strings.
- For each generated string: set `authFacade.error()` signal to that string, trigger change detection.
- Assert: the generated string appears in the rendered template.

# Implementation Plan: register-material-redesign

## Overview

Migrate `RegisterPageComponent` from custom HTML/CSS to Angular Material M3, replicating the `LoginPageComponent` pattern. The scope is limited to the presentation layer: template, styles, and component imports. No business logic changes.

## Tasks

- [x] 1. Migrate RegisterPageComponent TypeScript file
  - Add Angular Material module imports: `MatCardModule`, `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatIconModule`, `MatProgressBarModule`
  - Remove `LoadingIndicatorComponent` and `ErrorMessageComponent` from the imports array
  - Inject `ThemeService` and expose it as `protected readonly themeService`
  - Keep `ChangeDetectionStrategy.OnPush`, `submitted` signal, `registerForm`, and `onSubmit()` unchanged
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.3, 3.1, 6.1, 6.2, 6.3_

- [x] 2. Rewrite RegisterPageComponent template
  - [x] 2.1 Replace root structure with `mat-card` and `mat-card-content`
    - Wrap content in `<div class="register-page">` > `<mat-card class="register-card">` > `<mat-card-content>`
    - Add `<h1 class="mat-headline-medium">Create Account</h1>` inside `mat-card-content`
    - _Requirements: 1.1, 7.1, 7.2_

  - [x] 2.2 Add theme toggle button inside `mat-card`
    - Render `<button mat-icon-button class="register-theme-toggle">` positioned absolutely at top-right
    - Bind `[attr.aria-label]` to `'Switch to light mode'` / `'Switch to dark mode'` based on `themeService.isDarkMode()`
    - Bind `(click)` to `themeService.toggleTheme()`
    - Render `<mat-icon>` with `dark_mode` / `light_mode` based on `themeService.isDarkMode()`
    - _Requirements: 3.2, 3.3, 3.4, 3.5_

  - [x] 2.3 Add facade error display and loading indicator
    - Replace `<app-error-message>` with `@if (authFacade.error()) { <p class="register-error">{{ authFacade.error() }}</p> }`
    - Replace `<app-loading-indicator>` with `@if (authFacade.loading()) { <mat-progress-bar mode="indeterminate" /> }`
    - _Requirements: 4.1, 4.2, 5.5, 6.1, 6.2_

  - [x] 2.4 Replace form fields with `mat-form-field` components
    - Wrap each input in `<mat-form-field appearance="outline" class="register-field">` with `<mat-label>` and `matInput` directive
    - Add `autocomplete` attributes: `name`, `email`, `new-password`
    - Keep `novalidate` on the `<form>` element
    - Replace `<span class="form-field__error">` with `<mat-error>` inside each `mat-form-field`
    - _Requirements: 1.2, 1.3, 5.1, 5.2, 5.3, 5.4, 7.4, 7.5_

  - [x] 2.5 Replace submit button with `mat-flat-button`
    - Change `<button type="submit">` to use `mat-flat-button` directive with `color="primary"` and `class="register-submit"`
    - Keep `[disabled]="authFacade.loading()"`
    - _Requirements: 1.4, 4.3_

- [x] 3. Rewrite RegisterPageComponent styles
  - Replace entire `register-page.component.scss` with Material token-based styles mirroring `login-page.component.scss`
  - Use `var(--mat-sys-surface)` and `var(--mat-sys-on-surface)` on the page container
  - Use `var(--mat-sys-error)` on `.register-error`
  - Remove all hardcoded color values (`#1976d2`, `#fff`, `#f5f5f5`, etc.)
  - Add `.register-theme-toggle` with `position: absolute; top: 0.5rem; right: 0.5rem`
  - _Requirements: 1.5, 2.1, 2.2, 7.1, 7.2, 7.3_

- [x] 4. Checkpoint - Verify the component renders correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Write example-based unit tests for RegisterPageComponent
  - [x] 5.1 Write unit tests for Material structure (Req 1)
    - Assert `mat-card` and `mat-card-content` are rendered
    - Assert three `mat-form-field` elements with `appearance="outline"` are present
    - Assert all inputs carry the `matInput` directive
    - Assert submit button has `mat-flat-button` directive
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [x] 5.2 Write unit tests for theme toggle (Req 3)
    - Assert `ThemeService` is injected
    - Assert theme toggle button is rendered
    - Assert clicking the button calls `themeService.toggleTheme()`
    - Assert `dark_mode` icon shown when `isDarkMode()` is `true`
    - Assert `light_mode` icon shown when `isDarkMode()` is `false`
    - Assert `aria-label` values for both modes
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.3 Write unit tests for loading state (Req 4)
    - Assert `mat-progress-bar` present when `loading()` is `true`
    - Assert `mat-progress-bar` absent when `loading()` is `false`
    - Assert submit button is `disabled` when `loading()` is `true`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 5.4 Write unit tests for validation errors (Req 5)
    - Assert `mat-error` `'Name is required'` on empty name submit
    - Assert `mat-error` `'Email is required'` on empty email submit
    - Assert `mat-error` `'Password is required'` on empty password submit
    - _Requirements: 5.1, 5.2, 5.4_

  - [x] 5.5 Write unit tests for removed components and OnPush (Req 6)
    - Assert `LoadingIndicatorComponent` is not in the imports array
    - Assert `ErrorMessageComponent` is not in the imports array
    - Assert `ChangeDetectionStrategy.OnPush` is set
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 5.6 Write unit tests for accessibility attributes (Req 7)
    - Assert `autocomplete="name"`, `autocomplete="email"`, `autocomplete="new-password"` on respective inputs
    - Assert `novalidate` attribute on the `<form>` element
    - _Requirements: 7.4, 7.5_

- [x] 6. Write property-based tests for RegisterPageComponent
  - [x] 6.1 Write property test for invalid email strings (Property 1)
    - **Property 1: Invalid email strings always trigger the email validation error**
    - Use `fast-check` to generate arbitrary strings that fail `Validators.email`
    - For each: set email field value, set valid name and password, submit the form
    - Assert `mat-error` with text `'Enter a valid email address'` is present in the DOM
    - Run minimum 100 iterations
    - **Validates: Requirements 5.3**

  - [x] 6.2 Write property test for facade error rendering (Property 2)
    - **Property 2: Any non-null facade error string is rendered in the template**
    - Use `fast-check` to generate arbitrary non-empty strings
    - For each: set `authFacade.error()` signal to that string, trigger change detection
    - Assert the generated string appears in the rendered template
    - Run minimum 100 iterations
    - **Validates: Requirements 5.5**

- [x] 7. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- All implementation is confined to `src/app/features/auth/presentation/register-page/`
- Reference `login-page.component.*` files as the visual and structural pattern to replicate
- Property tests use `fast-check` (already available in the project)

# Implementation Plan: Login Material Redesign

## Overview

Replace the custom HTML/CSS login form with Angular Material M3 components, wire in `ThemeService` for a dark/light toggle, and add the "InvestAlert" product name heading. All changes are scoped to `LoginPageComponent` - no routing, guards, `AuthFacade`, or `ThemeService` changes are required.

## Tasks

- [x] 1. Update LoginPageComponent class
  - Inject `ThemeService` as a `protected readonly` field alongside the existing `AuthFacade`
  - Add Angular Material imports to the component's `imports` array: `MatFormFieldModule`, `MatInputModule`, `MatButtonModule`, `MatIconModule`, `MatCardModule`, `MatProgressBarModule`
  - Remove `LoadingIndicatorComponent` and `ErrorMessageComponent` from imports
  - Keep `ReactiveFormsModule` and `RouterLink`
  - _Requirements: 1.5, 4.1, 4.2_

- [x] 2. Rewrite the login template
  - [x] 2.1 Add full-viewport centering container and `mat-card` wrapper
    - Replace `.login-page` / `.login-card` divs with a flex centering container and `<mat-card>`
    - Add `<mat-card-content>` to wrap all card body content
    - _Requirements: 2.1, 5.3_

  - [x] 2.2 Add "InvestAlert" product heading
    - Render `<h1 class="mat-headline-medium">InvestAlert</h1>` above the form inside the card
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 2.3 Add theme toggle button
    - Add `<button mat-icon-button>` after the register link (last in DOM order for correct tab order)
    - Bind `<mat-icon>` content to `themeService.isDarkMode() ? 'dark_mode' : 'light_mode'`
    - Bind `aria-label` to `"Switch to light mode"` when dark, `"Switch to dark mode"` when light
    - Bind `(click)` to `themeService.toggleTheme()`
    - Position visually at top-right of card via CSS without altering DOM order
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.5_

  - [x] 2.4 Replace email and password fields with `mat-form-field`
    - Wrap each input in `<mat-form-field appearance="outline">` with `<mat-label>`, `<input matInput>`, and `<mat-error>`
    - Set `autocomplete="email"` on email input and `autocomplete="current-password"` on password input
    - Show `<mat-error>` when `submitted()` is true and the control has the `required` error
    - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.2_

  - [x] 2.5 Replace submit button and add loading/error feedback
    - Replace plain `<button>` with `<button mat-flat-button color="primary">` bound to `[disabled]="authFacade.loading()"`
    - Add `<mat-progress-bar mode="indeterminate">` shown conditionally when `authFacade.loading()` is true
    - Add an error paragraph styled with `color: var(--mat-sys-error)` shown when `authFacade.error()` is non-null
    - _Requirements: 1.3, 5.4_

- [x] 3. Rewrite the component stylesheet
  - Remove all hardcoded hex colors, custom border styles, and custom button styles
  - Keep only layout rules: flexbox centering for the page container, `max-width` for the card, gap between form fields
  - Use `var(--mat-sys-surface)` and `var(--mat-sys-on-surface)` tokens where background or text color is needed on the container
  - Use spacing custom properties (`--spacing-*`) from `styles.scss` for margins and gaps
  - Position the theme toggle at the top-right of the card using CSS (e.g., `position: absolute` or flex `order`) without changing DOM order
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Write unit tests for LoginPageComponent
  - [x] 4.1 Set up the test bed
    - Configure `TestBed` with `provideAnimationsAsync()`, a mock `AuthFacade` (with `loading`, `error` signals and a `login` spy), and a mock `ThemeService` (with `isDarkMode` signal and `toggleTheme` spy)
    - _Requirements: 1.1, 1.2_

  - [x] 4.2 Write unit tests for Material form fields
    - Renders email `mat-form-field` with `matInput` - _Requirements: 1.1_
    - Renders password `mat-form-field` with `matInput` - _Requirements: 1.2_
    - Each `mat-form-field` has a `mat-label` - _Requirements: 5.1_
    - Email input has `autocomplete="email"` - _Requirements: 5.2_
    - Password input has `autocomplete="current-password"` - _Requirements: 5.2_
    - Shows `mat-error` for email when form submitted empty - _Requirements: 1.4_
    - Shows `mat-error` for password when form submitted empty - _Requirements: 1.4_

  - [x] 4.3 Write unit tests for submit button and loading state
    - Renders submit button with `mat-flat-button` and `color="primary"` - _Requirements: 1.3_
    - Submit button is disabled when `authFacade.loading()` is true - _Requirements: 5.4_

  - [x] 4.4 Write unit tests for product heading
    - Displays "InvestAlert" heading above the form - _Requirements: 3.1_
    - Heading has Material typography class `mat-headline-medium` - _Requirements: 3.2_

  - [x] 4.5 Write unit tests for theme toggle
    - Theme toggle button is present - _Requirements: 4.1_
    - Clicking theme toggle calls `ThemeService.toggleTheme()` - _Requirements: 4.1_
    - Shows `dark_mode` icon when `isDarkMode` is true - _Requirements: 4.2_
    - Shows `light_mode` icon when `isDarkMode` is false - _Requirements: 4.2_
    - `aria-label` is `"Switch to light mode"` when `isDarkMode` is true - _Requirements: 4.3_
    - `aria-label` is `"Switch to dark mode"` when `isDarkMode` is false - _Requirements: 4.3_

- [x] 5. Final checkpoint - Ensure all tests pass
  - Run `npx vitest --run` (or the project's test command) and confirm all tests pass. Ask the user if any questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The design has no Correctness Properties section - property-based tests are not applicable here
- All theme persistence and initialization logic remains in `ThemeService` and is not re-tested here
- Visual appearance, responsive layout, and tab order require manual or visual regression testing

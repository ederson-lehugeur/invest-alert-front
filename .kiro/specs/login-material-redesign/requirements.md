# Requirements Document

## Introduction

The login screen of InvestAlert currently uses plain HTML/CSS with hardcoded light-mode colors that are inconsistent with the rest of the application. The rest of the app uses Angular Material M3 with a violet/cyan palette, Inter typography, and a dark/light theme system driven by `ThemeService`. This feature redesigns the login screen to use Angular Material components, apply the same M3 theme already configured globally, display the product name "InvestAlert", and expose the same dark/light mode toggle available in the authenticated shell.

## Glossary

- **Login_Page**: The `LoginPageComponent` standalone component rendered at the `/auth/login` route.
- **ThemeService**: The existing `@Injectable` service that manages dark/light mode state via an Angular signal, persists the preference to `localStorage`, and applies the `light-theme` CSS class to `<html>`.
- **Material_Theme**: The Angular Material M3 theme defined in `styles.scss`, using the violet primary palette, cyan tertiary palette, and Inter typography, applied globally to all Material components.
- **Theme_Toggle**: An interactive control that calls `ThemeService.toggleTheme()` to switch between dark and light modes.
- **Form_Field**: An Angular Material `<mat-form-field>` wrapping an `<input matInput>` element.
- **Submit_Button**: The Angular Material `<button mat-flat-button>` that triggers form submission.

## Requirements

### Requirement 1: Apply Angular Material to the Login Page

**User Story:** As a developer, I want the login screen to use Angular Material components, so that the UI is consistent with the rest of the application and benefits from the Material design system.

#### Acceptance Criteria

1. THE Login_Page SHALL render the email input inside a `<mat-form-field>` with a `<input matInput>` element.
2. THE Login_Page SHALL render the password input inside a `<mat-form-field>` with a `<input matInput>` element.
3. THE Login_Page SHALL render the submit action as a `<button mat-flat-button>` with `color="primary"`.
4. THE Login_Page SHALL display inline validation errors using `<mat-error>` inside each `<mat-form-field>` when a required field is empty and the form has been submitted.
5. THE Login_Page SHALL import only the specific Angular Material modules it requires, without relying on a shared barrel module.

### Requirement 2: Replicate the Project Theme on the Login Page

**User Story:** As a user, I want the login screen to look visually consistent with the rest of InvestAlert, so that the experience feels cohesive from the moment I open the app.

#### Acceptance Criteria

1. THE Login_Page SHALL inherit the Material_Theme colors, typography, and density defined in `styles.scss` without declaring any local theme overrides.
2. THE Login_Page SHALL use Material design tokens (CSS custom properties emitted by the M3 theme) for all surface, background, and text colors instead of hardcoded hex values.
3. THE Login_Page SHALL use the `Inter` typeface for all visible text, consistent with the `brand-family` and `plain-family` values defined in the Material_Theme.
4. WHEN the active theme is dark, THE Login_Page SHALL display a dark surface background and light foreground text consistent with the dark Material_Theme.
5. WHEN the active theme is light, THE Login_Page SHALL display a light surface background and dark foreground text consistent with the light Material_Theme.

### Requirement 3: Display the Product Name

**User Story:** As a user, I want to see the product name "InvestAlert" on the login screen, so that I immediately know which application I am accessing.

#### Acceptance Criteria

1. THE Login_Page SHALL display the text "InvestAlert" as a visible heading above the sign-in form.
2. THE Login_Page SHALL render the product name using a Material typography style consistent with the Material_Theme headline scale.
3. THE Login_Page SHALL keep the product name visible on all supported viewport widths (320px and above).

### Requirement 4: Dark/Light Mode Toggle on the Login Page

**User Story:** As a user, I want to toggle between dark and light mode directly from the login screen, so that I can set my preferred theme before authenticating.

#### Acceptance Criteria

1. THE Login_Page SHALL render a Theme_Toggle button that calls `ThemeService.toggleTheme()` when activated.
2. THE Login_Page SHALL render the Theme_Toggle as a `<button mat-icon-button>` displaying a `<mat-icon>` that reflects the current mode: `dark_mode` when the active theme is dark, and `light_mode` when the active theme is light.
3. THE Login_Page SHALL set the `aria-label` attribute of the Theme_Toggle to `"Switch to light mode"` when the active theme is dark, and to `"Switch to dark mode"` when the active theme is light.
4. WHEN the user activates the Theme_Toggle, THE Login_Page SHALL update the visible theme immediately without a page reload.
5. WHEN the user activates the Theme_Toggle, THE ThemeService SHALL persist the selected theme to `localStorage` under the key `investalert-theme`.
6. WHEN the Login_Page is initialized, THE Login_Page SHALL reflect the theme previously persisted by ThemeService, defaulting to dark mode if no preference is stored.

### Requirement 5: Accessibility and Responsiveness

**User Story:** As a user, I want the login screen to be accessible and usable on any device, so that I can sign in regardless of my assistive technology or screen size.

#### Acceptance Criteria

1. THE Login_Page SHALL associate every `<mat-form-field>` with a visible `<mat-label>` so that screen readers announce the field purpose.
2. THE Login_Page SHALL set `autocomplete="email"` on the email input and `autocomplete="current-password"` on the password input.
3. THE Login_Page SHALL render the sign-in form in a centered card layout that is fully usable at viewport widths from 320px to 1920px.
4. WHEN the Submit_Button is disabled due to an in-progress authentication request, THE Login_Page SHALL set the `disabled` attribute on the Submit_Button so that keyboard and pointer interactions are blocked.
5. THE Login_Page SHALL maintain a logical tab order: product name (non-interactive), email field, password field, submit button, register link, theme toggle.

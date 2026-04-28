# Requirements Document

## Introduction

This document specifies the requirements for integrating Angular Material into the existing InvestAlert Angular 21 application and redesigning the investment alerts dashboard with a modern, elegant, and highly usable interface. The redesign transitions the current top-navbar layout to a sidebar-based navigation with Material Design components, dark mode support, skeleton loading, and improved data visualization - while preserving the existing clean architecture (presentation/application/domain/infrastructure layers), facade-based state management, and all current functionality.

The existing API provides paginated asset listing, filtered alert listing, full CRUD for rules, and rule group creation. There is no server-side sorting for assets, no asset search/filter endpoint, no trend data (up/down), and no summary/stats endpoint. The redesign must work within these API constraints, computing summary data client-side where feasible.

## Glossary

- **Application**: The InvestAlert Angular 21 single-page application with SSR
- **Angular_Material**: The official Angular UI component library implementing Material Design 3
- **Theme_Service**: An Angular service responsible for managing and persisting the active theme (dark or light)
- **Layout_Shell**: The root authenticated layout component containing the Sidebar, Topbar, and main content area
- **Sidebar**: A fixed side navigation panel listing primary navigation links (Dashboard, Assets, Rules, Alerts)
- **Topbar**: A horizontal bar at the top of the main content area displaying the application name and user actions
- **Dashboard_Page**: The landing page displaying summary cards and recent alerts
- **Assets_Page**: The page displaying the paginated assets table with client-side sorting
- **Alerts_Page**: The page displaying the filtered and paginated alerts table
- **Rules_Page**: The page displaying individual rules and rule groups with CRUD operations
- **Summary_Card**: A Material card widget displaying a single aggregated metric (e.g., total assets count)
- **Skeleton_Loader**: A placeholder UI element that mimics the shape of content while data is loading
- **Material_Module**: A shared Angular module that re-exports all required Angular Material components
- **Reusable_Card_Component**: A shared wrapper component around MatCard providing consistent styling and elevation
- **Reusable_Table_Component**: A shared wrapper component around MatTable providing consistent column configuration, pagination, and sorting
- **Confirm_Dialog**: A shared dialog component built with MatDialog for confirming destructive actions
- **Alert_Creation_Dialog**: A MatDialog-based form for creating a new alert rule directly from context
- **Filter_State**: The persisted state of user-applied filters stored in localStorage
- **SSR**: Server-Side Rendering via Angular's built-in SSR support

## Requirements

### Requirement 1: Angular Material Installation and Configuration

**User Story:** As a developer, I want Angular Material properly installed and configured in the project, so that all Material components are available and the application renders correctly in both browser and SSR environments.

#### Acceptance Criteria

1. THE Application SHALL include @angular/material and @angular/cdk as project dependencies
2. THE Application SHALL include a custom Angular Material theme configured with a dark color scheme as the default
3. THE Application SHALL include Angular Material typography styles applied globally
4. THE Application SHALL include the BrowserAnimationsModule (or provideAnimationsAsync) configured in the application providers
5. WHEN the Application is rendered via SSR, THE Application SHALL produce valid HTML without JavaScript errors related to Angular Material components
6. THE Application SHALL import the Material Icons font for use across all components

### Requirement 2: Theme and Design System

**User Story:** As a user, I want a consistent and visually appealing design system, so that the application feels professional and easy to navigate.

#### Acceptance Criteria

1. THE Application SHALL define a Material Design custom theme with a primary palette using blue-purple tones and a secondary palette using teal-green tones
2. THE Application SHALL use green (#2e7d32 range) to represent positive financial indicators and red (#c62828 range) to represent negative financial indicators across all relevant components
3. THE Application SHALL apply a consistent spacing system based on multiples of 8px across all components
4. THE Application SHALL apply elevation (box-shadow) levels consistently, using higher elevation for Summary_Card components and lower elevation for standard content areas
5. THE Application SHALL define a typographic hierarchy using Angular Material typography with distinct styles for headings (h1-h4), body text, and captions

### Requirement 3: Dark and Light Theme Toggle

**User Story:** As a user, I want to switch between dark and light themes, so that I can use the application comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Theme_Service SHALL default to dark mode when no user preference is stored
2. WHEN the user activates the theme toggle, THE Theme_Service SHALL switch the active theme between dark and light mode
3. THE Theme_Service SHALL persist the selected theme preference in localStorage
4. WHEN the Application loads, THE Theme_Service SHALL restore the previously selected theme from localStorage
5. WHEN the theme changes, THE Application SHALL update all component colors, backgrounds, and surfaces without requiring a page reload
6. IF the Application is rendered via SSR and localStorage is unavailable, THEN THE Theme_Service SHALL use dark mode as the default without producing errors

### Requirement 4: Sidebar Navigation Layout

**User Story:** As a user, I want a fixed sidebar for navigation, so that I can quickly access different sections of the application.

#### Acceptance Criteria

1. THE Layout_Shell SHALL display a fixed Sidebar on the left side using MatSidenav with navigation links for Dashboard, Assets, Rules, and Alerts
2. THE Sidebar SHALL display a Material icon and label for each navigation link
3. THE Sidebar SHALL visually highlight the currently active navigation link
4. THE Layout_Shell SHALL display a Topbar at the top of the main content area using MatToolbar, showing the application name and a logout button
5. THE Topbar SHALL include the theme toggle control
6. WHEN the viewport width is less than 768px, THE Sidebar SHALL collapse into an overlay mode that can be toggled via a menu button in the Topbar
7. WHEN the user selects a navigation link on a mobile viewport, THE Sidebar SHALL close automatically

### Requirement 5: Dashboard Page with Summary Cards

**User Story:** As a user, I want to see a summary overview on the dashboard, so that I can quickly understand the current state of my investments and alerts.

#### Acceptance Criteria

1. THE Dashboard_Page SHALL display Summary_Card components showing: total number of assets (derived from the first page totalElements), count of pending alerts, and count of sent alerts
2. EACH Summary_Card SHALL use MatCard with elevated styling and display an icon, a label, and the numeric value
3. WHILE the summary data is loading, THE Dashboard_Page SHALL display Skeleton_Loader placeholders in place of each Summary_Card
4. THE Dashboard_Page SHALL display a "Recent Alerts" section showing the 5 most recent alerts in a MatList or compact MatTable
5. IF the API returns an error while loading summary data, THEN THE Dashboard_Page SHALL display an error message using MatSnackBar

### Requirement 6: Assets Table with Material Components

**User Story:** As a user, I want to view my monitored assets in a well-structured table with sorting and pagination, so that I can efficiently browse and analyze asset data.

#### Acceptance Criteria

1. THE Assets_Page SHALL display assets in a MatTable with columns: Ticker, Name, Price, Dividend Yield, P/VP, and Updated At
2. THE Assets_Page SHALL use MatPaginator for server-side pagination, sending page and size parameters to the API
3. THE Assets_Page SHALL use MatSort for client-side sorting on all numeric columns (Price, Dividend Yield, P/VP) within the current page of data
4. WHILE assets data is loading, THE Assets_Page SHALL display Skeleton_Loader rows mimicking the table structure
5. WHEN the assets data set is empty, THE Assets_Page SHALL display a well-defined empty state with an icon and descriptive message
6. WHEN the user clicks a table row, THE Assets_Page SHALL navigate to the asset detail view for the selected ticker
7. EACH table row SHALL be keyboard-navigable and have an appropriate aria-label for the asset ticker

### Requirement 7: Alerts Table with Filters

**User Story:** As a user, I want to view and filter my alerts, so that I can quickly find specific alerts by ticker or status.

#### Acceptance Criteria

1. THE Alerts_Page SHALL display alerts in a MatTable with columns: Ticker, Status, Details, Created At, and Sent At
2. THE Alerts_Page SHALL provide a MatFormField with MatInput for filtering by ticker and a MatSelect for filtering by status (All, PENDING, SENT)
3. WHEN the user changes a filter value, THE Alerts_Page SHALL reload the alerts from the API with the updated filter parameters
4. THE Alerts_Page SHALL use MatPaginator for server-side pagination
5. THE Alerts_Page SHALL persist the current filter values in localStorage using the Filter_State mechanism
6. WHEN the Alerts_Page loads, THE Alerts_Page SHALL restore previously persisted filter values from localStorage and apply them
7. WHILE alerts data is loading, THE Alerts_Page SHALL display Skeleton_Loader rows mimicking the table structure
8. WHEN the alerts data set is empty after filtering, THE Alerts_Page SHALL display an empty state message indicating no alerts match the current filters
9. THE Alerts_Page SHALL display the alert status using a MatChip with green color for SENT and amber color for PENDING

### Requirement 8: Rules Management with Material Components

**User Story:** As a user, I want to manage my alert rules using a modern interface, so that I can create, edit, and delete rules efficiently.

#### Acceptance Criteria

1. THE Rules_Page SHALL display individual rules in a MatTable with columns: Ticker, Field, Operator, Target Value, Active, and Actions
2. THE Rules_Page SHALL display rule groups in a separate MatTable with columns: Name, Ticker, and Rules Count
3. WHEN the user clicks "Create Rule", THE Rules_Page SHALL open the Alert_Creation_Dialog with a form using MatFormField, MatInput, and MatSelect components
4. WHEN the user clicks "Edit" on a non-triggered rule, THE Rules_Page SHALL open the Alert_Creation_Dialog pre-populated with the rule data
5. WHEN the user clicks "Delete" on a non-triggered rule, THE Rules_Page SHALL open the Confirm_Dialog requesting confirmation before proceeding
6. WHEN a rule is successfully created, updated, or deleted, THE Rules_Page SHALL display a success notification using MatSnackBar
7. IF a rule operation fails, THEN THE Rules_Page SHALL display an error notification using MatSnackBar

### Requirement 9: Alert Creation Dialog

**User Story:** As a user, I want to create alert rules through a dialog, so that I can quickly set up monitoring without leaving my current context.

#### Acceptance Criteria

1. THE Alert_Creation_Dialog SHALL use MatDialog to present a form with fields: Ticker (MatInput), Field (MatSelect with options PRICE, DIVIDEND_YIELD, P_VP), Operator (MatSelect), Target Value (MatInput type number), and optional Rule Group (MatSelect)
2. THE Alert_Creation_Dialog SHALL validate all required fields and display inline validation errors using MatError
3. WHEN the user submits a valid form, THE Alert_Creation_Dialog SHALL call the rules facade to create the rule and close the dialog on success
4. WHEN the user clicks "Cancel", THE Alert_Creation_Dialog SHALL close without making changes
5. WHILE the creation request is in progress, THE Alert_Creation_Dialog SHALL disable the submit button and display a MatProgressSpinner

### Requirement 10: Shared Material Module and Reusable Components

**User Story:** As a developer, I want shared Material components and a centralized module, so that I can maintain consistency and avoid direct Angular Material coupling in domain components.

#### Acceptance Criteria

1. THE Material_Module SHALL re-export all Angular Material modules used across the application (MatToolbar, MatSidenav, MatCard, MatTable, MatPaginator, MatSort, MatFormField, MatInput, MatSelect, MatSnackBar, MatDialog, MatIcon, MatChip, MatList, MatProgressSpinner, MatButton)
2. THE Reusable_Card_Component SHALL accept title, icon, and content projection inputs and render a consistently styled MatCard
3. THE Reusable_Table_Component SHALL accept a column configuration, data source, and optional sort/pagination settings, rendering a MatTable with MatSort and MatPaginator
4. THE Confirm_Dialog SHALL be refactored to use MatDialog instead of the current custom overlay implementation
5. THE Skeleton_Loader SHALL be implemented as a reusable component that accepts a variant input (card, table-row, text) to render appropriate placeholder shapes

### Requirement 11: Visual Feedback and Loading States

**User Story:** As a user, I want clear visual feedback for all actions, so that I know when operations are in progress, succeed, or fail.

#### Acceptance Criteria

1. WHEN an API request is in progress, THE Application SHALL display appropriate loading indicators (Skeleton_Loader for initial loads, MatProgressSpinner for actions)
2. WHEN an API request succeeds for a mutation (create, update, delete), THE Application SHALL display a success message via MatSnackBar with a duration of 3 seconds
3. WHEN an API request fails, THE Application SHALL display an error message via MatSnackBar with a duration of 5 seconds and a "Dismiss" action
4. WHILE a form submission is in progress, THE Application SHALL disable the submit button to prevent duplicate submissions

### Requirement 12: Responsiveness

**User Story:** As a user, I want the application to work well on different screen sizes, so that I can use it on desktop, tablet, and mobile devices.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE Sidebar SHALL switch to overlay mode and be hidden by default
2. WHEN the viewport width is less than 768px, THE MatTable components SHALL enable horizontal scrolling for tables that exceed the viewport width
3. THE Summary_Card components on the Dashboard_Page SHALL use a responsive grid that displays 3 columns on desktop, 2 on tablet, and 1 on mobile
4. THE Application SHALL maintain readable font sizes and adequate touch targets (minimum 44x44px) on mobile viewports

### Requirement 13: Performance Optimization

**User Story:** As a developer, I want the application to load and render efficiently, so that users have a fast experience.

#### Acceptance Criteria

1. THE Application SHALL import only the Angular Material modules that are actively used by each feature, avoiding importing the entire library
2. THE Application SHALL use lazy loading for all feature routes (Dashboard, Assets, Rules, Alerts) as already configured in app.routes.ts
3. THE Application SHALL use OnPush change detection strategy on all components
4. THE Application SHALL use trackBy functions in all template iterations to minimize DOM re-renders
5. WHEN rendered via SSR, THE Application SHALL produce a complete initial HTML response that does not require JavaScript to display the layout structure

### Requirement 14: Accessibility

**User Story:** As a user with accessibility needs, I want the application to be navigable and understandable using assistive technologies, so that I can use all features effectively.

#### Acceptance Criteria

1. THE Application SHALL maintain a minimum contrast ratio of 4.5:1 for normal text and 3:1 for large text in both dark and light themes
2. THE Application SHALL support full keyboard navigation for all interactive elements including Sidebar links, table rows, dialog controls, and form fields
3. THE Application SHALL provide aria-label attributes on all icon-only buttons and interactive elements that lack visible text labels
4. THE Sidebar SHALL use appropriate ARIA landmark roles (navigation) and the main content area SHALL use the main landmark role
5. WHEN a MatDialog opens, THE Application SHALL trap focus within the dialog and return focus to the triggering element when the dialog closes

### Requirement 15: Animations and Microinteractions

**User Story:** As a user, I want subtle animations and transitions, so that the interface feels polished and responsive to my actions.

#### Acceptance Criteria

1. THE Application SHALL enable Angular Material's animation system via provideAnimationsAsync for SSR compatibility
2. WHEN the Sidebar opens or closes on mobile, THE Sidebar SHALL animate with a slide transition
3. WHEN the user hovers over a MatCard or table row, THE Application SHALL apply a subtle elevation or background transition
4. WHEN route navigation occurs, THE Application SHALL apply a fade-in transition to the incoming page content
5. THE Application SHALL keep all custom animations under 300ms duration to maintain perceived performance


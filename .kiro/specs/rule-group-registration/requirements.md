# Requirements Document

## Introduction

The Rules screen in the `invest-alert-front` Angular application currently provides a "Create Rule" button in the Individual Rules section header that opens a Material dialog for registering individual alert rules. After migrating to Angular Material, the ability to register Rule Groups from the Rules screen was lost. This feature restores that capability by adding a "Create Rule Group" button to the Rule Groups section header, following the same visual and interaction pattern as the existing "Create Rule" button. Additionally, the Individual Rules table gains a column indicating which Rule Group each rule belongs to, giving users immediate grouping context. The button opens a Material dialog wrapping the existing `RuleGroupFormComponent`, submits the form data through the `RulesFacade`, and provides success/error feedback via the `NotificationService`.

## Glossary

- **Rules_Screen**: The Angular component `RulesPageComponent` rendered at the rules route, displaying individual rules and rule groups in two separate table sections.
- **Individual_Rules_Table**: The table section within the Rules_Screen that lists individual alert rules, headed by the "Create Rule" button.
- **Rule_Groups_Table**: The table section within the Rules_Screen that lists rule groups, headed by the "Create Rule Group" button.
- **Rule_Group**: A named collection of alert rules associated with a single ticker symbol, persisted via `POST /api/v1/rule-groups`.
- **Rule_Group_Dialog**: An Angular Material `MatDialog` instance that hosts the `RuleGroupFormComponent` for creating a new Rule Group.
- **RuleGroupFormComponent**: The existing standalone Angular component (`app-rule-group-form`) that renders a reactive form for entering Rule Group data (ticker, name, and one or more rules).
- **RulesFacade**: The application-layer service (`RulesFacade`) that orchestrates state and delegates API calls for both rules and rule groups.
- **NotificationService**: The core service responsible for displaying success and error snack-bar notifications to the user.
- **CreateRuleGroupCommand**: The domain interface `{ ticker, name, rules[] }` passed to `RulesFacade.createRuleGroup()`.
- **RuleGroupFormData**: The output type emitted by `RuleGroupFormComponent` on valid form submission, structurally equivalent to `CreateRuleGroupCommand`.

---

## Requirements

### Requirement 1: Create Rule Group Button

**User Story:** As a user on the Rules screen, I want a "Create Rule Group" button in the Rule Groups section header, so that I can initiate the registration of a new Rule Group without leaving the screen.

#### Acceptance Criteria

1. THE Rules_Screen SHALL display a "Create Rule Group" button in the Rule Groups section header, following the same placement principle as the "Create Rule" button which resides in the Individual Rules section header.
2. THE Rules_Screen SHALL style the "Create Rule Group" button using `mat-flat-button` with `color="primary"` and a leading `mat-icon` with the value `add`, consistent with the "Create Rule" button.
3. THE Rules_Screen SHALL set `aria-label="Create new rule group"` on the "Create Rule Group" button to satisfy accessibility requirements.

---

### Requirement 2: Rule Group Registration Dialog

**User Story:** As a user, I want a dialog to open when I click "Create Rule Group", so that I can fill in the Rule Group details (ticker, name, and rules) in a focused modal context.

#### Acceptance Criteria

1. WHEN the user clicks the "Create Rule Group" button, THE Rules_Screen SHALL open a `MatDialog` containing the `RuleGroupFormComponent`.
2. THE Rule_Group_Dialog SHALL have a fixed width of `560px`.
3. WHEN the user submits the `RuleGroupFormComponent` with valid data, THE Rule_Group_Dialog SHALL close and return the `RuleGroupFormData` to the caller.
4. WHEN the user cancels or dismisses the `RuleGroupFormComponent`, THE Rule_Group_Dialog SHALL close and return no data.

---

### Requirement 3: Rule Group Persistence

**User Story:** As a user, I want the submitted Rule Group data to be saved via the API, so that the new group appears in the Rule Groups table immediately after creation.

#### Acceptance Criteria

1. WHEN the Rule_Group_Dialog closes with valid `RuleGroupFormData`, THE Rules_Screen SHALL invoke `RulesFacade.createRuleGroup()` with a `CreateRuleGroupCommand` derived from the dialog result.
2. WHEN `RulesFacade.createRuleGroup()` completes without error, THE Rules_Screen SHALL display a success notification with the message "Rule group created successfully." via `NotificationService`.
3. WHEN `RulesFacade.createRuleGroup()` results in an error, THE Rules_Screen SHALL display an error notification with the error message via `NotificationService`.
4. WHEN `RulesFacade.createRuleGroup()` completes without error, THE Rules_Screen SHALL reflect the newly created Rule Group in the Rule Groups table without requiring a full page reload.

---

### Requirement 4: Form Validation

**User Story:** As a user, I want the Rule Group form to prevent submission of incomplete data, so that I do not accidentally create invalid Rule Groups.

#### Acceptance Criteria

1. THE RuleGroupFormComponent SHALL require a non-empty value for the `ticker` field before allowing form submission.
2. THE RuleGroupFormComponent SHALL require a non-empty value for the `name` field before allowing form submission.
3. THE RuleGroupFormComponent SHALL require at least one rule entry in the rules `FormArray`.
4. THE RuleGroupFormComponent SHALL require a non-null `targetValue` for each rule entry before allowing form submission.
5. WHEN the user attempts to submit the form with one or more invalid fields, THE RuleGroupFormComponent SHALL mark all controls as touched and display inline validation error messages.
6. IF the rules `FormArray` contains only one entry, THEN THE RuleGroupFormComponent SHALL disable the "Remove" button for that entry to prevent an empty rules list.

---

### Requirement 5: Consistent Visual Style

**User Story:** As a user, I want the Rule Group registration flow to look and behave consistently with the Rule registration flow, so that the interface feels cohesive.

#### Acceptance Criteria

1. THE Rule_Group_Dialog SHALL use Angular Material components (`MatDialogTitle`, `MatDialogContent`, `MatDialogActions`) for its layout, consistent with the `AlertCreationDialogComponent` pattern.
2. THE RuleGroupFormComponent SHALL be wrapped inside a dedicated `RuleGroupCreationDialogComponent` that handles `MAT_DIALOG_DATA` injection and `MatDialogRef` interaction, following the same structural pattern as `AlertCreationDialogComponent`.
3. THE Rules_Screen SHALL position the "Create Rule Group" button in the Rule Groups section header, mirroring the placement of the "Create Rule" button in the Individual Rules section header.

---

### Requirement 6: Rule Group Membership Indicator in Individual Rules Table

**User Story:** As a user viewing the Individual Rules table, I want to see which rule group each rule belongs to, so that I can understand the grouping context of each individual rule at a glance.

#### Acceptance Criteria

1. THE Rules_Screen SHALL display a "Rule Group" column in the Individual Rules table for every rule row.
2. WHEN a rule is associated with a Rule_Group, THE Rules_Screen SHALL display the name of that Rule_Group in the "Rule Group" column for that rule's row.
3. WHEN a rule is not associated with any Rule_Group, THE Rules_Screen SHALL display a dash (`-`) in the "Rule Group" column for that rule's row.
4. THE Rules_Screen SHALL render the "Rule Group" column value as plain text, without interactive controls.

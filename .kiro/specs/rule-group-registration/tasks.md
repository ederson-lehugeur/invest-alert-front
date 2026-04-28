# Implementation Plan: rule-group-registration

## Overview

All infrastructure and application logic already exists. The work is entirely in the presentation layer:
create `RuleGroupCreationDialogComponent` (thin dialog wrapper mirroring `AlertCreationDialogComponent`),
update `RulesPageComponent` to add the "Create Rule Group" button and the "Rule Group" column in the
Individual Rules table, and write unit and property-based tests for the new and modified components.

## Tasks

- [x] 1. Create `RuleGroupCreationDialogComponent`
  - Create directory `src/app/features/rules/presentation/rule-group-creation-dialog/`
  - Create `rule-group-creation-dialog.component.ts` as a standalone `OnPush` component that:
    - Injects `MatDialogRef<RuleGroupCreationDialogComponent>`
    - Exposes `onFormSubmit(data: RuleGroupFormData): void` that calls `dialogRef.close(data)`
    - Exposes `onFormCancel(): void` that calls `dialogRef.close()` (no argument)
    - Imports `MaterialModule` and `RuleGroupFormComponent`
  - Create `rule-group-creation-dialog.component.html` with:
    - `<h2 mat-dialog-title>Create Rule Group</h2>`
    - `<mat-dialog-content>` wrapping `<app-rule-group-form (formSubmit)="onFormSubmit($event)" (formCancel)="onFormCancel()" />`
  - Create `rule-group-creation-dialog.component.scss` (empty or minimal)
  - _Requirements: 2.1, 2.3, 2.4, 5.1, 5.2_

- [x] 2. Write unit tests for `RuleGroupCreationDialogComponent`
  - [x] 2.1 Write unit tests in `rule-group-creation-dialog.component.spec.ts`
    - Renders `app-rule-group-form` inside `mat-dialog-content`
    - Template contains `mat-dialog-title` with text "Create Rule Group"
    - `onFormSubmit(data)` calls `dialogRef.close(data)` with the exact data passed
    - `onFormCancel()` calls `dialogRef.close()` with no argument
    - _Requirements: 2.3, 2.4, 5.1, 5.2_

  - [x] 2.2 Write property test for `RuleGroupCreationDialogComponent` - Property 4: Dialog closes with submitted data for any valid form input
    - Create `rule-group-creation-dialog.component.property.spec.ts`
    - **Property 4: Dialog closes with submitted data for any valid form input**
    - For any valid `RuleGroupFormData` (non-empty ticker, non-empty name, at least one rule with non-null targetValue), `onFormSubmit(data)` closes the dialog with that exact data
    - Use `fc.record` to generate arbitrary valid `RuleGroupFormData` values
    - Also assert that `onFormCancel()` always calls `dialogRef.close()` with no argument regardless of prior state
    - **Validates: Requirements 2.3, 2.4**

- [x] 3. Update `RulesPageComponent` - add "Create Rule Group" button and dialog method
  - In `rules-page.component.ts`:
    - Import `RuleGroupCreationDialogComponent`
    - Add `openCreateRuleGroupDialog()` method that opens `RuleGroupCreationDialogComponent` with `width: '560px'`, and on `afterClosed()` calls `this.facade.createRuleGroup(result)` and `this.watchNextError('Rule group created successfully.')` when result is defined
  - In `rules-page.component.html`:
    - Add a section header row to the Rule Groups section containing a "Create Rule Group" button with `mat-flat-button`, `color="primary"`, `(click)="openCreateRuleGroupDialog()"`, `aria-label="Create new rule group"`, and a leading `<mat-icon>add</mat-icon>`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 3.4, 5.3_

- [x] 4. Update `RulesPageComponent` - add "Rule Group" column to Individual Rules table
  - In `rules-page.component.ts`:
    - Add `groupName: string` field to the `RuleRow` interface
    - Add `{ key: 'groupName', header: 'Rule Group' }` to `rulesColumns` (between `targetValue` and `active`)
    - Add private `resolveGroupName(groupId: number | null): string` helper that returns the matching group's `name` from `currentRuleGroups`, or `'-'` if `groupId` is null or no match is found
    - Update the `rules$` subscription mapping to include `groupName: this.resolveGroupName(r.groupId)`
    - Update the `ruleGroups$` subscription to re-map `rulesData` after updating `currentRuleGroups`, so group names stay in sync when groups load after rules
  - The `groupName` column renders as plain text via the default `ReusableTableComponent` cell (no custom `appCellDef` template needed)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Write unit tests for `RulesPageComponent` additions
  - [x] 6.1 Add unit tests to `rules-page.component.spec.ts` for the new button and dialog flow
    - Renders "Create Rule Group" button with `aria-label="Create new rule group"`
    - `openCreateRuleGroupDialog()` opens `RuleGroupCreationDialogComponent` with `width: '560px'`
    - Calls `facade.createRuleGroup()` with the dialog result when dialog closes with data
    - Does not call `facade.createRuleGroup()` when dialog is cancelled (result is undefined/null)
    - Shows success notification "Rule group created successfully." when `error$` emits null after the call
    - Shows error notification with the error string when `error$` emits a non-null value
    - `rulesColumns` contains an entry with `key: 'groupName'` and `header: 'Rule Group'`
    - _Requirements: 1.1, 1.3, 2.1, 2.2, 3.1, 3.2, 3.3, 6.1_

  - [x] 6.2 Add unit tests to `rules-page.component.spec.ts` for `resolveGroupName`
    - Rule row displays the group name when `groupId` matches a loaded group
    - Rule row displays `'-'` when `groupId` is null
    - Rule row displays `'-'` when `groupId` does not match any loaded group
    - _Requirements: 6.2, 6.3_

- [x] 7. Write property-based tests for `RulesPageComponent` additions
  - [x] 7.1 Write property test - Property 5: Facade is called with dialog result for any valid form data
    - Add to `rules-page.component.property.spec.ts` (new file or extend existing preservation spec)
    - **Property 5: Facade is called with dialog result for any valid form data**
    - For any valid `RuleGroupFormData` returned by the mocked dialog, `facade.createRuleGroup()` is called with a `CreateRuleGroupCommand` whose `ticker`, `name`, and `rules` fields are identical to the dialog result
    - Use `fc.record` to generate arbitrary valid `RuleGroupFormData` values
    - **Validates: Requirements 3.1**

  - [x] 7.2 Write property test - Property 6: Error notifications forward any error message
    - **Property 6: Error notifications forward any error message**
    - For any non-null error string emitted by `facade.error$` after a `createRuleGroup` call, `NotificationService.showError()` is called with that exact string
    - Use `fc.string({ minLength: 1 })` to generate arbitrary error messages
    - **Validates: Requirements 3.3**

  - [x] 7.3 Write property test - Property 7: Rule Group column displays correct value for any rule
    - **Property 7: Rule Group column displays correct value for any rule**
    - For any rule with a `groupId` matching a group in `currentRuleGroups`, `resolveGroupName()` returns the group's `name`; for any rule with `groupId: null` or an unmatched id, it returns `'-'`
    - Test `resolveGroupName` directly by calling the private method via `component['resolveGroupName']`
    - Use `fc.array` and `fc.record` to generate arbitrary groups and rule groupId values
    - **Validates: Requirements 6.2, 6.3**

- [x] 8. Write property-based tests for `RuleGroupFormComponent`
  - [x] 8.1 Write property test - Property 1: Form validity matches all-required-fields predicate
    - Create `rule-group-form.component.property.spec.ts`
    - **Property 1: Rule group form is valid iff all required fields are non-empty**
    - Build the form directly with `FormBuilder` (no TestBed) for performance, mirroring the pattern in `alert-creation-dialog.component.property.spec.ts`
    - For any combination of ticker (empty or non-empty), name (empty or non-empty), and rule entries (with null or non-null targetValue), form validity equals the predicate: ticker non-empty AND name non-empty AND every rule's targetValue non-null
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [x] 8.2 Write property test - Property 2: Rules array length invariant
    - **Property 2: Rules array length invariant**
    - For any sequence of `addRule()` and `removeRule(index)` calls on `RuleGroupFormComponent`, `rulesArray.length` is always >= 1
    - Use `fc.array(fc.oneof(fc.constant('add'), fc.integer({ min: 0, max: 9 }).map(i => ({ remove: i }))))` to generate operation sequences
    - **Validates: Requirements 4.3, 4.6**

  - [x] 8.3 Write property test - Property 3: Invalid submit marks all controls as touched without emitting
    - **Property 3: Invalid submit marks all controls as touched**
    - For any invalid form state (empty ticker, empty name, or null targetValue in any rule), calling `onSubmit()` marks all form controls as touched and does not emit `formSubmit`
    - **Validates: Requirements 4.5**

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- `RuleGroupFormComponent`, `RulesFacade`, and `RuleGroupsApiService` require no changes
- Property tests use `fast-check` following the existing `.property.spec.ts` convention in the project
- The `resolveGroupName` helper must be called in both the `rules$` and `ruleGroups$` subscriptions so the "Rule Group" column stays accurate when either stream updates

# Design Document: rule-group-registration

## Overview

This feature restores the ability to register Rule Groups from the Rules screen in the `invest-alert-front` Angular application. It adds a "Create Rule Group" button to the Rule Groups section header, following the exact same visual and interaction pattern as the existing "Create Rule" button. Clicking the button opens a `MatDialog` wrapping the existing `RuleGroupFormComponent` inside a new `RuleGroupCreationDialogComponent`. On submission, the form data is forwarded to `RulesFacade.createRuleGroup()`, and success/error feedback is delivered via `NotificationService`. Additionally, the Individual Rules table gains a "Rule Group" column that shows the group name for associated rules or a dash for unassociated ones.

No new layers, services, or API endpoints are required. All infrastructure (`RuleGroupsApiService`, `RuleGroupRepository`, `CreateRuleGroupCommand`) and application logic (`RulesFacade.createRuleGroup()`) already exist. The work is entirely in the presentation layer.

---

## Architecture

The feature follows the existing Clean Architecture layering:

```
Presentation  →  Application  →  Infrastructure  →  API
RulesPageComponent
RuleGroupCreationDialogComponent   →  RulesFacade  →  RuleGroupsApiService  →  POST /api/v1/rule-groups
RuleGroupFormComponent (existing)
```

Dependency direction is preserved: the new dialog component depends only on `MatDialogRef`, `MAT_DIALOG_DATA`, and `RuleGroupFormComponent`. `RulesPageComponent` depends on `RulesFacade` and `MatDialog`, as it already does.

```mermaid
flowchart TD
    User -->|clicks "Create Rule Group"| RulesPageComponent
    RulesPageComponent -->|dialog.open| RuleGroupCreationDialogComponent
    RuleGroupCreationDialogComponent -->|hosts| RuleGroupFormComponent
    RuleGroupFormComponent -->|formSubmit event| RuleGroupCreationDialogComponent
    RuleGroupCreationDialogComponent -->|dialogRef.close(data)| RulesPageComponent
    RulesPageComponent -->|createRuleGroup(command)| RulesFacade
    RulesFacade -->|create(command)| RuleGroupsApiService
    RuleGroupsApiService -->|POST /api/v1/rule-groups| API
    RulesFacade -->|ruleGroups$ update| RulesPageComponent
    RulesPageComponent -->|showSuccess / showError| NotificationService
```

---

## Components and Interfaces

### New: `RuleGroupCreationDialogComponent`

**Path:** `src/app/features/rules/presentation/rule-group-creation-dialog/`

This is a thin dialog wrapper, mirroring `AlertCreationDialogComponent` in structure. It:

- Injects `MatDialogRef<RuleGroupCreationDialogComponent>` and `MAT_DIALOG_DATA` (no data needed for creation, so the injection token is typed as `void` or omitted).
- Renders `<app-rule-group-form>` inside `MatDialogContent`.
- Listens to `(formSubmit)` on `RuleGroupFormComponent` and calls `dialogRef.close(data)`.
- Listens to `(formCancel)` and calls `dialogRef.close()` (no argument, so `afterClosed()` emits `undefined`).
- Uses `MatDialogTitle`, `MatDialogContent`, and `MatDialogActions` for layout.
- Is a standalone component importing `MaterialModule` and `RuleGroupFormComponent`.
- Uses `ChangeDetectionStrategy.OnPush`.

```typescript
// Sketch - not final implementation
@Component({
  selector: 'app-rule-group-creation-dialog',
  standalone: true,
  imports: [MaterialModule, RuleGroupFormComponent],
  templateUrl: './rule-group-creation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleGroupCreationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RuleGroupCreationDialogComponent>);

  onFormSubmit(data: RuleGroupFormData): void {
    this.dialogRef.close(data);
  }

  onFormCancel(): void {
    this.dialogRef.close();
  }
}
```

Template structure:
```html
<h2 mat-dialog-title>Create Rule Group</h2>
<mat-dialog-content>
  <app-rule-group-form
    (formSubmit)="onFormSubmit($event)"
    (formCancel)="onFormCancel()"
  />
</mat-dialog-content>
```

Note: `MatDialogActions` is not needed here because the form's own action buttons (Cancel / Create Group) are rendered inside `RuleGroupFormComponent`. The dialog wrapper only provides the title and content container.

### Modified: `RulesPageComponent`

**Changes:**

1. **New method `openCreateRuleGroupDialog()`** - mirrors `openCreateDialog()`:
   - Opens `RuleGroupCreationDialogComponent` with `width: '560px'`.
   - On `afterClosed()`, if result is defined, calls `this.facade.createRuleGroup(result)` and `this.watchNextError('Rule group created successfully.')`.

2. **Template: "Create Rule Group" button** - added to the Rule Groups section header:
   ```html
   <button mat-flat-button color="primary"
           (click)="openCreateRuleGroupDialog()"
           aria-label="Create new rule group">
     <mat-icon>add</mat-icon>
     Create Rule Group
   </button>
   ```

3. **`rulesColumns` update** - add a `groupName` column:
   ```typescript
   protected readonly rulesColumns: ColumnConfig[] = [
     { key: 'ticker', header: 'Ticker' },
     { key: 'field', header: 'Field' },
     { key: 'operator', header: 'Operator' },
     { key: 'targetValue', header: 'Target Value', align: 'right' },
     { key: 'groupName', header: 'Rule Group' },
     { key: 'active', header: 'Active' },
     { key: 'actions', header: 'Actions' },
   ];
   ```

4. **`RuleRow` interface update** - add `groupName: string`:
   ```typescript
   interface RuleRow {
     // ...existing fields...
     readonly groupName: string; // group name or '-'
   }
   ```

5. **`rulesData` mapping update** - resolve group name from `currentRuleGroups`:
   ```typescript
   this.rulesData = rules.map((r) => ({
     // ...existing fields...
     groupName: this.resolveGroupName(r.groupId),
   }));
   ```

6. **New private helper `resolveGroupName(groupId: number | null): string`**:
   ```typescript
   private resolveGroupName(groupId: number | null): string {
     if (groupId === null) return '-';
     return this.currentRuleGroups.find((g) => g.id === groupId)?.name ?? '-';
   }
   ```

7. **Template: `groupName` cell** - rendered as plain text via `appCellDef` or as a default column (no custom template needed since `ReusableTableComponent` renders plain text by default for columns without a custom template).

### Existing: `RuleGroupFormComponent` (no changes)

The component already implements all required validation (Requirement 4) and emits `RuleGroupFormData` on valid submit. No modifications needed.

### Existing: `RulesFacade` (no changes)

`createRuleGroup(command: CreateRuleGroupCommand)` already exists and handles state update and error propagation.

### Existing: `RuleGroupsApiService` (no changes)

`create(command)` already calls `POST /api/v1/rule-groups`.

---

## Data Models

All domain models are already defined. No new models are needed.

### Relevant existing types

```typescript
// domain/models/rule-group.model.ts
interface RuleGroup {
  readonly id: number;
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly Rule[];
}

// domain/interfaces/rule-group.repository.ts
interface CreateRuleGroupCommand {
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly {
    readonly field: RuleField;
    readonly operator: ComparisonOperator;
    readonly targetValue: number;
  }[];
}

// presentation/rule-group-form/rule-group-form.component.ts
interface RuleGroupFormData {
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly {
    readonly field: RuleField;
    readonly operator: ComparisonOperator;
    readonly targetValue: number;
  }[];
}
```

`RuleGroupFormData` is structurally identical to `CreateRuleGroupCommand`, so the dialog result can be passed directly to `facade.createRuleGroup()` without transformation.

### `RuleRow` interface (presentation-local, updated)

```typescript
interface RuleRow {
  readonly id: number;
  readonly ticker: string;
  readonly field: string;
  readonly operator: string;
  readonly targetValue: number;
  readonly active: boolean;
  readonly triggered: boolean;
  readonly groupId: number | null;
  readonly groupName: string; // NEW: resolved group name or '-'
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system - essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Before listing properties, redundancy is assessed:

- 2.3 (dialog closes with data on valid submit) and 3.1 (page calls facade with that data) are related but test different layers - both are kept.
- 4.1 (ticker required) and 4.2 (name required) are both form validation properties. They can be combined into a single comprehensive form validity property that covers all required fields simultaneously.
- 4.3 (rules array length >= 1) is an invariant distinct from field validation - kept separate.
- 4.4 (targetValue required per rule) is covered by the combined form validity property.
- 4.5 (invalid submit marks all touched) is a behavioral property distinct from validity - kept.
- 6.2 (group name shown) and 6.3 (dash shown) are complementary and can be combined into one property: for any rule, the displayed group name equals the group name if groupId matches a group, or '-' otherwise.
- 3.3 (error message forwarded) is a universal property over error strings - kept.

After reflection: 7 properties remain.

---

### Property 1: Rule group form is valid iff all required fields are non-empty

*For any* combination of ticker, name, and rule entries, the `RuleGroupFormComponent` form is valid if and only if ticker is non-empty, name is non-empty, and every rule entry has a non-null targetValue.

**Validates: Requirements 4.1, 4.2, 4.4**

---

### Property 2: Rules array length invariant

*For any* sequence of `addRule()` and `removeRule()` calls on `RuleGroupFormComponent`, the `rulesArray.length` is always greater than or equal to 1.

**Validates: Requirements 4.3, 4.6**

---

### Property 3: Invalid submit marks all controls as touched

*For any* invalid form state in `RuleGroupFormComponent`, calling `onSubmit()` marks all form controls (including nested rule entries) as touched without emitting `formSubmit`.

**Validates: Requirements 4.5**

---

### Property 4: Dialog closes with submitted data for any valid form input

*For any* valid `RuleGroupFormData` (non-empty ticker, non-empty name, at least one rule with non-null targetValue), calling `onFormSubmit(data)` on `RuleGroupCreationDialogComponent` closes the dialog with that exact data.

**Validates: Requirements 2.3**

---

### Property 5: Facade is called with dialog result for any valid form data

*For any* valid `RuleGroupFormData` returned by the dialog, `RulesPageComponent` calls `RulesFacade.createRuleGroup()` with a `CreateRuleGroupCommand` whose ticker, name, and rules fields are identical to the dialog result.

**Validates: Requirements 3.1**

---

### Property 6: Error notifications forward any error message

*For any* non-null error string emitted by `facade.error$` after a `createRuleGroup` call, `NotificationService.showError()` is called with that exact string.

**Validates: Requirements 3.3**

---

### Property 7: Rule Group column displays correct value for any rule

*For any* rule row in the Individual Rules table, the "Rule Group" column displays the name of the associated `RuleGroup` when `groupId` matches a group in `currentRuleGroups`, and displays `-` when `groupId` is null or no matching group exists.

**Validates: Requirements 6.2, 6.3**

---

## Error Handling

- **Dialog cancelled**: `afterClosed()` emits `undefined`. The guard `if (!result) return;` in `openCreateRuleGroupDialog()` prevents any facade call. No notification is shown.
- **API error**: `RulesFacade.createRuleGroup()` catches `HttpErrorResponse`, extracts the message via `ErrorHandlerService`, and sets `error$`. `watchNextError()` in `RulesPageComponent` subscribes to `error$` and calls `notificationService.showError(error)`.
- **API success**: `error$` emits `null`. `watchNextError()` calls `notificationService.showSuccess('Rule group created successfully.')`.
- **Form validation errors**: `RuleGroupFormComponent.onSubmit()` calls `form.markAllAsTouched()` and returns early without emitting, so the dialog stays open and inline errors are shown.
- **Group name resolution failure**: If a rule has a `groupId` that does not match any loaded group (e.g., stale data), `resolveGroupName()` returns `'-'` as a safe fallback.

---

## Testing Strategy

### Unit Tests (example-based)

**`RuleGroupCreationDialogComponent`** (`rule-group-creation-dialog.component.spec.ts`):
- Renders `app-rule-group-form` inside `mat-dialog-content`.
- `onFormSubmit(data)` calls `dialogRef.close(data)`.
- `onFormCancel()` calls `dialogRef.close()` with no argument.
- Template contains `mat-dialog-title` with text "Create Rule Group".

**`RulesPageComponent`** (additions to `rules-page.component.spec.ts`):
- Renders "Create Rule Group" button with `aria-label="Create new rule group"`.
- `openCreateRuleGroupDialog()` opens `RuleGroupCreationDialogComponent` with `width: '560px'`.
- Does not call `facade.createRuleGroup()` when dialog is cancelled.
- Shows success notification "Rule group created successfully." when `error$` emits null.
- `rulesColumns` contains a column with `key: 'groupName'` and `header: 'Rule Group'`.

**`RuleGroupFormComponent`** (additions to `rule-group-form.component.spec.ts`):
- Remove button is disabled when `rulesArray.length === 1`.
- Remove button is enabled when `rulesArray.length > 1`.

### Property-Based Tests (fast-check)

The project uses `fast-check` for property-based testing (confirmed by existing `.property.spec.ts` files). Each property test runs a minimum of 100 iterations.

**`rule-group-creation-dialog.component.property.spec.ts`**:

- **Feature: rule-group-registration, Property 4**: For any valid `RuleGroupFormData`, `onFormSubmit(data)` closes the dialog with that exact data.
- **Feature: rule-group-registration, Property 4 (cancel)**: `onFormCancel()` always closes the dialog with no data, regardless of any prior state.

**`rule-group-form.component.property.spec.ts`** (new file):

- **Feature: rule-group-registration, Property 1**: For any combination of ticker (empty or non-empty), name (empty or non-empty), and rule entries (with null or non-null targetValue), form validity matches the expected predicate.
- **Feature: rule-group-registration, Property 2**: For any sequence of add/remove operations, `rulesArray.length >= 1` always holds.
- **Feature: rule-group-registration, Property 3**: For any invalid form state, calling `onSubmit()` marks all controls as touched and does not emit `formSubmit`.

**`rules-page.component.property.spec.ts`** (new file):

- **Feature: rule-group-registration, Property 5**: For any valid `RuleGroupFormData` returned by the mocked dialog, `facade.createRuleGroup()` is called with structurally identical data.
- **Feature: rule-group-registration, Property 6**: For any error string emitted by `facade.error$`, `notificationService.showError()` is called with that exact string.
- **Feature: rule-group-registration, Property 7**: For any rule with a `groupId` matching a group in `currentRuleGroups`, `resolveGroupName()` returns the group's name; for any rule with `groupId: null` or an unmatched id, it returns `'-'`.

### Integration Tests

None required. All API behavior is already covered by existing `RuleGroupsApiService` and `RulesFacade` tests. The new feature adds no new infrastructure.

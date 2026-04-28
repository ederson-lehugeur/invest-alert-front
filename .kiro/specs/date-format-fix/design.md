# Date Format Fix - Bugfix Design

## Overview

Dates are rendered across four pages using Angular `DatePipe` with the `'short'` or `'medium'`
format tokens. These tokens produce locale-dependent output (e.g. `4/27/26, 3:00 PM` or
`Apr 27, 2026, 3:00:00 PM`) instead of the required PT-BR format `dd/MM/yyyy HH:mm:ss`
(e.g. `27/04/2026 22:27:00`).

The fix is a targeted template-only change: replace every incorrect `date` pipe format token
with `'dd/MM/yyyy HH:mm:ss'` in the five affected binding sites across four component templates. No
business logic, domain models, or infrastructure mappers are touched.

## Glossary

- **Bug_Condition (C)**: A date value is rendered via `DatePipe` with a format token other than
  `'dd/MM/yyyy HH:mm:ss'` (i.e. `'short'` or `'medium'`).
- **Property (P)**: The rendered string matches the pattern `DD/MM/YYYY HH:mm:ss` (two-digit day,
  two-digit month, four-digit year, space, two-digit hour in 24h, two-digit minute, two-digit second).
- **Preservation**: All non-date columns, null-fallback logic, loading states, and API mapping
  behaviour that must remain unchanged after the fix.
- **DatePipe**: Angular built-in pipe (`date`) that formats a `Date` value using a format string.
- **format token**: The string argument passed to `DatePipe` (e.g. `'short'`, `'medium'`,
  `'dd/MM/yyyy'`).
- **affected binding site**: A template expression of the form `value | date:'<token>'` where
  `<token>` is not `'dd/MM/yyyy'`.

## Bug Details

### Bug Condition

The bug manifests whenever a date value reaches a template binding that uses `'short'` or
`'medium'` as the `DatePipe` format token. The pipe produces a locale-dependent string that
does not conform to the required `DD/MM/YYYY` format.

**Formal Specification:**

```
FUNCTION isBugCondition(binding)
  INPUT: binding - a template date-pipe expression { value: Date, formatToken: string }
  OUTPUT: boolean

  RETURN binding.formatToken IN ['short', 'medium']
         AND binding.value IS a valid Date
END FUNCTION
```

### Examples

| Location | Column / Field | Current output (en-US) | Expected output |
|---|---|---|---|
| Dashboard - recent alerts table | `createdAt` | `4/27/26, 3:00 PM` | `27/04/2026 22:27:00` |
| Alerts page table | `createdAt` | `4/27/26, 3:00 PM` | `27/04/2026 22:27:00` |
| Alerts page table | `sentAt` (non-null) | `4/27/26, 3:00 PM` | `27/04/2026 22:27:00` |
| Assets page table | `updatedAt` | `4/27/26, 3:00 PM` | `27/04/2026 22:27:00` |
| Asset detail page | `updatedAt` | `Apr 27, 2026, 3:00:00 PM` | `27/04/2026 22:27:00` |

Edge case: `sentAt` is null - the template already guards with `row.sentAt ? ... : '-'`, so the
`DatePipe` is never called and the output remains `'-'` (unchanged).

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**

- Null/absent `sentAt` on the alerts page SHALL continue to display `-` as the fallback value.
- All non-date columns (ticker, status, details, name, price, dividendYield, pVp) SHALL continue
  to render exactly as before.
- Loading skeleton states SHALL continue to display while data is being fetched.
- API response mapping through infrastructure mappers SHALL continue to parse and store dates as
  `Date` objects without modification.
- Row click navigation on the assets page SHALL continue to work correctly.
- Pagination and sorting behaviour SHALL remain unchanged.

**Scope:**

All template bindings that do NOT use `DatePipe` with `'short'` or `'medium'` are completely
unaffected by this fix. This includes:

- `number` pipe bindings (prices, yields, ratios).
- `async` pipe bindings (observables, loading flags).
- Plain string interpolations (ticker, status, details, name).
- Any pipe usage in components not listed above.

## Hypothesized Root Cause

The `DatePipe` format tokens `'short'` and `'medium'` were used as convenient shorthand during
initial development. Both tokens delegate formatting to the runtime locale, producing output that
varies by environment and does not match the project's required `DD/MM/YYYY` format.

There is no logic error in the components or services - the root cause is exclusively the choice
of format token in five template binding sites:

1. `dashboard-page.component.html` line with `alert.createdAt | date:'short'`
2. `alerts-page.component.html` line with `row.createdAt | date:'short'`
3. `alerts-page.component.html` line with `row.sentAt | date:'short'`
4. `assets-page.component.html` line with `row.updatedAt | date:'short'`
5. `asset-detail-page.component.html` line with `asset.updatedAt | date:'medium'`

## Correctness Properties

Property 1: Bug Condition - Date Rendered in DD/MM/YYYY Format

_For any_ template binding where `isBugCondition` holds (a `Date` value is piped through
`DatePipe` with `'short'` or `'medium'`), the fixed template SHALL render the date as a string
matching the pattern `DD/MM/YYYY HH:mm:ss` (e.g. `27/04/2026 22:27:00`), using 24-hour clock
and no locale-dependent variation.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Non-Date and Null-Date Bindings Unchanged

_For any_ template binding where `isBugCondition` does NOT hold (non-date columns, null `sentAt`,
loading states, number pipes), the fixed templates SHALL produce exactly the same rendered output
as the original templates, preserving all existing display behaviour.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

## Fix Implementation

### Changes Required

**File**: `src/app/features/dashboard/presentation/dashboard-page/dashboard-page.component.html`

**Specific Change**:
1. Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` on the `alert.createdAt` binding.

---

**File**: `src/app/features/alerts/presentation/alerts-page/alerts-page.component.html`

**Specific Changes**:
1. Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` on the `row.createdAt` binding.
2. Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` on the `row.sentAt` binding (inside the
   ternary guard - the null branch `'-'` is unchanged).

---

**File**: `src/app/features/assets/presentation/assets-page/assets-page.component.html`

**Specific Change**:
1. Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` on the `row.updatedAt` binding.

---

**File**: `src/app/features/assets/presentation/asset-detail-page/asset-detail-page.component.html`

**Specific Change**:
1. Replace `date:'medium'` with `date:'dd/MM/yyyy HH:mm:ss'` on the `asset.updatedAt` binding.

No TypeScript component files, services, domain models, or infrastructure mappers require
modification.

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate
the bug on unfixed code, then verify the fix works correctly and preserves existing behaviour.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm
that the root cause is exclusively the format token, not a service or mapper issue.

**Test Plan**: Write component tests that render each affected template with a known `Date` value
and assert the output string. Run these tests on the UNFIXED code to observe failures.

**Test Cases**:

1. **Dashboard createdAt**: Render `dashboard-page` with a known date (e.g. `2026-04-27T15:00:00Z`)
   and assert the cell contains `27/04/2026` - will fail on unfixed code (shows `4/27/26, 3:00 PM`).
2. **Alerts createdAt**: Render `alerts-page` with a known date and assert `createdAt` cell
   contains `27/04/2026` - will fail on unfixed code.
3. **Alerts sentAt (non-null)**: Render `alerts-page` with a non-null `sentAt` and assert the cell
   contains `27/04/2026` - will fail on unfixed code.
4. **Assets updatedAt**: Render `assets-page` with a known date and assert `updatedAt` cell
   contains `27/04/2026` - will fail on unfixed code.
5. **Asset detail updatedAt**: Render `asset-detail-page` with a known date and assert the
   `Updated At` value contains `27/04/2026` - will fail on unfixed code (shows
   `Apr 27, 2026, 3:00:00 PM`).

**Expected Counterexamples**:

- Rendered date strings contain time components or locale-dependent month/day ordering.
- Confirms root cause is the format token; no mapper or service changes are needed.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed templates produce
the expected `DD/MM/YYYY` output.

**Pseudocode:**

```
FOR ALL binding WHERE isBugCondition(binding) DO
  renderedString := renderTemplate_fixed(binding.value)
  ASSERT renderedString MATCHES /^\d{2}\/\d{2}\/\d{4}$/
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed templates
produce the same rendered output as the original templates.

**Pseudocode:**

```
FOR ALL binding WHERE NOT isBugCondition(binding) DO
  ASSERT renderTemplate_original(binding) = renderTemplate_fixed(binding)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:

- It generates many date values automatically, covering edge cases (epoch, far future, leap days).
- It verifies the `DD/MM/YYYY` pattern holds for all valid dates, not just the one example.
- It provides strong guarantees that null-fallback and non-date columns are unaffected.

**Test Cases**:

1. **Null sentAt Preservation**: Verify that when `sentAt` is null the cell still renders `-`
   after the fix.
2. **Non-date Column Preservation**: Verify that ticker, status, price, and other columns render
   identically before and after the fix.
3. **Property-based date format**: Generate arbitrary valid `Date` objects and assert every
   affected binding renders a string matching `/^\d{2}\/\d{2}\/\d{4}$/`.

### Unit Tests

- Test each affected template binding with a fixed known date and assert the exact `DD/MM/YYYY`
  string.
- Test the `sentAt` null guard: assert `-` is rendered when `sentAt` is null or undefined.
- Test that non-date columns (ticker, status, details, price) are unaffected by the template
  change.

### Property-Based Tests

- Generate random valid `Date` values and assert every affected binding produces a string
  matching `/^\d{2}\/\d{2}\/\d{4}$/`.
- Generate random non-null `Date` values for `sentAt` and assert the output matches the pattern.
- Generate a mix of null and non-null `sentAt` values and assert the null branch always yields
  `'-'`.

### Integration Tests

- Render the full dashboard page with mocked alert data and verify the `createdAt` column
  displays dates in `DD/MM/YYYY` format.
- Render the full alerts page with mixed `sentAt` (some null, some set) and verify correct
  output for both cases.
- Render the asset detail page and verify the `Updated At` field shows `DD/MM/YYYY` with no
  time component.

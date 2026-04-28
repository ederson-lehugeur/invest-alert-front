# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Date Rendered with Wrong Format Token
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists across all five binding sites
  - **Scoped PBT Approach**: Scope the property to the concrete failing cases using a fixed known date (`2026-04-27T15:00:00Z`) across all five affected bindings
  - For each affected template, render the component with the known date and assert the output matches `/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/` (e.g. `27/04/2026 22:27:00`)
  - Binding sites to cover:
    - `dashboard-page.component.html` - `alert.createdAt | date:'short'`
    - `alerts-page.component.html` - `row.createdAt | date:'short'`
    - `alerts-page.component.html` - `row.sentAt | date:'short'` (non-null case)
    - `assets-page.component.html` - `row.updatedAt | date:'short'`
    - `asset-detail-page.component.html` - `asset.updatedAt | date:'medium'`
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (e.g. dashboard shows `4/27/26, 3:00 PM` instead of `27/04/2026 22:27:00`; asset detail shows `Apr 27, 2026, 3:00:00 PM`)
  - Document counterexamples found to confirm root cause is the format token only
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Non-Date and Null-Date Bindings Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for inputs where `isBugCondition` does NOT hold
  - Observe: `sentAt = null` renders `-` in the alerts page (ternary guard `row.sentAt ? ... : '-'`)
  - Observe: non-date columns (ticker, status, details, name, price, dividendYield, pVp) render their raw values unchanged
  - Observe: loading skeleton states display while data is being fetched
  - Write property-based tests:
    - For all null/undefined `sentAt` values, assert the rendered cell equals `'-'`
    - For arbitrary non-date column values, assert rendered output is identical before and after the fix
    - Generate arbitrary valid `Date` objects and assert every affected binding produces a string matching `/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/` after fix (use as baseline on unfixed code to observe current pattern)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (confirms baseline preservation behavior)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3. Fix date format tokens across all five template binding sites

  - [x] 3.1 Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` in `dashboard-page.component.html`
    - Update the `alert.createdAt` binding in the recent alerts table
    - _Expected_Behavior: rendered string matches /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/ (e.g. `27/04/2026 22:27:00`)_
    - _Preservation: all other columns in the dashboard table remain unchanged_
    - _Requirements: 2.1, 3.1, 3.4_

  - [x] 3.2 Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` for both bindings in `alerts-page.component.html`
    - Update the `row.createdAt` binding
    - Update the `row.sentAt` binding inside the ternary guard (null branch `'-'` is unchanged)
    - _Expected_Behavior: non-null dates render as /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/, null sentAt still renders '-'_
    - _Preservation: null sentAt fallback '-' and all non-date columns (ticker, status, details) remain unchanged_
    - _Requirements: 2.2, 2.3, 3.1, 3.2, 3.4_

  - [x] 3.3 Replace `date:'short'` with `date:'dd/MM/yyyy HH:mm:ss'` in `assets-page.component.html`
    - Update the `row.updatedAt` binding in the assets table
    - _Expected_Behavior: rendered string matches /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/_
    - _Preservation: row click navigation, pagination, sorting, and all non-date columns remain unchanged_
    - _Requirements: 2.4, 3.1, 3.4_

  - [x] 3.4 Replace `date:'medium'` with `date:'dd/MM/yyyy HH:mm:ss'` in `asset-detail-page.component.html`
    - Update the `asset.updatedAt` binding in the asset detail view
    - _Expected_Behavior: rendered string matches /^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/ with 24-hour clock_
    - _Preservation: all other asset detail fields (name, ticker, price, dividendYield, pVp) remain unchanged_
    - _Requirements: 2.5, 3.1, 3.4_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Date Rendered with Wrong Format Token
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior for all five binding sites
    - When this test passes, it confirms `dd/MM/yyyy` is applied correctly across all templates
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed in all five locations)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Non-Date and Null-Date Bindings Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions - null sentAt still shows '-', non-date columns unchanged)
    - Confirm all tests still pass after fix
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

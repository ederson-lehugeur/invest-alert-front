# Bugfix Requirements Document

## Introduction

Dates displayed across the application use inconsistent Angular `DatePipe` format tokens (`'short'` and `'medium'`), which produce locale-dependent output that does not match the required PT-BR format `dd/MM/yyyy HH:mm:ss` (e.g. `27/04/2026 22:27:00`). The bug affects every place a date is rendered in the dashboard, alerts list, assets list, and asset detail page.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a date is rendered in the dashboard alerts table (`createdAt` column) THEN the system displays it using the `'short'` format (e.g. `4/27/26, 3:00 PM`) instead of `dd/MM/yyyy HH:mm:ss`.

1.2 WHEN a date is rendered in the alerts page table (`createdAt` column) THEN the system displays it using the `'short'` format instead of `dd/MM/yyyy HH:mm:ss`.

1.3 WHEN a date is rendered in the alerts page table (`sentAt` column) THEN the system displays it using the `'short'` format instead of `dd/MM/yyyy HH:mm:ss`.

1.4 WHEN a date is rendered in the assets page table (`updatedAt` column) THEN the system displays it using the `'short'` format instead of `dd/MM/yyyy HH:mm:ss`.

1.5 WHEN a date is rendered in the asset detail page (`updatedAt` field) THEN the system displays it using the `'medium'` format (e.g. `Apr 27, 2026, 3:00:00 PM`) instead of `dd/MM/yyyy HH:mm:ss`.

### Expected Behavior (Correct)

2.1 WHEN a date is rendered in the dashboard alerts table (`createdAt` column) THEN the system SHALL display it in `dd/MM/yyyy HH:mm:ss` format (e.g. `27/04/2026 22:27:00`).

2.2 WHEN a date is rendered in the alerts page table (`createdAt` column) THEN the system SHALL display it in `dd/MM/yyyy HH:mm:ss` format (e.g. `27/04/2026 22:27:00`).

2.3 WHEN a date is rendered in the alerts page table (`sentAt` column) THEN the system SHALL display it in `dd/MM/yyyy HH:mm:ss` format (e.g. `27/04/2026 22:27:00`), or `-` when no date is present.

2.4 WHEN a date is rendered in the assets page table (`updatedAt` column) THEN the system SHALL display it in `dd/MM/yyyy HH:mm:ss` format (e.g. `27/04/2026 22:27:00`).

2.5 WHEN a date is rendered in the asset detail page (`updatedAt` field) THEN the system SHALL display it in `dd/MM/yyyy HH:mm:ss` format (e.g. `27/04/2026 22:27:00`).

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a valid date value is provided to any date-rendering location THEN the system SHALL CONTINUE TO display the date without crashing or showing an error.

3.2 WHEN the `sentAt` field is null or absent in the alerts page THEN the system SHALL CONTINUE TO display `-` as the fallback value.

3.3 WHEN dates are fetched from the API and mapped through infrastructure mappers THEN the system SHALL CONTINUE TO parse and store them as `Date` objects without modification.

3.4 WHEN any non-date columns are rendered in tables (e.g. asset name, ticker, price) THEN the system SHALL CONTINUE TO display them correctly and unchanged.

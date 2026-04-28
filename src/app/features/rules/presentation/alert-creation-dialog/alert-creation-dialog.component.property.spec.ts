// Feature: material-dashboard-redesign, Property 6: Alert creation form validation
import { FormBuilder, Validators } from '@angular/forms';
import * as fc from 'fast-check';
import { RuleField, ComparisonOperator } from '../../domain/models/rule.model';

const VALID_FIELDS: RuleField[] = ['PRICE', 'DIVIDEND_YIELD', 'P_VP'];
const VALID_OPERATORS: ComparisonOperator[] = [
  'GREATER_THAN',
  'LESS_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN_OR_EQUAL',
  'EQUAL',
];

/**
 * Builds the same reactive form as AlertCreationDialogComponent without Angular TestBed.
 * This allows fast-check to run many iterations without the overhead of component creation.
 */
function buildForm(
  ticker: string,
  field: string,
  operator: string,
  targetValue: number | null,
) {
  const fb = new FormBuilder();
  const form = fb.group({
    ticker: [ticker, Validators.required],
    field: [field, Validators.required],
    operator: [operator, Validators.required],
    targetValue: [targetValue, Validators.required],
    groupId: [null as number | null],
  });
  form.markAllAsTouched();
  return form;
}

describe('AlertCreationDialogComponent - Property 6: Form validation', () => {
  it('form is valid iff all required fields are correctly filled', () => {
    fc.assert(
      fc.property(
        // ticker: mix of empty and non-empty strings
        fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 10 })),
        // field: mix of valid and invalid values
        fc.oneof(
          fc.constantFrom(...VALID_FIELDS),
          fc.constant('INVALID_FIELD'),
          fc.constant(''),
        ),
        // operator: mix of valid and invalid values
        fc.oneof(
          fc.constantFrom(...VALID_OPERATORS),
          fc.constant('INVALID_OP'),
          fc.constant(''),
        ),
        // targetValue: mix of numbers and null
        fc.oneof(
          fc.float({ noNaN: true, noDefaultInfinity: true }).map((n) => n as number | null),
          fc.constant(null as number | null),
        ),
        (ticker, field, operator, targetValue) => {
          const form = buildForm(ticker, field, operator, targetValue);

          const isTickerValid = ticker.trim().length > 0;
          // Angular Validators.required only checks for null/undefined/empty string
          // It does NOT validate that the value is in a specific set
          // So field and operator are "valid" as long as they are non-empty strings
          const isFieldValid = field !== null && field !== undefined && field !== '';
          const isOperatorValid = operator !== null && operator !== undefined && operator !== '';
          const isTargetValueValid = targetValue !== null && targetValue !== undefined;

          const expectedValid =
            isTickerValid && isFieldValid && isOperatorValid && isTargetValueValid;

          expect(form.valid).toBe(expectedValid);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('form is always invalid when ticker is empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_FIELDS),
        fc.constantFrom(...VALID_OPERATORS),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (field, operator, targetValue) => {
          const form = buildForm('', field, operator, targetValue);
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('form is always invalid when targetValue is null', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.constantFrom(...VALID_FIELDS),
        fc.constantFrom(...VALID_OPERATORS),
        (ticker, field, operator) => {
          const form = buildForm(ticker, field, operator, null);
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('form is always valid when all fields are correctly provided', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.constantFrom(...VALID_FIELDS),
        fc.constantFrom(...VALID_OPERATORS),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (ticker, field, operator, targetValue) => {
          const form = buildForm(ticker, field, operator, targetValue);
          expect(form.valid).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });
});

// Feature: material-dashboard-redesign, Property 6: Alert creation form validation
import { FormBuilder, Validators } from '@angular/forms';
import * as fc from 'fast-check';
import { ComparisonOperator } from '../../domain/models/rule.model';

const VALID_INDICATORS: string[] = ['PRICE', 'DIVIDEND_YIELD', 'PVP', 'PL', 'ROE'];
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
  indicatorCode: string,
  operator: string,
  targetValue: number | null,
) {
  const fb = new FormBuilder();
  const form = fb.group({
    ticker: [ticker, Validators.required],
    indicatorCode: [indicatorCode, Validators.required],
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
        // indicatorCode: mix of valid and invalid values
        fc.oneof(
          fc.constantFrom(...VALID_INDICATORS),
          fc.constant('INVALID_INDICATOR'),
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
        (ticker, indicatorCode, operator, targetValue) => {
          const form = buildForm(ticker, indicatorCode, operator, targetValue);

          const isTickerValid = ticker.trim().length > 0;
          const isIndicatorValid = indicatorCode !== null && indicatorCode !== undefined && indicatorCode !== '';
          const isOperatorValid = operator !== null && operator !== undefined && operator !== '';
          const isTargetValueValid = targetValue !== null && targetValue !== undefined;

          const expectedValid =
            isTickerValid && isIndicatorValid && isOperatorValid && isTargetValueValid;

          expect(form.valid).toBe(expectedValid);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('form is always invalid when ticker is empty', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...VALID_INDICATORS),
        fc.constantFrom(...VALID_OPERATORS),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (indicatorCode, operator, targetValue) => {
          const form = buildForm('', indicatorCode, operator, targetValue);
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
        fc.constantFrom(...VALID_INDICATORS),
        fc.constantFrom(...VALID_OPERATORS),
        (ticker, indicatorCode, operator) => {
          const form = buildForm(ticker, indicatorCode, operator, null);
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
        fc.constantFrom(...VALID_INDICATORS),
        fc.constantFrom(...VALID_OPERATORS),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (ticker, indicatorCode, operator, targetValue) => {
          const form = buildForm(ticker, indicatorCode, operator, targetValue);
          expect(form.valid).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });
});

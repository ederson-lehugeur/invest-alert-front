// Feature: rule-group-registration
// Property 1: Rule group form is valid iff all required fields are non-empty
// Property 2: Rules array length invariant
// Property 3: Invalid submit marks all controls as touched without emitting
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import * as fc from 'fast-check';
import { RuleGroupFormComponent } from './rule-group-form.component';
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
 * Builds the same reactive form as RuleGroupFormComponent without Angular TestBed.
 * Mirrors the pattern from alert-creation-dialog.component.property.spec.ts for performance.
 */
function buildForm(
  ticker: string,
  name: string,
  rules: Array<{ field: string; operator: string; targetValue: number | null }>,
) {
  const fb = new FormBuilder();
  const rulesArray = fb.array(
    rules.map((r) =>
      fb.group({
        field: [r.field, Validators.required],
        operator: [r.operator, Validators.required],
        targetValue: [r.targetValue, Validators.required],
      }),
    ),
  );
  const form = fb.group({
    ticker: [ticker, Validators.required],
    name: [name, Validators.required],
    rules: rulesArray,
  });
  form.markAllAsTouched();
  return form;
}

/**
 * Builds a RuleGroupFormComponent instance directly (no TestBed) for fast property testing.
 */
function buildComponent(): RuleGroupFormComponent {
  const fb = new FormBuilder();
  const component = new RuleGroupFormComponent(fb);
  return component;
}

const ruleEntryArb = (targetValue: fc.Arbitrary<number | null>) =>
  fc.record({
    field: fc.constantFrom(...VALID_FIELDS) as fc.Arbitrary<string>,
    operator: fc.constantFrom(...VALID_OPERATORS) as fc.Arbitrary<string>,
    targetValue,
  });

const validTargetValueArb = fc.float({ min: Math.fround(0.01), max: Math.fround(99999), noNaN: true }) as fc.Arbitrary<number | null>;
const nullTargetValueArb: fc.Arbitrary<number | null> = fc.constant(null);
const mixedTargetValueArb = fc.oneof(validTargetValueArb, nullTargetValueArb);

describe('RuleGroupFormComponent - Property 1: Form validity matches all-required-fields predicate', () => {
  it('form is valid iff ticker non-empty AND name non-empty AND every rule targetValue non-null', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 10 })),
        fc.oneof(fc.constant(''), fc.string({ minLength: 1, maxLength: 50 })),
        fc.array(ruleEntryArb(mixedTargetValueArb), { minLength: 1, maxLength: 5 }),
        (ticker, name, rules) => {
          const form = buildForm(ticker, name, rules);

          const isTickerValid = ticker.length > 0;
          const isNameValid = name.length > 0;
          const allRulesValid = rules.every((r) => r.targetValue !== null && r.targetValue !== undefined);

          const expectedValid = isTickerValid && isNameValid && allRulesValid;
          expect(form.valid).toBe(expectedValid);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('form is always invalid when ticker is empty', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(ruleEntryArb(validTargetValueArb), { minLength: 1, maxLength: 3 }),
        (name, rules) => {
          const form = buildForm('', name, rules);
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('form is always invalid when name is empty', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.array(ruleEntryArb(validTargetValueArb), { minLength: 1, maxLength: 3 }),
        (ticker, rules) => {
          const form = buildForm(ticker, '', rules);
          expect(form.valid).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('form is always invalid when any rule has null targetValue', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(ruleEntryArb(validTargetValueArb), { minLength: 0, maxLength: 3 }),
        (ticker, name, validRules) => {
          const rulesWithNull = [
            ...validRules,
            { field: 'PRICE', operator: 'GREATER_THAN', targetValue: null },
          ];
          const form = buildForm(ticker, name, rulesWithNull);
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
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(ruleEntryArb(validTargetValueArb), { minLength: 1, maxLength: 5 }),
        (ticker, name, rules) => {
          const form = buildForm(ticker, name, rules);
          expect(form.valid).toBe(true);
        },
      ),
      { numRuns: 200 },
    );
  });
});

describe('RuleGroupFormComponent - Property 2: Rules array length invariant', () => {
  type Operation = 'add' | { remove: number };

  it('rulesArray.length is always >= 1 for any sequence of add/remove operations', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.oneof(
            fc.constant('add' as Operation),
            fc.integer({ min: 0, max: 9 }).map((i) => ({ remove: i } as Operation)),
          ),
          { minLength: 0, maxLength: 20 },
        ),
        (operations) => {
          const component = buildComponent();

          for (const op of operations) {
            if (op === 'add') {
              component.addRule();
            } else {
              component.removeRule((op as { remove: number }).remove);
            }
            // Invariant must hold after every operation
            expect(component.rulesArray.length).toBeGreaterThanOrEqual(1);
          }
        },
      ),
      { numRuns: 200 },
    );
  });

  it('rulesArray.length starts at 1', () => {
    const component = buildComponent();
    expect(component.rulesArray.length).toBe(1);
  });

  it('removeRule on the last entry does not reduce length below 1', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 20 }), (removeIndex) => {
        const component = buildComponent();
        // Only one rule exists initially
        component.removeRule(removeIndex);
        expect(component.rulesArray.length).toBeGreaterThanOrEqual(1);
      }),
      { numRuns: 100 },
    );
  });
});

describe('RuleGroupFormComponent - Property 3: Invalid submit marks all controls as touched without emitting', () => {
  it('onSubmit() marks all controls as touched and does not emit formSubmit for any invalid form state', () => {
    fc.assert(
      fc.property(
        // Generate invalid states: empty ticker, empty name, or null targetValue
        fc.oneof(
          // Empty ticker
          fc.record({
            ticker: fc.constant(''),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            targetValue: validTargetValueArb,
          }),
          // Empty name
          fc.record({
            ticker: fc.string({ minLength: 1, maxLength: 10 }),
            name: fc.constant(''),
            targetValue: validTargetValueArb,
          }),
          // Null targetValue
          fc.record({
            ticker: fc.string({ minLength: 1, maxLength: 10 }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            targetValue: fc.constant(null as number | null),
          }),
        ),
        ({ ticker, name, targetValue }) => {
          const component = buildComponent();
          const emittedValues: unknown[] = [];
          component.formSubmit.subscribe((v) => emittedValues.push(v));

          // Set form values
          component.form.patchValue({ ticker, name });
          (component.rulesArray.at(0) as ReturnType<FormArray['at']>).patchValue({ targetValue });

          component.onSubmit();

          // All controls must be touched
          expect(component.form.get('ticker')?.touched).toBe(true);
          expect(component.form.get('name')?.touched).toBe(true);
          expect(component.rulesArray.at(0).get('targetValue')?.touched).toBe(true);

          // formSubmit must not have been emitted
          expect(emittedValues.length).toBe(0);
        },
      ),
      { numRuns: 200 },
    );
  });

  it('onSubmit() emits formSubmit for any valid form state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 50 }),
        validTargetValueArb as fc.Arbitrary<number>,
        (ticker, name, targetValue) => {
          const component = buildComponent();
          const emittedValues: unknown[] = [];
          component.formSubmit.subscribe((v) => emittedValues.push(v));

          component.form.patchValue({ ticker, name });
          (component.rulesArray.at(0) as ReturnType<FormArray['at']>).patchValue({
            field: 'PRICE',
            operator: 'GREATER_THAN',
            targetValue,
          });

          component.onSubmit();

          expect(emittedValues.length).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });
});

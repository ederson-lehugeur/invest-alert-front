// Feature: rule-group-registration, Property 4: Dialog closes with submitted data for any valid form input
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import * as fc from 'fast-check';
import { RuleGroupCreationDialogComponent } from './rule-group-creation-dialog.component';
import { RuleGroupFormData } from '../rule-group-form/rule-group-form.component';
import { RuleField, ComparisonOperator } from '../../domain/models/rule.model';

const VALID_FIELDS: RuleField[] = ['PRICE', 'DIVIDEND_YIELD', 'P_VP'];
const VALID_OPERATORS: ComparisonOperator[] = [
  'GREATER_THAN',
  'LESS_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN_OR_EQUAL',
  'EQUAL',
];

const ruleEntryArb = fc.record({
  field: fc.constantFrom(...VALID_FIELDS),
  operator: fc.constantFrom(...VALID_OPERATORS),
  targetValue: fc.float({ min: Math.fround(0.01), max: Math.fround(99999), noNaN: true }),
});

const validRuleGroupFormDataArb: fc.Arbitrary<RuleGroupFormData> = fc.record({
  ticker: fc.string({ minLength: 1, maxLength: 10 }),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  rules: fc.array(ruleEntryArb, { minLength: 1, maxLength: 5 }),
});

describe('RuleGroupCreationDialogComponent - Property 4: Dialog closes with submitted data for any valid form input', () => {
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RuleGroupCreationDialogComponent, NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: mockDialogRef }],
    }).compileComponents();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('onFormSubmit(data) closes the dialog with that exact data for any valid RuleGroupFormData', () => {
    fc.assert(
      fc.property(validRuleGroupFormDataArb, (formData) => {
        mockDialogRef.close.mockClear();

        const fixture = TestBed.createComponent(RuleGroupCreationDialogComponent);
        const component = fixture.componentInstance;

        component.onFormSubmit(formData);

        expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
        expect(mockDialogRef.close).toHaveBeenCalledWith(formData);
        const passedData = mockDialogRef.close.mock.calls[0][0] as RuleGroupFormData;
        expect(passedData).toBe(formData);
      }),
      { numRuns: 100 },
    );
  });

  it('onFormCancel() always calls dialogRef.close() with no argument regardless of prior state', () => {
    fc.assert(
      fc.property(
        fc.option(validRuleGroupFormDataArb, { nil: undefined }),
        (priorData) => {
          mockDialogRef.close.mockClear();

          const fixture = TestBed.createComponent(RuleGroupCreationDialogComponent);
          const component = fixture.componentInstance;

          // Simulate prior state by calling onFormSubmit first if data is provided
          if (priorData !== undefined) {
            component.onFormSubmit(priorData);
            mockDialogRef.close.mockClear();
          }

          component.onFormCancel();

          expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
          // Must be called with no arguments
          const callArgs = mockDialogRef.close.mock.calls[0];
          expect(callArgs.length).toBe(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});

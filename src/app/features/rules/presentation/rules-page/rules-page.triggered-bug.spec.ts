import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import * as fc from 'fast-check';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';
import { RuleApiResponse, mapRuleResponse } from '../../infrastructure/mappers/rule.mapper';

/**
 * Bug Condition Exploration Test - Property 1
 *
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 *
 * These tests encode the EXPECTED (correct) behavior for triggered rules.
 * They are expected to FAIL on unfixed code, confirming the bug exists.
 */

const RULE_FIELDS: RuleField[] = ['PRICE', 'DIVIDEND_YIELD', 'P_VP'];
const COMPARISON_OPERATORS: ComparisonOperator[] = [
  'GREATER_THAN',
  'LESS_THAN',
  'GREATER_THAN_OR_EQUAL',
  'LESS_THAN_OR_EQUAL',
  'EQUAL',
];

const ruleFieldArb = fc.constantFrom(...RULE_FIELDS);
const comparisonOperatorArb = fc.constantFrom(...COMPARISON_OPERATORS);

/**
 * Arbitrary that generates RuleApiResponse objects with triggered: true.
 * We cast to include the `triggered` field since the current RuleApiResponse
 * interface does not declare it (that's part of the bug).
 */
const triggeredRuleApiResponseArb = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  ticker: fc.stringMatching(/^[A-Z]{4}[0-9]{1,2}$/),
  field: ruleFieldArb,
  operator: comparisonOperatorArb,
  targetValue: fc.float({ min: Math.fround(0.01), max: Math.fround(99999), noNaN: true }),
  groupId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 1000 })),
  active: fc.boolean(),
  triggered: fc.constant(true),
}) as fc.Arbitrary<RuleApiResponse & { triggered: boolean }>;

describe('Bug Condition Exploration - Triggered Rules Allow Edit and Delete', () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * Property 1a: Mapper preserves triggered field.
   * For any RuleApiResponse with triggered: true, mapRuleResponse must
   * produce a Rule with triggered === true.
   *
   * EXPECTED TO FAIL on unfixed code because the Rule interface lacks
   * `triggered` and the mapper does not map it.
   */
  it('mapper should preserve triggered field for triggered rules', () => {
    fc.assert(
      fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
        const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
        expect((mapped as unknown as Record<string, unknown>)['triggered']).toBe(true);
      }),
      { numRuns: 50 },
    );
  });

  /**
   * **Validates: Requirements 1.2, 1.3, 1.4, 1.5**
   *
   * Property 1b: Template and component guards for triggered rules.
   * For any triggered rule rendered in the component:
   * - Edit button must be disabled
   * - Delete button must be disabled
   * - showEditRule must not open the form
   * - confirmDelete must not open the dialog
   *
   * EXPECTED TO FAIL on unfixed code because buttons are always enabled
   * and methods have no triggered guards.
   */
  describe('template and component guards', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;
    let mockFacade: {
      loadRules: ReturnType<typeof vi.fn>;
      createRule: ReturnType<typeof vi.fn>;
      updateRule: ReturnType<typeof vi.fn>;
      deleteRule: ReturnType<typeof vi.fn>;
      createRuleGroup: ReturnType<typeof vi.fn>;
      rules$: BehaviorSubject<Rule[]>;
      ruleGroups$: BehaviorSubject<RuleGroup[]>;
      isLoading$: BehaviorSubject<boolean>;
      error$: BehaviorSubject<string | null>;
    };

    beforeEach(async () => {
      mockFacade = {
        loadRules: vi.fn(),
        createRule: vi.fn(),
        updateRule: vi.fn(),
        deleteRule: vi.fn(),
        createRuleGroup: vi.fn(),
        rules$: new BehaviorSubject<Rule[]>([]),
        ruleGroups$: new BehaviorSubject<RuleGroup[]>([]),
        isLoading$: new BehaviorSubject<boolean>(false),
        error$: new BehaviorSubject<string | null>(null),
      };

      await TestBed.configureTestingModule({
        imports: [RulesPageComponent],
        providers: [{ provide: RulesFacade, useValue: mockFacade }],
      }).compileComponents();

      fixture = TestBed.createComponent(RulesPageComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('Edit button should not be rendered for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRule = { ...mapped, triggered: true } as Rule;

          mockFacade.rules$.next([triggeredRule]);
          fixture.detectChanges();

          const editBtn: HTMLButtonElement | null =
            fixture.nativeElement.querySelector('.rules-table__action-button--edit');
          expect(editBtn).toBeNull();
        }),
        { numRuns: 20 },
      );
    });

    it('Delete button should not be rendered for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRule = { ...mapped, triggered: true } as Rule;

          mockFacade.rules$.next([triggeredRule]);
          fixture.detectChanges();

          const deleteBtn: HTMLButtonElement | null =
            fixture.nativeElement.querySelector('.rules-table__action-button--delete');
          expect(deleteBtn).toBeNull();
        }),
        { numRuns: 20 },
      );
    });

    it('showEditRule should not open form for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRule = { ...mapped, triggered: true } as Rule;

          // Reset component state
          component['currentView'] = 'none';
          component['editingRule'] = null;

          component['showEditRule'](triggeredRule);

          expect(component['currentView']).toBe('none');
        }),
        { numRuns: 20 },
      );
    });

    it('confirmDelete should not open dialog for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRule = { ...mapped, triggered: true } as Rule;

          // Reset component state
          component['isDeleteDialogOpen'] = false;
          component['ruleToDelete'] = null;

          component['confirmDelete'](triggeredRule);

          expect(component['isDeleteDialogOpen']).toBe(false);
        }),
        { numRuns: 20 },
      );
    });
  });
});

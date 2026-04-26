import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import * as fc from 'fast-check';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';
import { RuleApiResponse, mapRuleResponse } from '../../infrastructure/mappers/rule.mapper';

/**
 * Preservation Property Tests - Property 2
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 *
 * These tests confirm that non-triggered rules remain fully editable and deletable.
 * They are expected to PASS on unfixed code (baseline behavior to preserve).
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
 * Arbitrary that generates RuleApiResponse objects with triggered: false (or absent).
 * These represent non-triggered rules whose behavior must be preserved.
 */
const nonTriggeredRuleApiResponseArb: fc.Arbitrary<RuleApiResponse> = fc.record({
  id: fc.integer({ min: 1, max: 10000 }),
  ticker: fc.stringMatching(/^[A-Z]{4}[0-9]{1,2}$/),
  field: ruleFieldArb as fc.Arbitrary<string>,
  operator: comparisonOperatorArb as fc.Arbitrary<string>,
  targetValue: fc.float({ min: Math.fround(0.01), max: Math.fround(99999), noNaN: true }),
  groupId: fc.oneof(fc.constant(null), fc.integer({ min: 1, max: 1000 })),
  active: fc.boolean(),
  triggered: fc.constant(false),
});

/**
 * Variant that explicitly includes triggered: false on the API response object.
 */
const explicitNonTriggeredApiResponseArb = nonTriggeredRuleApiResponseArb.map((resp) => ({
  ...resp,
  triggered: false,
}));

describe('Preservation - Non-Triggered Rules Remain Fully Editable and Deletable', () => {
  /**
   * **Validates: Requirements 3.5**
   *
   * Mapper preservation property: For all non-triggered API responses,
   * mapRuleResponse produces a Rule with identical id, ticker, field,
   * operator, targetValue, groupId, active values.
   */
  describe('Mapper preservation', () => {
    it('maps all fields correctly for non-triggered rules (triggered absent)', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          expect(mapped.id).toBe(apiResponse.id);
          expect(mapped.ticker).toBe(apiResponse.ticker);
          expect(mapped.field).toBe(apiResponse.field);
          expect(mapped.operator).toBe(apiResponse.operator);
          expect(mapped.targetValue).toBe(apiResponse.targetValue);
          expect(mapped.groupId).toBe(apiResponse.groupId);
          expect(mapped.active).toBe(apiResponse.active);
        }),
        { numRuns: 50 },
      );
    });

    it('maps all fields correctly for explicitly non-triggered rules (triggered: false)', () => {
      fc.assert(
        fc.property(explicitNonTriggeredApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);

          expect(mapped.id).toBe(apiResponse.id);
          expect(mapped.ticker).toBe(apiResponse.ticker);
          expect(mapped.field).toBe(apiResponse.field);
          expect(mapped.operator).toBe(apiResponse.operator);
          expect(mapped.targetValue).toBe(apiResponse.targetValue);
          expect(mapped.groupId).toBe(apiResponse.groupId);
          expect(mapped.active).toBe(apiResponse.active);
        }),
        { numRuns: 50 },
      );
    });
  });

  /**
   * **Validates: Requirements 3.1, 3.2**
   *
   * Template preservation property: For all non-triggered rules,
   * Edit and Delete buttons are rendered without disabled attribute.
   */
  describe('Template preservation', () => {
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

    it('Edit button is enabled for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          mockFacade.rules$.next([mapped]);
          fixture.detectChanges();

          const editBtn: HTMLButtonElement | null =
            fixture.nativeElement.querySelector('.rules-table__action-button--edit');
          expect(editBtn).toBeTruthy();
          expect(editBtn!.disabled).toBe(false);
        }),
        { numRuns: 20 },
      );
    });

    it('Delete button is enabled for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          mockFacade.rules$.next([mapped]);
          fixture.detectChanges();

          const deleteBtn: HTMLButtonElement | null =
            fixture.nativeElement.querySelector('.rules-table__action-button--delete');
          expect(deleteBtn).toBeTruthy();
          expect(deleteBtn!.disabled).toBe(false);
        }),
        { numRuns: 20 },
      );
    });
  });

  /**
   * **Validates: Requirements 3.1, 3.3**
   *
   * Component preservation property: For all non-triggered rules,
   * showEditRule sets currentView to 'editRule' and editingRule to the rule.
   */
  describe('Component preservation - showEditRule', () => {
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

    it('showEditRule opens the form for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          // Reset component state
          component['currentView'] = 'none';
          component['editingRule'] = null;

          component['showEditRule'](mapped);

          expect(component['currentView']).toBe('editRule');
          expect(component['editingRule']).toEqual(mapped);
        }),
        { numRuns: 20 },
      );
    });
  });

  /**
   * **Validates: Requirements 3.2, 3.4**
   *
   * Component preservation property: For all non-triggered rules,
   * confirmDelete sets isDeleteDialogOpen to true and ruleToDelete to the rule.
   */
  describe('Component preservation - confirmDelete', () => {
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

    it('confirmDelete opens the dialog for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          // Reset component state
          component['isDeleteDialogOpen'] = false;
          component['ruleToDelete'] = null;

          component['confirmDelete'](mapped);

          expect(component['isDeleteDialogOpen']).toBe(true);
          expect(component['ruleToDelete']).toEqual(mapped);
        }),
        { numRuns: 20 },
      );
    });
  });
});

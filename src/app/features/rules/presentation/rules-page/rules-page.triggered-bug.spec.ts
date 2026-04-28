import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import * as fc from 'fast-check';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';
import { RuleApiResponse, mapRuleResponse } from '../../infrastructure/mappers/rule.mapper';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

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

class MockMatDialog {
  open = vi.fn().mockReturnValue({
    afterClosed: () => of(false),
  } as Partial<MatDialogRef<unknown>>);
}

function buildMockFacade() {
  return {
    loadRules: vi.fn(),
    createRule: vi.fn(),
    updateRule: vi.fn(),
    deleteRule: vi.fn(),
    createRuleGroup: vi.fn(),
    rules$: new BehaviorSubject<Rule[]>([]),
    ruleGroups$: new BehaviorSubject<Rule[]>([]),
    isLoading$: new BehaviorSubject<boolean>(false),
    error$: new BehaviorSubject<string | null>(null),
  };
}

describe('Bug Condition Exploration - Triggered Rules Allow Edit and Delete', () => {
  /**
   * **Validates: Requirements 1.1**
   *
   * Property 1a: Mapper preserves triggered field.
   * For any RuleApiResponse with triggered: true, mapRuleResponse must
   * produce a Rule with triggered === true.
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
   */
  describe('template and component guards', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;
    let mockFacade: ReturnType<typeof buildMockFacade>;
    let mockDialog: MockMatDialog;
    let dialogSpy: MockMatDialog;

    beforeEach(async () => {
      mockFacade = buildMockFacade();

      await TestBed.configureTestingModule({
        imports: [RulesPageComponent, NoopAnimationsModule],
        providers: [
          { provide: RulesFacade, useValue: mockFacade },
          { provide: NotificationService, useValue: { showSuccess: vi.fn(), showError: vi.fn() } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(RulesPageComponent);
      component = fixture.componentInstance;

      const componentDialog = fixture.debugElement.injector.get(MatDialog);
      vi.spyOn(componentDialog, 'open').mockReturnValue({
        afterClosed: () => of(false),
      } as ReturnType<MatDialog['open']>);
      dialogSpy = componentDialog as unknown as MockMatDialog;
      mockDialog = dialogSpy;

      fixture.detectChanges();
    });

    it('Edit button should not be rendered for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRule = { ...mapped, triggered: true } as Rule;

          mockFacade.rules$.next([triggeredRule]);
          fixture.detectChanges();

          const editBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            `button[aria-label="Edit rule for ${triggeredRule.ticker}"]`,
          );
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

          const deleteBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            `button[aria-label="Delete rule for ${triggeredRule.ticker}"]`,
          );
          expect(deleteBtn).toBeNull();
        }),
        { numRuns: 20 },
      );
    });

    it('openEditDialog should not open dialog for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRow = { ...mapped, triggered: true };

          mockDialog.open.mockClear();

          component['openEditDialog'](triggeredRow);

          expect(mockDialog.open).not.toHaveBeenCalled();
        }),
        { numRuns: 20 },
      );
    });

    it('confirmDelete should not open dialog for triggered rules', () => {
      fc.assert(
        fc.property(triggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse as unknown as RuleApiResponse);
          const triggeredRow = { ...mapped, triggered: true };

          mockDialog.open.mockClear();

          component['confirmDelete'](triggeredRow);

          expect(mockDialog.open).not.toHaveBeenCalled();
        }),
        { numRuns: 20 },
      );
    });
  });
});

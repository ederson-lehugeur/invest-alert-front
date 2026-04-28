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

const explicitNonTriggeredApiResponseArb = nonTriggeredRuleApiResponseArb.map((resp) => ({
  ...resp,
  triggered: false,
}));

class MockMatDialog {
  open = vi.fn().mockReturnValue({
    afterClosed: () => of(null),
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

async function createTestBed(
  mockFacade: ReturnType<typeof buildMockFacade>,
  mockDialog: MockMatDialog,
): Promise<{ component: RulesPageComponent; fixture: ComponentFixture<RulesPageComponent>; dialogSpy: MockMatDialog }> {
  await TestBed.configureTestingModule({
    imports: [RulesPageComponent, NoopAnimationsModule],
    providers: [
      { provide: RulesFacade, useValue: mockFacade },
      { provide: NotificationService, useValue: { showSuccess: vi.fn(), showError: vi.fn() } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(RulesPageComponent);
  const component = fixture.componentInstance;

  // Get the actual MatDialog instance from the component's injector and spy on it
  const componentDialog = fixture.debugElement.injector.get(MatDialog);
  vi.spyOn(componentDialog, 'open').mockReturnValue({
    afterClosed: () => of(null),
  } as ReturnType<MatDialog['open']>);
  const dialogSpy = componentDialog as unknown as MockMatDialog;

  fixture.detectChanges();
  return { component, fixture, dialogSpy };
}

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
   * Edit and Delete buttons are rendered.
   */
  describe('Template preservation', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;
    let mockFacade: ReturnType<typeof buildMockFacade>;

    beforeEach(async () => {
      mockFacade = buildMockFacade();
      ({ component, fixture } = await createTestBed(mockFacade, new MockMatDialog()));
    });

    it('Edit button is rendered for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          mockFacade.rules$.next([mapped]);
          fixture.detectChanges();

          const editBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            `button[aria-label="Edit rule for ${mapped.ticker}"]`,
          );
          expect(editBtn).toBeTruthy();
          expect(editBtn!.disabled).toBe(false);
        }),
        { numRuns: 20 },
      );
    });

    it('Delete button is rendered for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          mockFacade.rules$.next([mapped]);
          fixture.detectChanges();

          const deleteBtn: HTMLButtonElement | null = fixture.nativeElement.querySelector(
            `button[aria-label="Delete rule for ${mapped.ticker}"]`,
          );
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
   * openEditDialog opens a MatDialog.
   */
  describe('Component preservation - openEditDialog', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;
    let mockFacade: ReturnType<typeof buildMockFacade>;
    let dialogSpy: MockMatDialog;

    beforeEach(async () => {
      mockFacade = buildMockFacade();
      ({ component, fixture, dialogSpy } = await createTestBed(mockFacade, new MockMatDialog()));
    });

    it('openEditDialog opens the dialog for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          vi.mocked(dialogSpy.open).mockClear();

          component['openEditDialog']({
            id: mapped.id,
            ticker: mapped.ticker,
            field: mapped.field,
            operator: mapped.operator,
            targetValue: mapped.targetValue,
            active: mapped.active,
            triggered: mapped.triggered,
            groupId: mapped.groupId,
          });

          expect(dialogSpy.open).toHaveBeenCalled();
        }),
        { numRuns: 20 },
      );
    });
  });

  /**
   * **Validates: Requirements 3.2, 3.4**
   *
   * Component preservation property: For all non-triggered rules,
   * confirmDelete opens a MatDialog.
   */
  describe('Component preservation - confirmDelete', () => {
    let component: RulesPageComponent;
    let fixture: ComponentFixture<RulesPageComponent>;
    let mockFacade: ReturnType<typeof buildMockFacade>;
    let dialogSpy: MockMatDialog;

    beforeEach(async () => {
      mockFacade = buildMockFacade();
      ({ component, fixture, dialogSpy } = await createTestBed(mockFacade, new MockMatDialog()));
    });

    it('confirmDelete opens the dialog for non-triggered rules', () => {
      fc.assert(
        fc.property(nonTriggeredRuleApiResponseArb, (apiResponse) => {
          const mapped = mapRuleResponse(apiResponse);

          vi.mocked(dialogSpy.open).mockClear();

          component['confirmDelete']({
            id: mapped.id,
            ticker: mapped.ticker,
            field: mapped.field,
            operator: mapped.operator,
            targetValue: mapped.targetValue,
            active: mapped.active,
            triggered: mapped.triggered,
            groupId: mapped.groupId,
          });

          expect(dialogSpy.open).toHaveBeenCalled();
        }),
        { numRuns: 20 },
      );
    });
  });
});

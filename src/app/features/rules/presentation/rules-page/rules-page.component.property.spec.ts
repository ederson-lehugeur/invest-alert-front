// Feature: rule-group-registration
// Property 5: Facade is called with dialog result for any valid form data
// Property 6: Error notifications forward any error message
// Property 7: Rule Group column displays correct value for any rule
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import * as fc from 'fast-check';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';
import { RuleGroupFormData } from '../rule-group-form/rule-group-form.component';

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

function buildMockFacade() {
  return {
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
}

async function createTestBed(mockFacade: ReturnType<typeof buildMockFacade>, mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> }) {
  await TestBed.configureTestingModule({
    imports: [RulesPageComponent, NoopAnimationsModule],
    providers: [
      { provide: RulesFacade, useValue: mockFacade },
      { provide: NotificationService, useValue: mockNotification },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(RulesPageComponent);
  const component = fixture.componentInstance;

  const componentDialog = fixture.debugElement.injector.get(MatDialog);
  const dialogSpy = vi.spyOn(componentDialog, 'open').mockReturnValue({
    afterClosed: () => of(null),
  } as ReturnType<MatDialog['open']>);

  fixture.detectChanges();
  return { component, fixture, dialogSpy };
}

describe('RulesPageComponent - Property 5: Facade is called with dialog result for any valid form data', () => {
  let mockFacade: ReturnType<typeof buildMockFacade>;
  let mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
  let component: RulesPageComponent;
  let fixture: ComponentFixture<RulesPageComponent>;
  let dialogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    mockFacade = buildMockFacade();
    mockNotification = { showSuccess: vi.fn(), showError: vi.fn() };
    ({ component, fixture, dialogSpy } = await createTestBed(mockFacade, mockNotification));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('facade.createRuleGroup is called with structurally identical data for any valid RuleGroupFormData', () => {
    fc.assert(
      fc.property(validRuleGroupFormDataArb, (formData) => {
        mockFacade.createRuleGroup.mockClear();
        dialogSpy.mockReturnValue({ afterClosed: () => of(formData) });

        component['openCreateRuleGroupDialog']();

        expect(mockFacade.createRuleGroup).toHaveBeenCalledTimes(1);
        const calledWith = mockFacade.createRuleGroup.mock.calls[0][0] as RuleGroupFormData;
        expect(calledWith.ticker).toBe(formData.ticker);
        expect(calledWith.name).toBe(formData.name);
        expect(calledWith.rules).toEqual(formData.rules);
      }),
      { numRuns: 100 },
    );
  });
});

describe('RulesPageComponent - Property 6: Error notifications forward any error message', () => {
  let mockFacade: ReturnType<typeof buildMockFacade>;
  let mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
  let component: RulesPageComponent;
  let fixture: ComponentFixture<RulesPageComponent>;
  let dialogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    mockFacade = buildMockFacade();
    mockNotification = { showSuccess: vi.fn(), showError: vi.fn() };
    ({ component, fixture, dialogSpy } = await createTestBed(mockFacade, mockNotification));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('showError is called with the exact error string for any non-null error emitted by facade.error$ after createRuleGroup', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        validRuleGroupFormDataArb,
        (errorMessage, formData) => {
          mockNotification.showError.mockClear();
          dialogSpy.mockReturnValue({ afterClosed: () => of(formData) });
          mockFacade.error$.next(errorMessage);

          component['openCreateRuleGroupDialog']();

          expect(mockNotification.showError).toHaveBeenCalledWith(errorMessage);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('RulesPageComponent - Property 7: Rule Group column displays correct value for any rule', () => {
  let mockFacade: ReturnType<typeof buildMockFacade>;
  let mockNotification: { showSuccess: ReturnType<typeof vi.fn>; showError: ReturnType<typeof vi.fn> };
  let component: RulesPageComponent;
  let fixture: ComponentFixture<RulesPageComponent>;

  beforeEach(async () => {
    mockFacade = buildMockFacade();
    mockNotification = { showSuccess: vi.fn(), showError: vi.fn() };
    ({ component, fixture } = await createTestBed(mockFacade, mockNotification));
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  const ruleGroupArb = fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    ticker: fc.string({ minLength: 1, maxLength: 10 }),
    name: fc.string({ minLength: 1, maxLength: 50 }),
    rules: fc.constant([]),
  });

  it('resolveGroupName returns the group name when groupId matches a group in currentRuleGroups', () => {
    fc.assert(
      fc.property(
        fc.array(ruleGroupArb, { minLength: 1, maxLength: 5 }),
        fc.integer({ min: 0, max: 4 }),
        (groups, indexSeed) => {
          // Ensure unique IDs
          const uniqueGroups = groups.map((g, i) => ({ ...g, id: i + 1 }));
          const targetIndex = indexSeed % uniqueGroups.length;
          const targetGroup = uniqueGroups[targetIndex];

          mockFacade.ruleGroups$.next(uniqueGroups);
          fixture.detectChanges();

          const result = component['resolveGroupName'](targetGroup.id);
          expect(result).toBe(targetGroup.name);
        },
      ),
      { numRuns: 100 },
    );
  });

  it('resolveGroupName returns "-" when groupId is null', () => {
    fc.assert(
      fc.property(
        fc.array(ruleGroupArb, { minLength: 0, maxLength: 5 }),
        (groups) => {
          mockFacade.ruleGroups$.next(groups);
          fixture.detectChanges();

          const result = component['resolveGroupName'](null);
          expect(result).toBe('-');
        },
      ),
      { numRuns: 100 },
    );
  });

  it('resolveGroupName returns "-" when groupId does not match any group', () => {
    fc.assert(
      fc.property(
        fc.array(ruleGroupArb, { minLength: 0, maxLength: 5 }),
        (groups) => {
          // Use an ID that cannot match any group (groups have IDs 1-5 max in this arb)
          const unmatchedId = 99999;
          const uniqueGroups = groups.map((g, i) => ({ ...g, id: i + 1 }));

          mockFacade.ruleGroups$.next(uniqueGroups);
          fixture.detectChanges();

          const result = component['resolveGroupName'](unmatchedId);
          expect(result).toBe('-');
        },
      ),
      { numRuns: 100 },
    );
  });
});

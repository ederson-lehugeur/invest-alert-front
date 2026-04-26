import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { Rule } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';

describe('RulesPageComponent', () => {
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

  const mockRule: Rule = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: null,
    active: true,
    triggered: false,
  };

  const mockRuleGroup: RuleGroup = {
    id: 10,
    ticker: 'PETR4',
    name: 'Petrobras Alerts',
    rules: [mockRule],
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
      providers: [
        { provide: RulesFacade, useValue: mockFacade },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RulesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call loadRules on init', () => {
    expect(mockFacade.loadRules).toHaveBeenCalled();
  });

  it('should display loading indicator when loading', () => {
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const indicator = fixture.nativeElement.querySelector('app-loading-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should display error message when error exists', () => {
    mockFacade.error$.next('Something went wrong');
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });

  it('should render rules table when rules are available', () => {
    mockFacade.rules$.next([mockRule]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.rules-table__row');
    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll('td');
    expect(cells[0].textContent).toContain('PETR4');
    expect(cells[1].textContent).toContain('PRICE');
  });

  it('should display empty message when no rules', () => {
    mockFacade.rules$.next([]);
    fixture.detectChanges();

    const empty = fixture.nativeElement.querySelector('.rules-page__empty');
    expect(empty).toBeTruthy();
  });

  it('should render rule groups table when groups are available', () => {
    mockFacade.ruleGroups$.next([mockRuleGroup]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('.rule-groups-table__row');
    expect(rows.length).toBe(1);

    const cells = rows[0].querySelectorAll('td');
    expect(cells[0].textContent).toContain('Petrobras Alerts');
    expect(cells[1].textContent).toContain('PETR4');
  });

  it('should show rule form when Create Rule is clicked', () => {
    const createBtn = fixture.nativeElement.querySelector('.rules-page__button--primary');
    createBtn.click();
    fixture.detectChanges();

    const ruleForm = fixture.nativeElement.querySelector('app-rule-form');
    expect(ruleForm).toBeTruthy();
  });

  it('should show rule group form when Create Rule Group is clicked', () => {
    const createBtn = fixture.nativeElement.querySelector('.rules-page__button--secondary');
    createBtn.click();
    fixture.detectChanges();

    const groupForm = fixture.nativeElement.querySelector('app-rule-group-form');
    expect(groupForm).toBeTruthy();
  });

  it('should show confirm dialog when delete is clicked', () => {
    mockFacade.rules$.next([mockRule]);
    fixture.detectChanges();

    const deleteBtn = fixture.nativeElement.querySelector('.rules-table__action-button--delete');
    deleteBtn.click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('app-confirm-dialog');
    expect(dialog).toBeTruthy();
    expect(component['isDeleteDialogOpen']).toBe(true);
  });

  it('should call deleteRule on confirm', () => {
    component['ruleToDelete'] = mockRule;
    component['isDeleteDialogOpen'] = true;

    component['onDeleteConfirmed']();

    expect(mockFacade.deleteRule).toHaveBeenCalledWith(1);
    expect(component['isDeleteDialogOpen']).toBe(false);
  });

  it('should show edit form when edit button is clicked', () => {
    mockFacade.rules$.next([mockRule]);
    fixture.detectChanges();

    const editBtn = fixture.nativeElement.querySelector('.rules-table__action-button--edit');
    editBtn.click();
    fixture.detectChanges();

    const ruleForm = fixture.nativeElement.querySelector('app-rule-form');
    expect(ruleForm).toBeTruthy();
    expect(component['editingRule']).toEqual(mockRule);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RulesPageComponent } from './rules-page.component';
import { RulesFacade } from '../../application/rules.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { Rule } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';

class MockMatDialog {
  open = vi.fn().mockReturnValue({
    afterClosed: () => of(null),
  } as Partial<MatDialogRef<unknown>>);
}

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
  let mockNotificationService: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };
  let mockDialog: { open: ReturnType<typeof vi.spyOn> };

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

  const mockTriggeredRule: Rule = {
    ...mockRule,
    id: 2,
    triggered: true,
  };

  const mockRuleGroup: RuleGroup = {
    id: 10,
    ticker: 'PETR4',
    name: 'Petrobras Alerts',
    rules: [mockRule],
  };

  beforeEach(async () => {
    mockNotificationService = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };

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

    mockDialog = new MockMatDialog();

    await TestBed.configureTestingModule({
      imports: [RulesPageComponent, NoopAnimationsModule],
      providers: [
        { provide: RulesFacade, useValue: mockFacade },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: MatDialog, useValue: mockDialog },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RulesPageComponent);
    component = fixture.componentInstance;

    // Get the MatDialog instance from the component's own injector
    // (not the test module injector) and spy on it
    const componentDialog = fixture.debugElement.injector.get(MatDialog);
    vi.spyOn(componentDialog, 'open').mockReturnValue({
      afterClosed: () => of(null),
    } as ReturnType<MatDialog['open']>);
    mockDialog = componentDialog as unknown as MockMatDialog;

    fixture.detectChanges();
  });

  it('should call loadRules on init', () => {
    expect(mockFacade.loadRules).toHaveBeenCalled();
  });

  it('should display skeleton loaders while loading', () => {
    mockFacade.isLoading$.next(true);
    fixture.detectChanges();

    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton-loader');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should not display skeleton loaders when not loading', () => {
    const skeletons = fixture.nativeElement.querySelectorAll('app-skeleton-loader');
    expect(skeletons.length).toBe(0);
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

    const tables = fixture.nativeElement.querySelectorAll('app-reusable-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should render rule groups table when groups are available', () => {
    mockFacade.ruleGroups$.next([mockRuleGroup]);
    fixture.detectChanges();

    const tables = fixture.nativeElement.querySelectorAll('app-reusable-table');
    expect(tables.length).toBeGreaterThan(0);
  });

  it('should render Create Rule button', () => {
    const createBtn = fixture.nativeElement.querySelector('button[aria-label="Create new rule"]');
    expect(createBtn).toBeTruthy();
  });

  describe('Create Rule dialog', () => {
    it('should open AlertCreationDialogComponent when Create Rule is clicked', async () => {
      const { AlertCreationDialogComponent } = await import('../alert-creation-dialog/alert-creation-dialog.component');

      component['openCreateDialog']();

      expect(mockDialog.open).toHaveBeenCalledWith(
        AlertCreationDialogComponent,
        expect.objectContaining({ data: expect.objectContaining({ ruleGroups: [] }) }),
      );
    });

    it('should call facade.createRule when dialog returns form data', async () => {
      const formData = {
        ticker: 'VALE3',
        field: 'DIVIDEND_YIELD',
        operator: 'LESS_THAN',
        targetValue: 5.5,
        groupId: null,
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });

      component['openCreateDialog']();

      expect(mockFacade.createRule).toHaveBeenCalledWith(formData);
    });

    it('should not call facade.createRule when dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });

      component['openCreateDialog']();

      expect(mockFacade.createRule).not.toHaveBeenCalled();
    });
  });

  describe('Edit Rule dialog', () => {
    beforeEach(() => {
      mockFacade.rules$.next([mockRule]);
      fixture.detectChanges();
    });

    it('should open AlertCreationDialogComponent with rule data when edit is clicked', async () => {
      const { AlertCreationDialogComponent } = await import('../alert-creation-dialog/alert-creation-dialog.component');

      component['openEditDialog']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockDialog.open).toHaveBeenCalledWith(
        AlertCreationDialogComponent,
        expect.objectContaining({
          data: expect.objectContaining({ rule: expect.objectContaining({ id: mockRule.id }) }),
        }),
      );
    });

    it('should call facade.updateRule when edit dialog returns form data', () => {
      const formData = {
        ticker: 'PETR4',
        field: 'PRICE',
        operator: 'LESS_THAN',
        targetValue: 35.0,
        groupId: null,
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });

      component['openEditDialog']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockFacade.updateRule).toHaveBeenCalledWith(mockRule.id, {
        field: formData.field,
        operator: formData.operator,
        targetValue: formData.targetValue,
      });
    });

    it('should not call facade.updateRule when edit dialog is cancelled', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });

      component['openEditDialog']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockFacade.updateRule).not.toHaveBeenCalled();
    });
  });

  describe('Delete Rule dialog', () => {
    beforeEach(() => {
      mockFacade.rules$.next([mockRule]);
      fixture.detectChanges();
    });

    it('should open ConfirmDialogComponent when delete is clicked', async () => {
      const { ConfirmDialogComponent } = await import('../../../../shared/components/confirm-dialog/confirm-dialog.component');

      component['confirmDelete']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockDialog.open).toHaveBeenCalledWith(
        ConfirmDialogComponent,
        expect.objectContaining({ data: expect.objectContaining({ title: 'Delete Rule' }) }),
      );
    });

    it('should call facade.deleteRule when confirm dialog returns true', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });

      component['confirmDelete']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockFacade.deleteRule).toHaveBeenCalledWith(mockRule.id);
    });

    it('should not call facade.deleteRule when confirm dialog returns false', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component['confirmDelete']({
        id: mockRule.id,
        ticker: mockRule.ticker,
        field: mockRule.field,
        operator: mockRule.operator,
        targetValue: mockRule.targetValue,
        active: mockRule.active,
        triggered: mockRule.triggered,
        groupId: mockRule.groupId,
        groupName: '-',
      });

      expect(mockFacade.deleteRule).not.toHaveBeenCalled();
    });
  });

  describe('Triggered rules', () => {
    beforeEach(() => {
      mockFacade.rules$.next([mockTriggeredRule]);
      fixture.detectChanges();
      // Second detectChanges to ensure OnPush component re-renders after data update
      fixture.detectChanges();
    });

    it('should not show edit button for triggered rules', () => {
      const editBtn = fixture.nativeElement.querySelector(`button[aria-label="Edit rule for ${mockTriggeredRule.ticker}"]`);
      expect(editBtn).toBeFalsy();
    });

    it('should not show delete button for triggered rules', () => {
      const deleteBtn = fixture.nativeElement.querySelector(`button[aria-label="Delete rule for ${mockTriggeredRule.ticker}"]`);
      expect(deleteBtn).toBeFalsy();
    });

    it('should show triggered badge for triggered rules', () => {
      // Verify the rulesData contains the triggered rule
      expect(component['rulesData'].some((r) => r.triggered)).toBe(true);
    });

    it('should not open dialog when openEditDialog is called with triggered rule', () => {
      component['openEditDialog']({ ...mockTriggeredRule, groupName: '-' });
      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should not open dialog when confirmDelete is called with triggered rule', () => {
      component['confirmDelete']({ ...mockTriggeredRule, groupName: '-' });
      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('Notifications', () => {
    it('should show success notification after successful create', () => {
      const formData = {
        ticker: 'VALE3',
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 10,
        groupId: null,
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });
      mockFacade.error$.next(null);

      component['openCreateDialog']();

      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Rule created successfully.');
    });

    it('should show error notification when facade emits an error', () => {
      const formData = {
        ticker: 'VALE3',
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 10,
        groupId: null,
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });
      mockFacade.error$.next('API error occurred');

      component['openCreateDialog']();

      expect(mockNotificationService.showError).toHaveBeenCalledWith('API error occurred');
    });
  });

  describe('Create Rule Group dialog', () => {
    it('should render "Create Rule Group" button with aria-label="Create new rule group"', () => {
      const btn = fixture.nativeElement.querySelector('button[aria-label="Create new rule group"]');
      expect(btn).toBeTruthy();
    });

    it('should open RuleGroupCreationDialogComponent with width 560px when button is clicked', async () => {
      const { RuleGroupCreationDialogComponent } = await import('../rule-group-creation-dialog/rule-group-creation-dialog.component');

      component['openCreateRuleGroupDialog']();

      expect(mockDialog.open).toHaveBeenCalledWith(
        RuleGroupCreationDialogComponent,
        expect.objectContaining({ width: '560px' }),
      );
    });

    it('should call facade.createRuleGroup with dialog result when dialog closes with data', () => {
      const formData = {
        ticker: 'VALE3',
        name: 'Vale Alerts',
        rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 80 }],
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });

      component['openCreateRuleGroupDialog']();

      expect(mockFacade.createRuleGroup).toHaveBeenCalledWith(formData);
    });

    it('should not call facade.createRuleGroup when dialog is cancelled (result is undefined)', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

      component['openCreateRuleGroupDialog']();

      expect(mockFacade.createRuleGroup).not.toHaveBeenCalled();
    });

    it('should not call facade.createRuleGroup when dialog is cancelled (result is null)', () => {
      mockDialog.open.mockReturnValue({ afterClosed: () => of(null) });

      component['openCreateRuleGroupDialog']();

      expect(mockFacade.createRuleGroup).not.toHaveBeenCalled();
    });

    it('should show success notification "Rule group created successfully." when error$ emits null after createRuleGroup', () => {
      const formData = {
        ticker: 'VALE3',
        name: 'Vale Alerts',
        rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 80 }],
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });
      mockFacade.error$.next(null);

      component['openCreateRuleGroupDialog']();

      expect(mockNotificationService.showSuccess).toHaveBeenCalledWith('Rule group created successfully.');
    });

    it('should show error notification with error string when error$ emits a non-null value after createRuleGroup', () => {
      const formData = {
        ticker: 'VALE3',
        name: 'Vale Alerts',
        rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 80 }],
      };
      mockDialog.open.mockReturnValue({ afterClosed: () => of(formData) });
      mockFacade.error$.next('Rule group creation failed');

      component['openCreateRuleGroupDialog']();

      expect(mockNotificationService.showError).toHaveBeenCalledWith('Rule group creation failed');
    });

    it('should have rulesColumns entry with key "groupName" and header "Rule Group"', () => {
      const groupNameCol = component['rulesColumns'].find((c) => c.key === 'groupName');
      expect(groupNameCol).toBeTruthy();
      expect(groupNameCol?.header).toBe('Rule Group');
    });
  });

  describe('resolveGroupName', () => {
    beforeEach(() => {
      mockFacade.ruleGroups$.next([mockRuleGroup]);
      fixture.detectChanges();
    });

    it('should display the group name when groupId matches a loaded group', () => {
      mockFacade.rules$.next([{ ...mockRule, groupId: mockRuleGroup.id }]);
      fixture.detectChanges();

      const row = component['rulesData'].find((r) => r.id === mockRule.id);
      expect(row?.groupName).toBe(mockRuleGroup.name);
    });

    it('should display "-" when groupId is null', () => {
      mockFacade.rules$.next([{ ...mockRule, groupId: null }]);
      fixture.detectChanges();

      const row = component['rulesData'].find((r) => r.id === mockRule.id);
      expect(row?.groupName).toBe('-');
    });

    it('should display "-" when groupId does not match any loaded group', () => {
      mockFacade.rules$.next([{ ...mockRule, groupId: 9999 }]);
      fixture.detectChanges();

      const row = component['rulesData'].find((r) => r.id === mockRule.id);
      expect(row?.groupName).toBe('-');
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RulesFacade } from './rules.facade';
import { RulesApiService } from '../infrastructure/rules-api.service';
import { RuleGroupsApiService } from '../infrastructure/rule-groups-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Rule } from '../domain/models/rule.model';
import { RuleGroup } from '../domain/models/rule-group.model';

describe('RulesFacade', () => {
  let facade: RulesFacade;
  let rulesApi: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let ruleGroupsApi: {
    list: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  let errorHandler: { extractMessage: ReturnType<typeof vi.fn> };

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

  beforeEach(() => {
    rulesApi = {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    ruleGroupsApi = {
      list: vi.fn(),
      create: vi.fn(),
    };

    errorHandler = {
      extractMessage: vi.fn().mockReturnValue('Something went wrong'),
    };

    TestBed.configureTestingModule({
      providers: [
        RulesFacade,
        { provide: RulesApiService, useValue: rulesApi },
        { provide: RuleGroupsApiService, useValue: ruleGroupsApi },
        { provide: ErrorHandlerService, useValue: errorHandler },
      ],
    });

    facade = TestBed.inject(RulesFacade);
  });

  describe('loadRules', () => {
    it('should load rules and rule groups concurrently on success', () => {
      rulesApi.list.mockReturnValue(of([mockRule]));
      ruleGroupsApi.list.mockReturnValue(of([mockRuleGroup]));

      let rules: Rule[] = [];
      let ruleGroups: RuleGroup[] = [];
      facade.rules$.subscribe((v) => (rules = v));
      facade.ruleGroups$.subscribe((v) => (ruleGroups = v));

      facade.loadRules();

      expect(rulesApi.list).toHaveBeenCalled();
      expect(ruleGroupsApi.list).toHaveBeenCalled();
      expect(rules).toEqual([mockRule]);
      expect(ruleGroups).toEqual([mockRuleGroup]);
    });

    it('should set isLoading to false after successful load', () => {
      rulesApi.list.mockReturnValue(of([mockRule]));
      ruleGroupsApi.list.mockReturnValue(of([mockRuleGroup]));

      let isLoading = true;
      facade.isLoading$.subscribe((v) => (isLoading = v));

      facade.loadRules();

      expect(isLoading).toBe(false);
    });

    it('should set error on failure', () => {
      const httpError = new HttpErrorResponse({ status: 500, error: null });
      rulesApi.list.mockReturnValue(throwError(() => httpError));
      ruleGroupsApi.list.mockReturnValue(of([]));

      let error: string | null = null;
      facade.error$.subscribe((v) => (error = v));

      facade.loadRules();

      expect(error).toBe('Something went wrong');
    });
  });

  describe('createRule', () => {
    it('should add new rule to state on success', () => {
      rulesApi.list.mockReturnValue(of([]));
      ruleGroupsApi.list.mockReturnValue(of([]));
      facade.loadRules();

      const newRule: Rule = { ...mockRule, id: 2 };
      rulesApi.create.mockReturnValue(of(newRule));

      let rules: Rule[] = [];
      facade.rules$.subscribe((v) => (rules = v));

      facade.createRule({
        ticker: 'PETR4',
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 40.0,
      });

      expect(rules).toEqual([newRule]);
    });

    it('should set error on failure', () => {
      const httpError = new HttpErrorResponse({ status: 400, error: null });
      rulesApi.create.mockReturnValue(throwError(() => httpError));

      let error: string | null = null;
      facade.error$.subscribe((v) => (error = v));

      facade.createRule({
        ticker: 'PETR4',
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 40.0,
      });

      expect(error).toBe('Something went wrong');
    });
  });

  describe('updateRule', () => {
    it('should update rule in state on success', () => {
      rulesApi.list.mockReturnValue(of([mockRule]));
      ruleGroupsApi.list.mockReturnValue(of([]));
      facade.loadRules();

      const updated: Rule = { ...mockRule, targetValue: 50.0 };
      rulesApi.update.mockReturnValue(of(updated));

      let rules: Rule[] = [];
      facade.rules$.subscribe((v) => (rules = v));

      facade.updateRule(1, {
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 50.0,
      });

      expect(rules[0].targetValue).toBe(50.0);
    });
  });

  describe('deleteRule', () => {
    it('should remove rule from state on success', () => {
      rulesApi.list.mockReturnValue(of([mockRule]));
      ruleGroupsApi.list.mockReturnValue(of([]));
      facade.loadRules();

      rulesApi.delete.mockReturnValue(of(undefined));

      let rules: Rule[] = [mockRule];
      facade.rules$.subscribe((v) => (rules = v));

      facade.deleteRule(1);

      expect(rules).toEqual([]);
    });
  });

  describe('createRuleGroup', () => {
    it('should add new rule group to state on success', () => {
      rulesApi.list.mockReturnValue(of([]));
      ruleGroupsApi.list.mockReturnValue(of([]));
      facade.loadRules();

      ruleGroupsApi.create.mockReturnValue(of(mockRuleGroup));

      let ruleGroups: RuleGroup[] = [];
      facade.ruleGroups$.subscribe((v) => (ruleGroups = v));

      facade.createRuleGroup({
        ticker: 'PETR4',
        name: 'Petrobras Alerts',
        rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 40.0 }],
      });

      expect(ruleGroups).toEqual([mockRuleGroup]);
    });
  });
});

import {
  RuleGroupApiResponse,
  mapRuleGroupResponse,
  mapRuleGroupToApiFormat,
} from './rule-group.mapper';
import { RuleApiResponse } from './rule.mapper';

describe('rule-group.mapper', () => {
  const ruleApi: RuleApiResponse = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: 10,
    active: true,
    triggered: false,
  };

  const apiResponse: RuleGroupApiResponse = {
    id: 10,
    ticker: 'PETR4',
    name: 'Petrobras Alerts',
    rules: [ruleApi],
  };

  describe('mapRuleGroupResponse', () => {
    it('should convert API response to RuleGroup domain model with nested rules', () => {
      const group = mapRuleGroupResponse(apiResponse);

      expect(group.id).toBe(10);
      expect(group.ticker).toBe('PETR4');
      expect(group.name).toBe('Petrobras Alerts');
      expect(group.rules).toHaveLength(1);
      expect(group.rules[0].id).toBe(1);
      expect(group.rules[0].field).toBe('PRICE');
    });

    it('should handle empty rules array', () => {
      const empty: RuleGroupApiResponse = { ...apiResponse, rules: [] };
      const group = mapRuleGroupResponse(empty);
      expect(group.rules).toHaveLength(0);
    });
  });

  describe('mapRuleGroupToApiFormat', () => {
    it('should convert RuleGroup domain model to API format', () => {
      const group = mapRuleGroupResponse(apiResponse);
      const result = mapRuleGroupToApiFormat(group);

      expect(result.id).toBe(10);
      expect(result.ticker).toBe('PETR4');
      expect(result.name).toBe('Petrobras Alerts');
      expect(result.rules).toHaveLength(1);
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapRuleGroupResponse then mapRuleGroupToApiFormat', () => {
      const roundTripped = mapRuleGroupToApiFormat(mapRuleGroupResponse(apiResponse));
      expect(roundTripped).toEqual(apiResponse);
    });
  });
});

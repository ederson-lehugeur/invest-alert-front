import { RuleApiResponse, mapRuleResponse, mapRuleToApiFormat } from './rule.mapper';
import { Rule } from '../../domain/models/rule.model';

describe('rule.mapper', () => {
  const apiResponse: RuleApiResponse = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: null,
    active: true,
    triggered: false,
  };

  describe('mapRuleResponse', () => {
    it('should convert API response to Rule domain model', () => {
      const rule = mapRuleResponse(apiResponse);

      expect(rule.id).toBe(1);
      expect(rule.ticker).toBe('PETR4');
      expect(rule.field).toBe('PRICE');
      expect(rule.operator).toBe('GREATER_THAN');
      expect(rule.targetValue).toBe(40.0);
      expect(rule.groupId).toBeNull();
      expect(rule.active).toBe(true);
    });

    it('should map groupId when present', () => {
      const withGroup: RuleApiResponse = { ...apiResponse, groupId: 5 };
      const rule = mapRuleResponse(withGroup);
      expect(rule.groupId).toBe(5);
    });
  });

  describe('mapRuleToApiFormat', () => {
    it('should convert Rule domain model to API format', () => {
      const rule: Rule = {
        id: 2,
        ticker: 'VALE3',
        field: 'DIVIDEND_YIELD',
        operator: 'LESS_THAN',
        targetValue: 5.0,
        groupId: 3,
        active: false,
        triggered: false,
      };

      const result = mapRuleToApiFormat(rule);

      expect(result.id).toBe(2);
      expect(result.ticker).toBe('VALE3');
      expect(result.field).toBe('DIVIDEND_YIELD');
      expect(result.operator).toBe('LESS_THAN');
      expect(result.targetValue).toBe(5.0);
      expect(result.groupId).toBe(3);
      expect(result.active).toBe(false);
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapRuleResponse then mapRuleToApiFormat', () => {
      const roundTripped = mapRuleToApiFormat(mapRuleResponse(apiResponse));
      expect(roundTripped).toEqual(apiResponse);
    });
  });
});

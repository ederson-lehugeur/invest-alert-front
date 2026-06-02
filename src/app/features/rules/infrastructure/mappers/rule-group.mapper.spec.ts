import fc from 'fast-check';
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
    indicatorType: 'PRICE',
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
      expect(group.rules[0].indicatorCode).toBe('PRICE');
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
      expect(result.rules[0].indicatorType).toBe('PRICE');
    });
  });

  describe('round-trip', () => {
    it('should produce equivalent object after mapRuleGroupResponse then mapRuleGroupToApiFormat', () => {
      const roundTripped = mapRuleGroupToApiFormat(mapRuleGroupResponse(apiResponse));
      expect(roundTripped).toEqual(apiResponse);
    });

    /**
     * **Validates: Requirements 4.3**
     *
     * Property 3: Rule Group Mapper Round-Trip
     *
     * For any valid RuleGroupApiResponse (with id a positive integer, ticker and name
     * non-empty strings, and rules a list of zero or more valid RuleApiResponse objects),
     * applying mapRuleGroupResponse followed by mapRuleGroupToApiFormat produces an object
     * deeply equal to the original response.
     */
    it('should satisfy round-trip property for any valid RuleGroupApiResponse', () => {
      const operatorArb = fc.constantFrom(
        'GREATER_THAN',
        'LESS_THAN',
        'GREATER_THAN_OR_EQUAL',
        'LESS_THAN_OR_EQUAL',
        'EQUAL',
      );

      const ruleApiResponseArb = fc.record({
        id: fc.nat({ max: 100000 }),
        ticker: fc.string({ minLength: 1, maxLength: 10 }),
        indicatorType: fc.string({ minLength: 1, maxLength: 30 }),
        operator: operatorArb,
        targetValue: fc.double({ min: -1e6, max: 1e6, noNaN: true, noDefaultInfinity: true }),
        groupId: fc.option(fc.nat({ max: 100000 }), { nil: null }),
        active: fc.boolean(),
        triggered: fc.boolean(),
      });

      const ruleGroupApiResponseArb = fc.record({
        id: fc.nat({ max: 100000 }),
        ticker: fc.string({ minLength: 1, maxLength: 10 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        rules: fc.array(ruleApiResponseArb, { minLength: 0, maxLength: 5 }),
      });

      fc.assert(
        fc.property(ruleGroupApiResponseArb, (response) => {
          const roundTripped = mapRuleGroupToApiFormat(
            mapRuleGroupResponse(response as RuleGroupApiResponse),
          );
          expect(roundTripped).toEqual(response);
        }),
        { numRuns: 100 },
      );
    });
  });
});

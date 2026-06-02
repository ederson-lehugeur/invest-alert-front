import fc from 'fast-check';
import { RuleApiResponse, mapRuleResponse, mapRuleToApiFormat } from './rule.mapper';
import { Rule } from '../../domain/models/rule.model';

describe('rule.mapper', () => {
  const apiResponse: RuleApiResponse = {
    id: 1,
    ticker: 'PETR4',
    indicatorType: 'PRICE',
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
      expect(rule.indicatorCode).toBe('PRICE');
      expect(rule.operator).toBe('GREATER_THAN');
      expect(rule.targetValue).toBe(40.0);
      expect(rule.groupId).toBeNull();
      expect(rule.active).toBe(true);
      expect(rule.triggered).toBe(false);
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
        indicatorCode: 'DIVIDEND_YIELD',
        operator: 'LESS_THAN',
        targetValue: 5.0,
        groupId: 3,
        active: false,
        triggered: false,
      };

      const result = mapRuleToApiFormat(rule);

      expect(result.id).toBe(2);
      expect(result.ticker).toBe('VALE3');
      expect(result.indicatorType).toBe('DIVIDEND_YIELD');
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

    /**
     * **Validates: Requirements 4.1, 4.2, 4.3**
     *
     * Property 2: Rule Mapper Round-Trip
     *
     * For any valid RuleApiResponse, applying mapRuleResponse followed by
     * mapRuleToApiFormat produces an object deeply equal to the original response.
     */
    it('should satisfy round-trip property for any valid RuleApiResponse', () => {
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

      fc.assert(
        fc.property(ruleApiResponseArb, (response) => {
          const roundTripped = mapRuleToApiFormat(mapRuleResponse(response as RuleApiResponse));
          expect(roundTripped).toEqual(response);
        }),
        { numRuns: 100 },
      );
    });
  });
});

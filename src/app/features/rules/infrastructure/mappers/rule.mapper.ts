import { Rule } from '../../domain/models/rule.model';

export interface RuleApiResponse {
  readonly id: number;
  readonly ticker: string;
  readonly field: string;
  readonly operator: string;
  readonly targetValue: number;
  readonly groupId: number | null;
  readonly active: boolean;
  readonly triggered: boolean;
}

export function mapRuleResponse(response: RuleApiResponse): Rule {
  return {
    id: response.id,
    ticker: response.ticker,
    field: response.field as Rule['field'],
    operator: response.operator as Rule['operator'],
    targetValue: response.targetValue,
    groupId: response.groupId,
    active: response.active,
    triggered: response.triggered ?? false,
  };
}

export function mapRuleToApiFormat(rule: Rule): RuleApiResponse {
  return {
    id: rule.id,
    ticker: rule.ticker,
    field: rule.field,
    operator: rule.operator,
    targetValue: rule.targetValue,
    groupId: rule.groupId,
    active: rule.active,
    triggered: rule.triggered,
  };
}

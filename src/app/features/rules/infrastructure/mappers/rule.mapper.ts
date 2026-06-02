import { ComparisonOperator, Rule } from '../../domain/models/rule.model';

export interface RuleApiResponse {
  readonly id: number;
  readonly ticker: string;
  readonly indicatorType: string;
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
    indicatorCode: response.indicatorType,
    operator: response.operator as ComparisonOperator,
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
    indicatorType: rule.indicatorCode,
    operator: rule.operator,
    targetValue: rule.targetValue,
    groupId: rule.groupId,
    active: rule.active,
    triggered: rule.triggered,
  };
}

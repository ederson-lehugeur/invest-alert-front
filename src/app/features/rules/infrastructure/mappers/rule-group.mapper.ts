import { RuleGroup } from '../../domain/models/rule-group.model';
import { RuleApiResponse, mapRuleResponse, mapRuleToApiFormat } from './rule.mapper';

export interface RuleGroupApiResponse {
  readonly id: number;
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly RuleApiResponse[];
}

export function mapRuleGroupResponse(response: RuleGroupApiResponse): RuleGroup {
  return {
    id: response.id,
    ticker: response.ticker,
    name: response.name,
    rules: response.rules.map(mapRuleResponse),
  };
}

export function mapRuleGroupToApiFormat(group: RuleGroup): RuleGroupApiResponse {
  return {
    id: group.id,
    ticker: group.ticker,
    name: group.name,
    rules: group.rules.map(mapRuleToApiFormat),
  };
}

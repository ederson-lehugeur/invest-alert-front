import { Observable } from 'rxjs';
import { ComparisonOperator, RuleField } from '../models/rule.model';
import { RuleGroup } from '../models/rule-group.model';

export interface CreateRuleGroupCommand {
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly {
    readonly field: RuleField;
    readonly operator: ComparisonOperator;
    readonly targetValue: number;
  }[];
}

export interface RuleGroupRepository {
  list(): Observable<RuleGroup[]>;
  create(command: CreateRuleGroupCommand): Observable<RuleGroup>;
}

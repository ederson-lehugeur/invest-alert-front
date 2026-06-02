import { Observable } from 'rxjs';
import { ComparisonOperator } from '../models/rule.model';
import { RuleGroup } from '../models/rule-group.model';

export interface CreateRuleGroupCommand {
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly {
    readonly indicatorCode: string;
    readonly operator: ComparisonOperator;
    readonly targetValue: number;
  }[];
}

export interface RuleGroupRepository {
  list(): Observable<RuleGroup[]>;
  create(command: CreateRuleGroupCommand): Observable<RuleGroup>;
}

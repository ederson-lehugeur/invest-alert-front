import { Observable } from 'rxjs';
import { ComparisonOperator, Rule } from '../models/rule.model';

export interface CreateRuleCommand {
  readonly ticker: string;
  readonly indicatorCode: string;
  readonly operator: ComparisonOperator;
  readonly targetValue: number;
  readonly groupId?: number | null;
}

export interface UpdateRuleCommand {
  readonly indicatorCode: string;
  readonly operator: ComparisonOperator;
  readonly targetValue: number;
}

export interface RuleRepository {
  list(): Observable<Rule[]>;
  create(command: CreateRuleCommand): Observable<Rule>;
  update(id: number, command: UpdateRuleCommand): Observable<Rule>;
  delete(id: number): Observable<void>;
}

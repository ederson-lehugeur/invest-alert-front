export type ComparisonOperator =
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'LESS_THAN_OR_EQUAL'
  | 'EQUAL';

export interface Rule {
  readonly id: number;
  readonly ticker: string;
  readonly indicatorCode: string;
  readonly operator: ComparisonOperator;
  readonly targetValue: number;
  readonly groupId: number | null;
  readonly active: boolean;
  readonly triggered: boolean;
}

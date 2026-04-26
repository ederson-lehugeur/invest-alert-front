import { Rule } from './rule.model';

export interface RuleGroup {
  readonly id: number;
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly Rule[];
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MaterialModule } from '../../../../shared/material/material.module';
import { RuleField, ComparisonOperator } from '../../domain/models/rule.model';

export interface RuleGroupFormData {
  readonly ticker: string;
  readonly name: string;
  readonly rules: readonly {
    readonly field: RuleField;
    readonly operator: ComparisonOperator;
    readonly targetValue: number;
  }[];
}

@Component({
  selector: 'app-rule-group-form',
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule],
  templateUrl: './rule-group-form.component.html',
  styleUrl: './rule-group-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleGroupFormComponent {
  @Input() error: string | null = null;
  @Output() readonly formSubmit = new EventEmitter<RuleGroupFormData>();
  @Output() readonly formCancel = new EventEmitter<void>();

  readonly fieldOptions: RuleField[] = ['PRICE', 'DIVIDEND_YIELD', 'P_VP'];
  readonly operatorOptions: ComparisonOperator[] = [
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_THAN_OR_EQUAL',
    'LESS_THAN_OR_EQUAL',
    'EQUAL',
  ];

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      ticker: ['', Validators.required],
      name: ['', Validators.required],
      rules: this.fb.array([this.createRuleEntry()]),
    });
  }

  get rulesArray(): FormArray {
    return this.form.get('rules') as FormArray;
  }

  addRule(): void {
    this.rulesArray.push(this.createRuleEntry());
  }

  removeRule(index: number): void {
    if (this.rulesArray.length > 1) {
      this.rulesArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.formSubmit.emit({
      ticker: raw.ticker,
      name: raw.name,
      rules: raw.rules,
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private createRuleEntry(): FormGroup {
    return this.fb.group({
      field: ['PRICE' as RuleField, Validators.required],
      operator: ['GREATER_THAN' as ComparisonOperator, Validators.required],
      targetValue: [null as number | null, [Validators.required]],
    });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';

export interface RuleFormData {
  readonly ticker: string;
  readonly field: RuleField;
  readonly operator: ComparisonOperator;
  readonly targetValue: number;
}

@Component({
  selector: 'app-rule-form',
  standalone: true,
  imports: [ReactiveFormsModule, ErrorMessageComponent],
  templateUrl: './rule-form.component.html',
  styleUrl: './rule-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleFormComponent implements OnChanges {
  @Input() rule: Rule | null = null;
  @Input() error: string | null = null;
  @Output() readonly formSubmit = new EventEmitter<RuleFormData>();
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
      field: ['PRICE' as RuleField, Validators.required],
      operator: ['GREATER_THAN' as ComparisonOperator, Validators.required],
      targetValue: [null as number | null, [Validators.required]],
    });
  }

  get isEditMode(): boolean {
    return this.rule !== null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rule'] && this.rule) {
      this.form.patchValue({
        ticker: this.rule.ticker,
        field: this.rule.field,
        operator: this.rule.operator,
        targetValue: this.rule.targetValue,
      });
      this.form.get('ticker')?.disable();
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
      field: raw.field,
      operator: raw.operator,
      targetValue: raw.targetValue,
    });
  }

  onCancel(): void {
    this.formCancel.emit();
  }
}

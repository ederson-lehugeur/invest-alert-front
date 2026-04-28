import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { Rule, RuleField, ComparisonOperator } from '../../domain/models/rule.model';

export interface AlertCreationDialogData {
  readonly rule?: Rule;
}

@Component({
  selector: 'app-alert-creation-dialog',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './alert-creation-dialog.component.html',
  styleUrl: './alert-creation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertCreationDialogComponent {
  readonly data = inject<AlertCreationDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AlertCreationDialogComponent>);
  private readonly fb = inject(FormBuilder);

  readonly isSubmitting = signal(false);
  readonly isEditMode: boolean;

  readonly fieldOptions: RuleField[] = ['PRICE', 'DIVIDEND_YIELD', 'P_VP'];
  readonly operatorOptions: ComparisonOperator[] = [
    'GREATER_THAN',
    'LESS_THAN',
    'GREATER_THAN_OR_EQUAL',
    'LESS_THAN_OR_EQUAL',
    'EQUAL',
  ];

  readonly form: FormGroup;

  constructor() {
    this.isEditMode = !!this.data.rule;

    this.form = this.fb.group({
      ticker: [this.data.rule?.ticker ?? '', Validators.required],
      field: [this.data.rule?.field ?? ('PRICE' as RuleField), Validators.required],
      operator: [this.data.rule?.operator ?? ('GREATER_THAN' as ComparisonOperator), Validators.required],
      targetValue: [this.data.rule?.targetValue ?? (null as number | null), Validators.required],
    });

    if (this.isEditMode) {
      this.form.get('ticker')?.disable();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();
    this.dialogRef.close({
      ticker: raw.ticker,
      field: raw.field,
      operator: raw.operator,
      targetValue: raw.targetValue,
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

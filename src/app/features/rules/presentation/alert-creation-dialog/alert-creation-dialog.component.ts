import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { Rule, ComparisonOperator } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';
import { formatIndicatorCode } from '../../../../shared/utils/indicator-format.util';

export interface AlertCreationDialogData {
  readonly rule?: Rule;
  readonly ruleGroups?: readonly RuleGroup[];
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

  readonly indicatorOptions: string[] = ['PRICE', 'DIVIDEND_YIELD', 'PVP', 'PL', 'ROE'];
  readonly formatIndicator = formatIndicatorCode;
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
      indicatorCode: [this.data.rule?.indicatorCode ?? 'PRICE', Validators.required],
      operator: [this.data.rule?.operator ?? ('GREATER_THAN' as ComparisonOperator), Validators.required],
      targetValue: [this.data.rule?.targetValue ?? (null as number | null), Validators.required],
      groupId: [this.data.rule?.groupId ?? (null as number | null)],
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
      indicatorCode: raw.indicatorCode,
      operator: raw.operator,
      targetValue: raw.targetValue,
      groupId: raw.groupId ?? null,
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

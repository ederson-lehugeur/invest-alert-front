import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../../../shared/material/material.module';
import { RuleGroupFormComponent, RuleGroupFormData } from '../rule-group-form/rule-group-form.component';

@Component({
  selector: 'app-rule-group-creation-dialog',
  standalone: true,
  imports: [MaterialModule, RuleGroupFormComponent],
  templateUrl: './rule-group-creation-dialog.component.html',
  styleUrl: './rule-group-creation-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RuleGroupCreationDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<RuleGroupCreationDialogComponent>);

  onFormSubmit(data: RuleGroupFormData): void {
    this.dialogRef.close(data);
  }

  onFormCancel(): void {
    this.dialogRef.close();
  }
}

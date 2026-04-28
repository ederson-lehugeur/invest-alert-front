import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RulesFacade } from '../../application/rules.facade';
import { NotificationService } from '../../../../core/services/notification.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CellDefDirective } from '../../../../shared/components/reusable-table/cell-def.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  AlertCreationDialogComponent,
  AlertCreationDialogData,
} from '../alert-creation-dialog/alert-creation-dialog.component';
import { RuleGroupCreationDialogComponent } from '../rule-group-creation-dialog/rule-group-creation-dialog.component';
import { Rule } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';
import { ColumnConfig } from '../../../../shared/components/reusable-table/column-config.model';

interface RuleRow {
  readonly id: number;
  readonly ticker: string;
  readonly field: string;
  readonly operator: string;
  readonly targetValue: number;
  readonly active: boolean;
  readonly triggered: boolean;
  readonly groupId: number | null;
  readonly groupName: string;
}

interface RuleGroupRow {
  readonly id: number;
  readonly name: string;
  readonly ticker: string;
  readonly rulesCount: number;
}

@Component({
  selector: 'app-rules-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MaterialModule,
    ReusableTableComponent,
    CellDefDirective,
    SkeletonLoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './rules-page.component.html',
  styleUrl: './rules-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesPageComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(RulesFacade);
  private readonly dialog = inject(MatDialog);
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  protected rulesData: RuleRow[] = [];
  protected ruleGroupsData: RuleGroupRow[] = [];
  protected currentRuleGroups: RuleGroup[] = [];

  protected readonly rulesColumns: ColumnConfig[] = [
    { key: 'ticker', header: 'Ticker' },
    { key: 'field', header: 'Field' },
    { key: 'operator', header: 'Operator' },
    { key: 'targetValue', header: 'Target Value' },
    { key: 'groupName', header: 'Rule Group' },
    { key: 'active', header: 'Active' },
    { key: 'actions', header: 'Actions' },
  ];

  protected readonly ruleGroupsColumns: ColumnConfig[] = [
    { key: 'name', header: 'Name' },
    { key: 'ticker', header: 'Ticker' },
    { key: 'rulesCount', header: 'Rules Count' },
  ];

  protected readonly trackRuleById = (_index: number, row: RuleRow): number => row.id;
  protected readonly trackGroupById = (_index: number, row: RuleGroupRow): number => row.id;

  ngOnInit(): void {
    this.facade.loadRules();

    this.facade.rules$.pipe(takeUntil(this.destroy$)).subscribe((rules) => {
      this.rulesData = rules.map((r) => ({
        id: r.id,
        ticker: r.ticker,
        field: r.field,
        operator: r.operator,
        targetValue: r.targetValue,
        active: r.active,
        triggered: r.triggered,
        groupId: r.groupId,
        groupName: this.resolveGroupName(r.groupId),
      }));
      this.cdr.markForCheck();
    });

    this.facade.ruleGroups$.pipe(takeUntil(this.destroy$)).subscribe((groups) => {
      this.currentRuleGroups = groups;
      this.ruleGroupsData = groups.map((g) => ({
        id: g.id,
        name: g.name,
        ticker: g.ticker,
        rulesCount: g.rules.length,
      }));
      // Re-map rulesData so groupName stays in sync when groups load after rules
      this.rulesData = this.rulesData.map((r) => ({
        ...r,
        groupName: this.resolveGroupName(r.groupId),
      }));
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected openCreateDialog(): void {
    const data: AlertCreationDialogData = { ruleGroups: this.currentRuleGroups };
    const dialogRef = this.dialog.open(AlertCreationDialogComponent, {
      data,
      width: '480px',
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (!result) return;
      this.facade.createRule(result);
      this.watchNextError('Rule created successfully.');
    });
  }

  protected openCreateRuleGroupDialog(): void {
    const dialogRef = this.dialog.open(RuleGroupCreationDialogComponent, {
      width: '560px',
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (!result) return;
      this.facade.createRuleGroup(result);
      this.watchNextError('Rule group created successfully.');
    });
  }

  protected openEditDialog(row: RuleRow): void {
    if (row.triggered) return;

    const rule: Rule = {
      id: row.id,
      ticker: row.ticker,
      field: row.field as Rule['field'],
      operator: row.operator as Rule['operator'],
      targetValue: row.targetValue,
      active: row.active,
      triggered: row.triggered,
      groupId: row.groupId,
    };

    const data: AlertCreationDialogData = {
      rule,
      ruleGroups: this.currentRuleGroups,
    };

    const dialogRef = this.dialog.open(AlertCreationDialogComponent, {
      data,
      width: '480px',
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((result) => {
      if (!result) return;
      this.facade.updateRule(row.id, {
        field: result.field,
        operator: result.operator,
        targetValue: result.targetValue,
      });
      this.watchNextError('Rule updated successfully.');
    });
  }

  protected confirmDelete(row: RuleRow): void {
    if (row.triggered) return;

    const data: ConfirmDialogData = {
      title: 'Delete Rule',
      message: `Are you sure you want to delete the rule for ${row.ticker}?`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data });
    dialogRef.afterClosed().pipe(takeUntil(this.destroy$)).subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.facade.deleteRule(row.id);
      this.watchNextError('Rule deleted successfully.');
    });
  }

  /**
   * Resolves the group name for a given groupId from the currently loaded rule groups.
   * Returns '-' if groupId is null or no matching group is found.
   */
  private resolveGroupName(groupId: number | null): string {
    if (groupId === null) return '-';
    return this.currentRuleGroups.find((g) => g.id === groupId)?.name ?? '-';
  }

  /**
   * Subscribes to the next error emission. If no error arrives after the operation,
   * shows the success notification. If an error arrives, shows the error notification.
   */
  private watchNextError(successMessage: string): void {
    this.facade.error$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      if (error) {
        this.notificationService.showError(error);
      } else {
        this.notificationService.showSuccess(successMessage);
      }
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RulesFacade } from '../../application/rules.facade';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RuleFormComponent, RuleFormData } from '../rule-form/rule-form.component';
import { RuleGroupFormComponent, RuleGroupFormData } from '../rule-group-form/rule-group-form.component';
import { Rule } from '../../domain/models/rule.model';

type FormView = 'none' | 'createRule' | 'editRule' | 'createRuleGroup';

@Component({
  selector: 'app-rules-page',
  standalone: true,
  imports: [
    AsyncPipe,
    LoadingIndicatorComponent,
    ErrorMessageComponent,
    ConfirmDialogComponent,
    RuleFormComponent,
    RuleGroupFormComponent,
  ],
  templateUrl: './rules-page.component.html',
  styleUrl: './rules-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesPageComponent implements OnInit {
  protected readonly facade = inject(RulesFacade);

  protected currentView: FormView = 'none';
  protected editingRule: Rule | null = null;
  protected isDeleteDialogOpen = false;
  protected ruleToDelete: Rule | null = null;

  ngOnInit(): void {
    this.facade.loadRules();
  }

  protected showCreateRule(): void {
    this.editingRule = null;
    this.currentView = 'createRule';
  }

  protected showEditRule(rule: Rule): void {
    if (rule.triggered) {
      return;
    }
    this.editingRule = rule;
    this.currentView = 'editRule';
  }

  protected showCreateRuleGroup(): void {
    this.currentView = 'createRuleGroup';
  }

  protected closeForm(): void {
    this.currentView = 'none';
    this.editingRule = null;
  }

  protected onRuleFormSubmit(data: RuleFormData): void {
    if (this.currentView === 'editRule' && this.editingRule) {
      this.facade.updateRule(this.editingRule.id, {
        field: data.field,
        operator: data.operator,
        targetValue: data.targetValue,
      });
    } else {
      this.facade.createRule({
        ticker: data.ticker,
        field: data.field,
        operator: data.operator,
        targetValue: data.targetValue,
        groupId: data.groupId,
      });
    }
    this.closeForm();
  }

  protected onRuleGroupFormSubmit(data: RuleGroupFormData): void {
    this.facade.createRuleGroup({
      ticker: data.ticker,
      name: data.name,
      rules: data.rules,
    });
    this.closeForm();
  }

  protected confirmDelete(rule: Rule): void {
    if (rule.triggered) {
      return;
    }
    this.ruleToDelete = rule;
    this.isDeleteDialogOpen = true;
  }

  protected onDeleteConfirmed(): void {
    if (this.ruleToDelete) {
      this.facade.deleteRule(this.ruleToDelete.id);
    }
    this.isDeleteDialogOpen = false;
    this.ruleToDelete = null;
  }

  protected onDeleteCancelled(): void {
    this.isDeleteDialogOpen = false;
    this.ruleToDelete = null;
  }
}

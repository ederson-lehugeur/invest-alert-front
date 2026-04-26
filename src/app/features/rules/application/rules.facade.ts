import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { RulesApiService } from '../infrastructure/rules-api.service';
import { RuleGroupsApiService } from '../infrastructure/rule-groups-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Rule } from '../domain/models/rule.model';
import { RuleGroup } from '../domain/models/rule-group.model';
import { CreateRuleCommand, UpdateRuleCommand } from '../domain/interfaces/rule.repository';
import { CreateRuleGroupCommand } from '../domain/interfaces/rule-group.repository';

interface RulesState {
  readonly rules: Rule[];
  readonly ruleGroups: RuleGroup[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: RulesState = {
  rules: [],
  ruleGroups: [],
  isLoading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class RulesFacade {
  private readonly rulesApi = inject(RulesApiService);
  private readonly ruleGroupsApi = inject(RuleGroupsApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state$ = new BehaviorSubject<RulesState>(INITIAL_STATE);

  readonly rules$: Observable<Rule[]> = this.state$.pipe(
    map((s) => s.rules),
    distinctUntilChanged(),
  );

  readonly ruleGroups$: Observable<RuleGroup[]> = this.state$.pipe(
    map((s) => s.ruleGroups),
    distinctUntilChanged(),
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((s) => s.isLoading),
    distinctUntilChanged(),
  );

  readonly error$: Observable<string | null> = this.state$.pipe(
    map((s) => s.error),
    distinctUntilChanged(),
  );

  loadRules(): void {
    this.updateState({ isLoading: true, error: null });

    forkJoin({
      rules: this.rulesApi.list(),
      ruleGroups: this.ruleGroupsApi.list(),
    }).subscribe({
      next: ({ rules, ruleGroups }) => {
        this.updateState({ rules, ruleGroups, isLoading: false });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({
          isLoading: false,
          error: this.errorHandler.extractMessage(err),
        });
      },
    });
  }

  createRule(command: CreateRuleCommand): void {
    this.updateState({ error: null });

    this.rulesApi.create(command).subscribe({
      next: (rule) => {
        this.updateState({ rules: [...this.state$.value.rules, rule] });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({ error: this.errorHandler.extractMessage(err) });
      },
    });
  }

  updateRule(id: number, command: UpdateRuleCommand): void {
    this.updateState({ error: null });

    this.rulesApi.update(id, command).subscribe({
      next: (updated) => {
        const rules = this.state$.value.rules.map((r) =>
          r.id === id ? updated : r,
        );
        this.updateState({ rules });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({ error: this.errorHandler.extractMessage(err) });
      },
    });
  }

  deleteRule(id: number): void {
    this.updateState({ error: null });

    this.rulesApi.delete(id).subscribe({
      next: () => {
        const rules = this.state$.value.rules.filter((r) => r.id !== id);
        this.updateState({ rules });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({ error: this.errorHandler.extractMessage(err) });
      },
    });
  }

  createRuleGroup(command: CreateRuleGroupCommand): void {
    this.updateState({ error: null });

    this.ruleGroupsApi.create(command).subscribe({
      next: (group) => {
        this.updateState({
          ruleGroups: [...this.state$.value.ruleGroups, group],
        });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({ error: this.errorHandler.extractMessage(err) });
      },
    });
  }

  private updateState(partial: Partial<RulesState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}

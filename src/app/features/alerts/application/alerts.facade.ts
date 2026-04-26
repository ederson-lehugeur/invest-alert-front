import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AlertsApiService } from '../infrastructure/alerts-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Alert } from '../domain/models/alert.model';
import { AlertFilter } from '../domain/interfaces/alert.repository';
import { PageResult } from '../../../shared/models/page-result.model';

interface AlertsState {
  readonly alerts: PageResult<Alert> | null;
  readonly currentFilter: AlertFilter;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: AlertsState = {
  alerts: null,
  currentFilter: {},
  isLoading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class AlertsFacade {
  private readonly alertsApi = inject(AlertsApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state$ = new BehaviorSubject<AlertsState>(INITIAL_STATE);

  readonly alerts$: Observable<PageResult<Alert> | null> = this.state$.pipe(
    map((s) => s.alerts),
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

  loadAlerts(filter: AlertFilter, page: number, size: number): void {
    this.updateState({ isLoading: true, error: null, currentFilter: filter });

    this.alertsApi.list(filter, page, size).subscribe({
      next: (alerts) => {
        this.updateState({ alerts, isLoading: false });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({
          isLoading: false,
          error: this.errorHandler.extractMessage(err),
        });
      },
    });
  }

  private updateState(partial: Partial<AlertsState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}

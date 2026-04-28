import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AssetsApiService } from '../../assets/infrastructure/assets-api.service';
import { AlertsApiService } from '../../alerts/infrastructure/alerts-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Alert } from '../../alerts/domain/models/alert.model';
import { HttpErrorResponse } from '@angular/common/http';

interface DashboardState {
  readonly totalAssets: number | null;
  readonly pendingAlerts: number | null;
  readonly sentAlerts: number | null;
  readonly recentAlerts: Alert[];
  readonly isLoading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: DashboardState = {
  totalAssets: null,
  pendingAlerts: null,
  sentAlerts: null,
  recentAlerts: [],
  isLoading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class DashboardFacade {
  private readonly assetsApi = inject(AssetsApiService);
  private readonly alertsApi = inject(AlertsApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state$ = new BehaviorSubject<DashboardState>(INITIAL_STATE);

  readonly totalAssets$: Observable<number | null> = this.state$.pipe(
    map((s) => s.totalAssets),
    distinctUntilChanged(),
  );

  readonly pendingAlerts$: Observable<number | null> = this.state$.pipe(
    map((s) => s.pendingAlerts),
    distinctUntilChanged(),
  );

  readonly sentAlerts$: Observable<number | null> = this.state$.pipe(
    map((s) => s.sentAlerts),
    distinctUntilChanged(),
  );

  readonly recentAlerts$: Observable<Alert[]> = this.state$.pipe(
    map((s) => s.recentAlerts),
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

  loadDashboard(): void {
    this.state$.next({ ...this.state$.value, isLoading: true, error: null });

    forkJoin({
      assets: this.assetsApi.list(0, 1),
      pending: this.alertsApi.list({ status: 'PENDING' }, 0, 1),
      sent: this.alertsApi.list({ status: 'SENT' }, 0, 1),
      recent: this.alertsApi.list({}, 0, 5),
    }).subscribe({
      next: ({ assets, pending, sent, recent }) => {
        this.state$.next({
          totalAssets: assets.totalElements,
          pendingAlerts: pending.totalElements,
          sentAlerts: sent.totalElements,
          recentAlerts: [...recent.content],
          isLoading: false,
          error: null,
        });
      },
      error: (err: HttpErrorResponse) => {
        const message = this.errorHandler.extractMessage(err);
        this.state$.next({
          ...this.state$.value,
          isLoading: false,
          error: message,
        });
      },
    });
  }
}

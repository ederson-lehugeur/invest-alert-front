import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ReusableCardComponent } from '../../../../shared/components/reusable-card/reusable-card.component';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { DashboardFacade } from '../../application/dashboard.facade';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    MaterialModule,
    ReusableCardComponent,
    SkeletonLoaderComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly facade = inject(DashboardFacade);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading$ = this.facade.isLoading$;
  readonly totalAssets$ = this.facade.totalAssets$;
  readonly pendingAlerts$ = this.facade.pendingAlerts$;
  readonly sentAlerts$ = this.facade.sentAlerts$;
  readonly recentAlerts$ = this.facade.recentAlerts$;

  readonly displayedColumns: string[] = ['ticker', 'status', 'details', 'createdAt'];

  ngOnInit(): void {
    this.facade.loadDashboard();

    this.facade.error$
      .pipe(
        filter((error): error is string => error !== null),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((error) => this.notificationService.showError(error));
  }
}

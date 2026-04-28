import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertsFacade } from '../../application/alerts.facade';
import { Alert } from '../../domain/models/alert.model';
import { AlertFilter } from '../../domain/interfaces/alert.repository';
import { FilterStateService } from '../../../../core/services/filter-state.service';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CellDefDirective } from '../../../../shared/components/reusable-table/cell-def.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ColumnConfig } from '../../../../shared/components/reusable-table/column-config.model';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;
const FILTER_STATE_KEY = 'alerts-filter';

interface AlertFilterState {
  readonly ticker: string;
  readonly status: string;
}

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    FormsModule,
    MaterialModule,
    ReusableTableComponent,
    CellDefDirective,
    SkeletonLoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPageComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(AlertsFacade);
  private readonly filterStateService = inject(FilterStateService);
  private readonly destroy$ = new Subject<void>();

  protected alertData: Alert[] = [];
  protected currentPage = DEFAULT_PAGE;
  protected currentSize = DEFAULT_SIZE;
  protected totalElements = 0;

  filterTicker = '';
  filterStatus = '';

  protected readonly columns: ColumnConfig[] = [
    { key: 'ticker', header: 'Ticker' },
    { key: 'status', header: 'Status' },
    { key: 'details', header: 'Details' },
    { key: 'createdAt', header: 'Created At' },
    { key: 'sentAt', header: 'Sent At' },
  ];

  protected readonly trackById = (_index: number, alert: Alert): number =>
    alert.id;

  ngOnInit(): void {
    this.restoreFilterState();

    const filter = this.buildFilter();
    this.facade.loadAlerts(filter, DEFAULT_PAGE, DEFAULT_SIZE);

    this.facade.alerts$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pageResult) => {
        if (pageResult) {
          this.alertData = [...pageResult.content];
          this.currentPage = pageResult.page;
          this.currentSize = pageResult.size;
          this.totalElements = pageResult.totalElements;
        } else {
          this.alertData = [];
          this.totalElements = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onFilterChange(): void {
    this.saveFilterState();
    const filter = this.buildFilter();
    this.facade.loadAlerts(filter, DEFAULT_PAGE, this.currentSize);
  }

  protected onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    const filter = this.buildFilter();
    this.facade.loadAlerts(filter, event.pageIndex, event.pageSize);
  }

  private buildFilter(): AlertFilter {
    const filter: AlertFilter = {};
    const ticker = this.filterTicker.trim();
    if (ticker) {
      return {
        ...filter,
        ticker,
        ...(this.filterStatus
          ? { status: this.filterStatus as 'PENDING' | 'SENT' }
          : {}),
      };
    }
    if (this.filterStatus) {
      return { ...filter, status: this.filterStatus as 'PENDING' | 'SENT' };
    }
    return filter;
  }

  private saveFilterState(): void {
    const state: AlertFilterState = {
      ticker: this.filterTicker,
      status: this.filterStatus,
    };
    this.filterStateService.save(FILTER_STATE_KEY, state);
  }

  private restoreFilterState(): void {
    const state = this.filterStateService.load<AlertFilterState>(FILTER_STATE_KEY);
    if (state) {
      this.filterTicker = state.ticker ?? '';
      this.filterStatus = state.status ?? '';
    }
  }
}

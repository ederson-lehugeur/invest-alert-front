import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlertsFacade } from '../../application/alerts.facade';
import { AlertFilter } from '../../domain/interfaces/alert.repository';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

const DEFAULT_SIZE = 20;

@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, FormsModule, LoadingIndicatorComponent, PaginationComponent, ErrorMessageComponent],
  templateUrl: './alerts-page.component.html',
  styleUrl: './alerts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPageComponent implements OnInit {
  protected readonly facade = inject(AlertsFacade);

  filterTicker = '';
  filterStatus = '';

  ngOnInit(): void {
    this.facade.loadAlerts({}, 0, DEFAULT_SIZE);
  }

  protected onFilterChange(): void {
    const filter = this.buildFilter();
    this.facade.loadAlerts(filter, 0, DEFAULT_SIZE);
  }

  protected onPageChange(page: number): void {
    const filter = this.buildFilter();
    this.facade.loadAlerts(filter, page, DEFAULT_SIZE);
  }

  private buildFilter(): AlertFilter {
    const filter: AlertFilter = {};
    if (this.filterTicker.trim()) {
      return { ...filter, ticker: this.filterTicker.trim(), ...(this.filterStatus ? { status: this.filterStatus as 'PENDING' | 'SENT' } : {}) };
    }
    if (this.filterStatus) {
      return { ...filter, status: this.filterStatus as 'PENDING' | 'SENT' };
    }
    return filter;
  }
}

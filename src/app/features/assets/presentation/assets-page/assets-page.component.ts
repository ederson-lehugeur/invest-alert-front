import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AssetsFacade } from '../../application/assets.facade';
import { Asset } from '../../domain/models/asset.model';
import { MaterialModule } from '../../../../shared/material/material.module';
import { ReusableTableComponent } from '../../../../shared/components/reusable-table/reusable-table.component';
import { CellDefDirective } from '../../../../shared/components/reusable-table/cell-def.directive';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { ColumnConfig } from '../../../../shared/components/reusable-table/column-config.model';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    DecimalPipe,
    MaterialModule,
    ReusableTableComponent,
    CellDefDirective,
    SkeletonLoaderComponent,
    ErrorMessageComponent,
  ],
  templateUrl: './assets-page.component.html',
  styleUrl: './assets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsPageComponent implements OnInit, OnDestroy {
  protected readonly facade = inject(AssetsFacade);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected sortedData: Asset[] = [];
  protected currentPage = DEFAULT_PAGE;
  protected currentSize = DEFAULT_SIZE;
  protected totalElements = 0;

  private originalData: Asset[] = [];

  protected readonly columns: ColumnConfig[] = [
    { key: 'ticker', header: 'Ticker' },
    { key: 'name', header: 'Name' },
    { key: 'currentPrice', header: 'Price', sortable: true, align: 'right' },
    { key: 'dividendYield', header: 'Dividend Yield', sortable: true, align: 'right' },
    { key: 'pVp', header: 'P/VP', sortable: true, align: 'right' },
    { key: 'updatedAt', header: 'Updated At' },
  ];

  protected readonly trackByTicker = (_index: number, asset: Asset): string =>
    asset.ticker;

  ngOnInit(): void {
    this.facade.loadAssets(DEFAULT_PAGE, DEFAULT_SIZE);

    this.facade.assets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pageResult) => {
        if (pageResult) {
          this.originalData = [...pageResult.content];
          this.sortedData = [...pageResult.content];
          this.currentPage = pageResult.page;
          this.currentSize = pageResult.size;
          this.totalElements = pageResult.totalElements;
        } else {
          this.originalData = [];
          this.sortedData = [];
          this.totalElements = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSortChange(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.sortedData = [...this.originalData];
      return;
    }

    this.sortedData = [...this.sortedData].sort((a, b) => {
      const aVal = (a as unknown as Record<string, number>)[sort.active];
      const bVal = (b as unknown as Record<string, number>)[sort.active];
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  protected onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.facade.loadAssets(event.pageIndex, event.pageSize);
  }

  protected onRowClick(asset: Asset): void {
    this.router.navigate(['/assets', asset.ticker]);
  }
}

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
import {
  TABS,
  partitionByType,
  buildColumnsForTab,
  sortAssets,
  getIndicatorValue,
  AssetPartition,
} from './asset-tab.utils';

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

  protected readonly tabs = TABS;
  protected readonly getIndicatorValue = getIndicatorValue;

  protected selectedTabIndex = 0;
  protected sortedData: Asset[] = [];
  protected activeColumns: ColumnConfig[] = [];
  protected currentPage = DEFAULT_PAGE;
  protected currentSize = DEFAULT_SIZE;
  protected totalElements = 0;

  private partition: AssetPartition = { FII: [], STOCK: [], CRYPTOCURRENCY: [] };
  private currentSort: Sort = { active: '', direction: '' };

  protected readonly trackByTicker = (_index: number, asset: Asset): string =>
    asset.ticker;

  ngOnInit(): void {
    this.facade.loadAssets(DEFAULT_PAGE, DEFAULT_SIZE);

    this.facade.assets$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pageResult) => {
        if (pageResult) {
          this.partition = partitionByType(pageResult.content);
          this.currentPage = pageResult.page;
          this.currentSize = pageResult.size;
          this.totalElements = pageResult.totalElements;
          this.recomputeActiveView();
        } else {
          this.partition = { FII: [], STOCK: [], CRYPTOCURRENCY: [] };
          this.sortedData = [];
          this.activeColumns = [];
          this.totalElements = 0;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onTabChange(index: number): void {
    this.selectedTabIndex = index;
    this.currentSort = { active: '', direction: '' };
    this.recomputeActiveView();
  }

  protected onSortChange(sort: Sort): void {
    this.currentSort = sort;
    const activeAssets = this.getActiveAssets();
    const indicatorCodes = this.getIndicatorCodes();
    this.sortedData = sortAssets(activeAssets, sort, indicatorCodes);
  }

  protected onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.currentSize = event.pageSize;
    this.facade.loadAssets(event.pageIndex, event.pageSize);
  }

  protected onRowClick(asset: Asset): void {
    this.router.navigate(['/assets', asset.ticker]);
  }

  private recomputeActiveView(): void {
    const activeAssets = this.getActiveAssets();
    this.activeColumns = buildColumnsForTab(activeAssets);
    const indicatorCodes = this.getIndicatorCodes();
    this.sortedData = sortAssets(activeAssets, this.currentSort, indicatorCodes);
  }

  private getActiveAssets(): readonly Asset[] {
    const activeType = TABS[this.selectedTabIndex].type;
    return this.partition[activeType];
  }

  private getIndicatorCodes(): string[] {
    return this.activeColumns
      .slice(3)
      .map(col => col.key);
  }
}

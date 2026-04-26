import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { AssetsFacade } from '../../application/assets.facade';
import { LoadingIndicatorComponent } from '../../../../shared/components/loading-indicator/loading-indicator.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 20;

@Component({
  selector: 'app-assets-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, LoadingIndicatorComponent, PaginationComponent, ErrorMessageComponent],
  templateUrl: './assets-page.component.html',
  styleUrl: './assets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsPageComponent implements OnInit {
  protected readonly facade = inject(AssetsFacade);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.facade.loadAssets(DEFAULT_PAGE, DEFAULT_SIZE);
  }

  protected onPageChange(page: number): void {
    this.facade.loadAssets(page, DEFAULT_SIZE);
  }

  protected onRowClick(ticker: string): void {
    this.router.navigate(['/assets', ticker]);
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe, DecimalPipe } from '@angular/common';
import { AssetsFacade } from '../../application/assets.facade';
import { SkeletonLoaderComponent } from '../../../../shared/components/skeleton-loader/skeleton-loader.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';
import { MaterialModule } from '../../../../shared/material/material.module';

@Component({
  selector: 'app-asset-detail-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, DecimalPipe, RouterLink, SkeletonLoaderComponent, ErrorMessageComponent, MaterialModule],
  templateUrl: './asset-detail-page.component.html',
  styleUrl: './asset-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailPageComponent implements OnInit {
  protected readonly facade = inject(AssetsFacade);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    const ticker = this.route.snapshot.paramMap.get('ticker');
    if (ticker) {
      this.facade.loadAssetByTicker(ticker);
    }
  }
}

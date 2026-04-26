import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { AssetsApiService } from '../infrastructure/assets-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { Asset } from '../domain/models/asset.model';
import { PageResult } from '../../../shared/models/page-result.model';

interface AssetsState {
  readonly assets: PageResult<Asset> | null;
  readonly selectedAsset: Asset | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const INITIAL_STATE: AssetsState = {
  assets: null,
  selectedAsset: null,
  isLoading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class AssetsFacade {
  private readonly assetsApi = inject(AssetsApiService);
  private readonly errorHandler = inject(ErrorHandlerService);

  private readonly state$ = new BehaviorSubject<AssetsState>(INITIAL_STATE);

  readonly assets$: Observable<PageResult<Asset> | null> = this.state$.pipe(
    map((s) => s.assets),
    distinctUntilChanged(),
  );

  readonly selectedAsset$: Observable<Asset | null> = this.state$.pipe(
    map((s) => s.selectedAsset),
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

  loadAssets(page: number, size: number): void {
    this.updateState({ isLoading: true, error: null });

    this.assetsApi.list(page, size).subscribe({
      next: (assets) => {
        this.updateState({ assets, isLoading: false });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({
          isLoading: false,
          error: this.errorHandler.extractMessage(err),
        });
      },
    });
  }

  loadAssetByTicker(ticker: string): void {
    this.updateState({ isLoading: true, error: null, selectedAsset: null });

    this.assetsApi.getByTicker(ticker).subscribe({
      next: (asset) => {
        this.updateState({ selectedAsset: asset, isLoading: false });
      },
      error: (err: HttpErrorResponse) => {
        this.updateState({
          isLoading: false,
          error: this.errorHandler.extractMessage(err),
        });
      },
    });
  }

  private updateState(partial: Partial<AssetsState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}

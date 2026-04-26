import { Routes } from '@angular/router';
import { AssetsPageComponent } from './presentation/assets-page/assets-page.component';
import { AssetDetailPageComponent } from './presentation/asset-detail-page/asset-detail-page.component';

export const ASSETS_ROUTES: Routes = [
  { path: '', component: AssetsPageComponent },
  { path: ':ticker', component: AssetDetailPageComponent },
];

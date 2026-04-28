import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LayoutShellComponent } from './core/layout/layout-shell/layout-shell.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    component: LayoutShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES
          ),
      },
      {
        path: 'assets',
        loadChildren: () =>
          import('./features/assets/assets.routes').then(
            (m) => m.ASSETS_ROUTES
          ),
      },
      {
        path: 'rules',
        loadChildren: () =>
          import('./features/rules/rules.routes').then((m) => m.RULES_ROUTES),
      },
      {
        path: 'alerts',
        loadChildren: () =>
          import('./features/alerts/alerts.routes').then(
            (m) => m.ALERTS_ROUTES
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];

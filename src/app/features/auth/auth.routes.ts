import { Routes } from '@angular/router';
import { LoginPageComponent } from './presentation/login-page/login-page.component';
import { RegisterPageComponent } from './presentation/register-page/register-page.component';

export const AUTH_ROUTES: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPageComponent },
  { path: 'register', component: RegisterPageComponent },
];

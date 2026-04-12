import { Routes } from '@angular/router';
import { LoginPageComponent } from './login/login-page.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile';

export const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent }
];
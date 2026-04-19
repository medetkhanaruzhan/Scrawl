import { Routes } from '@angular/router';
import { LoginPageComponent } from './login/login-page.component';
import { FeedPageComponent } from './pages/feed-page/feed-page.component';
import { ProfileComponent } from './profile/profile.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '',           redirectTo: 'login', pathMatch: 'full' },
  { path: 'login',      component: LoginPageComponent },
  { path: 'feed',       component: FeedPageComponent, canActivate: [authGuard] },
  { path: 'profile',    component: ProfileComponent, canActivate: [authGuard] },
  { path: 'profile/:username', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**',         redirectTo: 'login' }
];

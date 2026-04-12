import { Routes } from '@angular/router';
import { FeedPageComponent } from './pages/feed-page/feed-page.component';

export const routes: Routes = [
  { path: '',        redirectTo: 'feed', pathMatch: 'full' },
  { path: 'feed',    component: FeedPageComponent },
  // Placeholder routes — swap with real components when built
  { path: 'login',   component: FeedPageComponent },   // replace with LoginPageComponent
  { path: 'profile', component: FeedPageComponent },   // replace with ProfilePageComponent
  { path: '**',      redirectTo: 'feed' },
];

import { Routes } from '@angular/router';
import { SearchComponent } from './features/search/search.component';
import { CollectionsComponent } from './features/collections/collections.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    pathMatch: 'full',
  },
  {
    path: 'movie/:id',
    component: SearchComponent,
  },
  {
    path: 'collections',
    component: CollectionsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  }
];

import { Routes } from '@angular/router';
import { SearchComponent } from './features/search/search.component';

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
];

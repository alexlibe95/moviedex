import { Routes } from '@angular/router';
import { SearchComponent } from './features/search/search.component';
import { MovieDetailsComponent } from './features/movie-details/movie-details.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    pathMatch: 'full',
  },
  {
    path: 'movie/:id',
    component: MovieDetailsComponent,
    pathMatch: 'full',
  },
];

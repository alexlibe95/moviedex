import { Routes } from '@angular/router';
import { SearchComponent } from './features/search/search.component';
import { CollectionsComponent } from './features/collections/collections.component';
import { CollectionDetailsComponent } from './features/collections/collection-details/collection-details.component';
import { MovieDetailsPageComponent } from './shared/components/movie-details/movie-details-page/movie-details-page.component';

export const routes: Routes = [
  {
    path: '',
    component: SearchComponent,
    pathMatch: 'full',
  },
  {
    path: 'movie/:id',
    component: MovieDetailsPageComponent,
  },
  {
    path: 'collections',
    component: CollectionsComponent,
  },
  {
    path: 'collections/:id',
    component: CollectionDetailsComponent,
  },
  {
    path: '**',
    redirectTo: '',
  }
];

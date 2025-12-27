import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PageEvent } from '@angular/material/paginator';

import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-search-results',
  imports: [
    MatProgressSpinnerModule,
    RouterLink,
    MovieCardComponent,
    PaginationComponent,
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent {
  readonly isLoading = input<boolean | null>(null);
  readonly searchResults = input<Movie[]>([]);
  readonly totalResults = input(0);
  readonly currentPage = input(0);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input<number[]>([20, 40, 60, 100]);
  readonly pageChange = output<PageEvent>();
}


import { Component, input, output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';

import { Movie } from '../../../core/models/movie.model';
import { PaginationComponent } from '../pagination/pagination.component';
import { MovieListComponent } from '../../../shared/components/movie-list/movie-list.component';

@Component({
  selector: 'app-search-results',
  imports: [MovieListComponent, PaginationComponent],
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
  readonly selectedMovieIds = input<Set<number>>(new Set());
  readonly movieSelectionToggle = output<Movie>();
}

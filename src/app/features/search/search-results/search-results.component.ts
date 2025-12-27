import { Component, input, output, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from './movie-card/movie-card.component';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-search-results',
  imports: [MatProgressSpinnerModule, MovieCardComponent, PaginationComponent],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.scss',
})
export class SearchResultsComponent {
  private readonly router = inject(Router);
  readonly isLoading = input<boolean | null>(null);
  readonly searchResults = input<Movie[]>([]);
  readonly totalResults = input(0);
  readonly currentPage = input(0);
  readonly pageSize = input(20);
  readonly pageSizeOptions = input<number[]>([20, 40, 60, 100]);
  readonly pageChange = output<PageEvent>();

  openMovieDetails(movieId: number): void {
    // Navigate to /movie/:id - SearchComponent will detect this and open the dialog
    this.router.navigate(['/movie', movieId]);
  }

  handleKeydown(event: KeyboardEvent, movieId: number): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openMovieDetails(movieId);
    }
  }
}

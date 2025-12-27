import { Component, inject, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { TmdbService } from '../../core/api/tmdb.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { AlphanumericMinLengthDirective } from '../../shared/directives/alphanumeric-min-length.directive';
import { PaginationComponent } from './pagination/pagination.component';

@Component({
  selector: 'app-search',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MovieCardComponent,
    RouterLink,
    AlphanumericMinLengthDirective,
    PaginationComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly tmdbService = inject(TmdbService);
  protected readonly searchControl = new FormControl('');
  readonly searchResults = signal<Movie[]>([]);
  readonly isLoading = signal<boolean | null>(null);
  
  // Pagination state
  readonly totalResults = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  onSearch(page = 1): void {
    // Mark control as touched to show validation errors
    this.searchControl.markAsTouched();

    // Check if form control is valid before calling the service
    if (this.searchControl.invalid) {
      return;
    }

    const query = this.searchControl.value?.trim();
    if (query && query.length >= 3) {
      this.isLoading.set(true);
      const pageSize = this.pageSize();
      this.tmdbService.searchMovies(query, page, pageSize).subscribe({
        next: (response) => {
          this.searchResults.set(response.results);
          this.totalResults.set(response.total_results);
          this.currentPage.set(response.page - 1); // mat-paginator uses 0-based index
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isLoading.set(false);
        },
      });
    }
  }

  onPageChange(event: PageEvent): void {
    const newPageSize = event.pageSize;
    const pageSizeChanged = newPageSize !== this.pageSize();
    
    this.pageSize.set(newPageSize);
    
    // If page size changed, reset to first page, otherwise use the selected page
    if (pageSizeChanged) {
      this.currentPage.set(0);
      this.onSearch(1);
    } else {
      // Call search with the new page (API uses 1-based, mat-paginator uses 0-based)
      this.onSearch(event.pageIndex + 1);
    }
  }
}

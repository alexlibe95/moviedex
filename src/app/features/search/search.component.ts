import { Component, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TmdbService } from '../../core/api/tmdb.service';
import { Movie } from '../../core/models/movie.model';
import { MovieCardComponent } from '../../shared/components/movie-card/movie-card.component';
import { AlphanumericMinLengthDirective } from '../../shared/directives/alphanumeric-min-length.directive';

@Component({
  selector: 'app-search',
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MovieCardComponent,
    RouterLink,
    AlphanumericMinLengthDirective,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly tmdbService = inject(TmdbService);
  protected readonly searchControl = new FormControl('');
  readonly searchResults = signal<Movie[]>([]);
  isLoading = signal(false);

  onSearch(event: SubmitEvent): void {
    event.preventDefault();

    // Mark control as touched to show validation errors
    this.searchControl.markAsTouched();

    // Check if form control is valid before calling the service
    if (this.searchControl.invalid) {
      return;
    }

    const query = this.searchControl.value?.trim();
    if (query && query.length >= 3) {
      this.isLoading.set(true);
      this.tmdbService.searchMovies(query).subscribe({
        next: (response) => {
          this.searchResults.set(response.results);
          console.log(response.results);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isLoading.set(false);
        },
      });
    }
  }
}

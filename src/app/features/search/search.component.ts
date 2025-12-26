import { Component, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TmdbService } from '../../core/api/tmdb.service';
import { Movie } from '../../core/models/movie.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-search',
  imports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private readonly tmdbService = inject(TmdbService);
  readonly searchResults = signal<Movie[]>([]);
  protected readonly searchControl = new FormControl('');

  onSearch(event: SubmitEvent): void {
    event.preventDefault();
    const query = this.searchControl.value?.trim();
    if (query) {
      this.tmdbService.searchMovies(query).subscribe({
        next: (response) => {
          this.searchResults.set(response.results);
          console.log(response.results);
        },
        error: (error) => {
          console.error('Search error:', error);
        },
      });
    }
  }
}

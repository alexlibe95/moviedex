import { Component, input, output, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { Movie } from '../../../core/models/movie.model';
import { MovieCardComponent } from './movie-card/movie-card.component';
import {
  MovieDetailsComponent,
  MovieDetailsDialogData,
} from '../movie-details/movie-details.component';

@Component({
  selector: 'app-movie-list',
  imports: [MatProgressSpinnerModule, MovieCardComponent],
  templateUrl: './movie-list.component.html',
  styleUrl: './movie-list.component.scss',
})
export class MovieListComponent {
  private readonly dialog = inject(MatDialog);

  readonly movies = input.required<Movie[]>();
  readonly isLoading = input<boolean | null>(null);
  readonly emptyMessage = input<string>('No movies found');
  readonly selectedMovieIds = input<Set<number>>(new Set());
  readonly movieSelectionToggle = output<Movie>();

  openMovieDetails(movieId: number): void {
    // Open dialog directly without navigation
    const dialogData: MovieDetailsDialogData = { movieId };
    this.dialog.open(MovieDetailsComponent, {
      data: dialogData,
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
    });
  }

  onMovieSelectionToggle(movie: Movie): void {
    this.movieSelectionToggle.emit(movie);
  }

  isMovieSelected(movieId: number): boolean {
    return this.selectedMovieIds().has(movieId);
  }
}


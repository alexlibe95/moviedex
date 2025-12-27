import { Component, inject, signal, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TmdbService } from '../../core/api/tmdb.service';
import { MovieDetails } from '../../core/models/movie-details.model';
import { MovieInfoComponent } from './movie-info/movie-info.component';
import { MovieStatsComponent } from './movie-stats/movie-stats.component';
import { MovieRatingComponent } from './movie-rating/movie-rating.component';

export interface MovieDetailsDialogData {
  movieId: number;
}

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MovieInfoComponent,
    MovieStatsComponent,
    MovieRatingComponent,
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly dialogRef = inject(MatDialogRef<MovieDetailsComponent>);
  private readonly data = inject<MovieDetailsDialogData>(MAT_DIALOG_DATA);

  readonly movieDetails = signal<MovieDetails | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly userRating = signal<number | null>(null);

  ngOnInit(): void {
    this.loadMovieDetails();
  }

  private loadMovieDetails(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.tmdbService.getMovieDetails(this.data.movieId).subscribe({
      next: (details) => {
        this.movieDetails.set(details);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error.message || 'Failed to load movie details');
        this.isLoading.set(false);
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  onRatingSubmitted(rating: number): void {
    this.userRating.set(rating);
  }
}

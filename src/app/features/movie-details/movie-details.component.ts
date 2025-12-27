import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, DecimalPipe } from '@angular/common';

import { TmdbService } from '../../core/api/tmdb.service';
import { MovieDetails } from '../../core/models/movie-details.model';
import { TMDB_IMAGE_URL } from '../../core/constants/api.constants';

export interface MovieDetailsDialogData {
  movieId: number;
}

@Component({
  selector: 'app-movie-details',
  imports: [
    MatDialogModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly dialogRef = inject(MatDialogRef<MovieDetailsComponent>);
  private readonly data = inject<MovieDetailsDialogData>(MAT_DIALOG_DATA);
  readonly tmdbImageUrl = TMDB_IMAGE_URL;
  readonly movieDetails = signal<MovieDetails | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly languages = computed(() => {
    const movie = this.movieDetails();
    if (!movie || !movie.spoken_languages || movie.spoken_languages.length === 0) {
      return 'N/A';
    }
    return movie.spoken_languages.map((lang) => lang.english_name).join(', ');
  });

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
}

import { Component, inject, signal, OnInit, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { TmdbService } from '../../../../core/api/tmdb.service';
import { MovieDetails } from '../../../../core/models/movie-details.model';
import { MovieInfoComponent } from '../movie-info/movie-info.component';
import { MovieStatsComponent } from '../movie-stats/movie-stats.component';
import { MovieRatingComponent } from '../movie-rating/movie-rating.component';

@Component({
  selector: 'app-movie-details-content',
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    MovieInfoComponent,
    MovieStatsComponent,
    MovieRatingComponent,
  ],
  templateUrl: './movie-details-content.component.html',
  styleUrl: './movie-details-content.component.scss',
})
export class MovieDetailsContentComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);

  readonly movieId = input.required<number>();

  readonly movieDetails = signal<MovieDetails | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);
  readonly userRating = signal<number | null>(null);

  ngOnInit(): void {
    this.loadMovieDetails();
  }

  private async loadMovieDetails(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const details = await firstValueFrom(
        this.tmdbService.getMovieDetails(this.movieId())
      );
      this.movieDetails.set(details);
      this.isLoading.set(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load movie details';
      this.error.set(errorMessage);
      this.isLoading.set(false);
    }
  }

  onRatingSubmitted(rating: number): void {
    this.userRating.set(rating);
  }
}


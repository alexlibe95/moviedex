import { Component, inject, input, output, signal, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TmdbService } from '../../../core/api/tmdb.service';
import { GuestSessionService } from '../../../core/services/guest-session.service';

@Component({
  selector: 'app-movie-rating',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './movie-rating.component.html',
  styleUrl: './movie-rating.component.scss',
})
export class MovieRatingComponent implements OnInit {
  private readonly tmdbService = inject(TmdbService);
  private readonly guestSessionService = inject(GuestSessionService);
  private readonly snackBar = inject(MatSnackBar);

  readonly Math = Math;

  readonly movieId = input.required<number>();
  readonly currentRating = input<number | null>(null);

  readonly isRating = signal(false);
  readonly selectedStars = signal<number | null>(null);
  readonly ratingSubmitted = output<number>();

  readonly maxStars = 5;

  ngOnInit(): void {
    // Convert API rating (0-10) to star rating (1-5) if exists
    const current = this.currentRating();
    if (current !== null) {
      this.selectedStars.set(Math.round(current / 2));
    }
  }

  selectStars(stars: number): void {
    this.selectedStars.set(stars);
  }

  /**
   * Converts star rating (1-5) to API rating (2-10)
   */
  private starsToApiRating(stars: number): number {
    return stars * 2;
  }

  async submitRating(): Promise<void> {
    const stars = this.selectedStars();
    if (!stars) {
      return;
    }

    const apiRating = this.starsToApiRating(stars);
    this.isRating.set(true);

    try {
      const sessionId = await this.guestSessionService.getSessionId();
      this.tmdbService.rateMovie(this.movieId(), apiRating, sessionId).subscribe({
        next: (response) => {
          if (response.success) {
            this.ratingSubmitted.emit(apiRating);
            this.snackBar.open('Rating submitted successfully!', 'Close', {
              duration: 3000,
            });
          } else {
            throw new Error('Failed to submit rating');
          }
          this.isRating.set(false);
        },
        error: (error) => {
          console.error('Error rating movie:', error);
          this.snackBar.open('Failed to submit rating. Please try again.', 'Close', {
            duration: 5000,
          });
          this.isRating.set(false);
        },
      });
    } catch (error) {
      console.error('Error getting session:', error);
      this.snackBar.open('Failed to initialize rating session. Please try again.', 'Close', {
        duration: 5000,
      });
      this.isRating.set(false);
    }
  }

}


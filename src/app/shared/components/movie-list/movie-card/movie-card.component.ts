import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { Movie } from '../../../../core/models/movie.model';
import { TMDB_IMAGE_URL } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-movie-card',
  imports: [MatCardModule, MatIconModule, MatTooltipModule, MatCheckboxModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
  readonly isSelected = input<boolean>(false);
  readonly selectionToggle = output<Movie>();
  readonly cardClick = output<number>();

  readonly tmdbImageUrl = TMDB_IMAGE_URL;

  onCheckboxClick(): void {
    // Toggle selection
    this.selectionToggle.emit(this.movie());
  }

  onTitleClick(): void {
    this.cardClick.emit(this.movie().id);
  }

  onTitleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit(this.movie().id);
    }
  }

  onContentClick(): void {
    this.cardClick.emit(this.movie().id);
  }

  onContentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.cardClick.emit(this.movie().id);
    }
  }
}

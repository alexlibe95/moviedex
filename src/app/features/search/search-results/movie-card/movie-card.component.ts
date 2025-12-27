import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Movie } from '../../../../core/models/movie.model';
import { TMDB_IMAGE_URL } from '../../../../core/constants/api.constants';

@Component({
  selector: 'app-movie-card',
  imports: [MatCardModule, MatIconModule, MatTooltipModule],
  templateUrl: './movie-card.component.html',
  styleUrl: './movie-card.component.scss',
})
export class MovieCardComponent {
  readonly movie = input.required<Movie>();
  readonly tmdbImageUrl = TMDB_IMAGE_URL;
}

import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { MovieDetails } from '../../../core/models/movie-details.model';
import { TMDB_IMAGE_URL } from '../../../core/constants/api.constants';

@Component({
  selector: 'app-movie-info',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  templateUrl: './movie-info.component.html',
  styleUrl: './movie-info.component.scss',
})
export class MovieInfoComponent {
  readonly movie = input.required<MovieDetails>();
  readonly tmdbImageUrl = TMDB_IMAGE_URL;
}

import { Component, input, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { MovieDetails } from '../../../core/models/movie-details.model';

@Component({
  selector: 'app-movie-stats',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './movie-stats.component.html',
  styleUrl: './movie-stats.component.scss',
})
export class MovieStatsComponent {
  readonly movie = input.required<MovieDetails>();

  readonly languages = computed(() => {
    const movie = this.movie();
    if (!movie.spoken_languages || movie.spoken_languages.length === 0) {
      return 'N/A';
    }
    return movie.spoken_languages.map((lang) => lang.english_name).join(', ');
  });
}


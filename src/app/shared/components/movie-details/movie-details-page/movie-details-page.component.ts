import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

import { MovieDetailsContentComponent } from '../movie-details-content/movie-details-content.component';

@Component({
  selector: 'app-movie-details-page',
  imports: [MatIconModule, MovieDetailsContentComponent],
  templateUrl: './movie-details-page.component.html',
  styleUrl: './movie-details-page.component.scss',
})
export class MovieDetailsPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  movieId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = parseInt(idParam, 10);
      if (!isNaN(id)) {
        this.movieId = id;
      }
    }
  }
}


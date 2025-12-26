import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-movie-details',
  imports: [],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent {
  private readonly route = inject(ActivatedRoute);
  id: number;

  constructor() {
    this.id = this.route.snapshot.params['id'];
  }
}

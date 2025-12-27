import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { MovieDetailsContentComponent } from './movie-details-content/movie-details-content.component';

export interface MovieDetailsDialogData {
  movieId: number;
}

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MovieDetailsContentComponent,
  ],
  templateUrl: './movie-details.component.html',
  styleUrl: './movie-details.component.scss',
})
export class MovieDetailsComponent {
  private readonly dialogRef = inject(MatDialogRef<MovieDetailsComponent>);
  private readonly data = inject<MovieDetailsDialogData>(MAT_DIALOG_DATA);

  readonly movieId = this.data.movieId;

  close(): void {
    this.dialogRef.close();
  }
}

import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

import { Movie } from '../../../core/models/movie.model';
import { Collection } from '../../../core/models/collection.model';
import { CollectionsService } from '../../../core/services/collections.service';
import {
  CreateCollectionDialogComponent,
  CreateCollectionResult,
} from '../../collections/create-collection-dialog/create-collection-dialog.component';

export interface AddToCollectionDialogData {
  movies: Movie[];
}

export interface AddToCollectionResult {
  collectionId: string;
}

@Component({
  selector: 'app-add-to-collection-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './add-to-collection-dialog.component.html',
  styleUrl: './add-to-collection-dialog.component.scss',
})
export class AddToCollectionDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AddToCollectionDialogComponent>);
  private readonly data = inject<AddToCollectionDialogData>(MAT_DIALOG_DATA);
  private readonly collectionsService = inject(CollectionsService);
  private readonly dialog = inject(MatDialog);

  readonly movies = this.data.movies;
  readonly collections = signal<Collection[]>([]);
  readonly selectedCollectionId = signal<string | null>(null);

  constructor() {
    // Update collections when service changes
    effect(() => {
      const serviceCollections = this.collectionsService.collections$();
      this.collections.set(serviceCollections);
    });
  }

  ngOnInit(): void {
    this.collections.set(this.collectionsService.getCollections());
  }

  async onCreateNewCollection(): Promise<void> {
    const dialogRef = this.dialog.open(CreateCollectionDialogComponent, {
      width: '500px',
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result && typeof result === 'object' && 'name' in result) {
      const collectionResult = result as CreateCollectionResult;
      const newCollection = this.collectionsService.createCollection(
        collectionResult.name,
        collectionResult.description
      );
      this.selectedCollectionId.set(newCollection.id);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onAdd(): void {
    const collectionId = this.selectedCollectionId();
    if (collectionId) {
      this.dialogRef.close({ collectionId } as AddToCollectionResult);
    }
  }
}


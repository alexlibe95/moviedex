import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

import { CollectionsService } from '../../core/services/collections.service';
import { Collection } from '../../core/models/collection.model';
import { CreateCollectionDialogComponent } from './create-collection-dialog/create-collection-dialog.component';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatCardModule, MatSnackBarModule, DatePipe],
  templateUrl: './collections.component.html',
  styleUrl: './collections.component.scss',
})
export class CollectionsComponent implements OnInit {
  private readonly collectionsService = inject(CollectionsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  readonly collections = signal<Collection[]>([]);

  constructor() {
    // Update collections when service signal changes
    effect(() => {
      const serviceCollections = this.collectionsService.collections$();
      this.collections.set(serviceCollections);
    });
  }

  ngOnInit(): void {
    this.loadCollections();
  }

  private loadCollections(): void {
    this.collections.set(this.collectionsService.getCollections());
  }

  async openCreateDialog(): Promise<void> {
    const dialogRef = this.dialog.open(CreateCollectionDialogComponent, {
      width: '500px',
    });

    // Convert afterClosed to promise and handle result
    const collectionName = await firstValueFrom(dialogRef.afterClosed());
    if (collectionName) {
      this.collectionsService.createCollection(collectionName);
      this.snackBar.open(`Collection "${collectionName}" created successfully!`, 'Close', {
        duration: 3000,
      });
    }
  }

  deleteCollection(collection: Collection): void {
    if (confirm(`Are you sure you want to delete "${collection.name}"?`)) {
      const success = this.collectionsService.deleteCollection(collection.id);
      if (success) {
        this.snackBar.open(`Collection "${collection.name}" deleted successfully!`, 'Close', {
          duration: 3000,
        });
      }
    }
  }

  getMovieCount(collection: Collection): number {
    return collection.movies.length;
  }
}


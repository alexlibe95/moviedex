import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { CollectionsService } from '../../../core/services/collections.service';
import { Collection } from '../../../core/models/collection.model';
import { Movie } from '../../../core/models/movie.model';
import { MovieListComponent } from '../../../shared/components/movie-list/movie-list.component';

@Component({
  selector: 'app-collection-details',
  standalone: true,
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MovieListComponent,
  ],
  templateUrl: './collection-details.component.html',
  styleUrl: './collection-details.component.scss',
})
export class CollectionDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly collectionsService = inject(CollectionsService);

  readonly collections = signal<Collection[]>([]);
  readonly selectedCollectionId = signal<string | null>(null);
  readonly movies = signal<Movie[]>([]);

  constructor() {
    // Update movies when selected collection changes
    effect(() => {
      const collectionId = this.selectedCollectionId();
      if (collectionId) {
        const collection = this.collectionsService.getCollection(collectionId);
        if (collection) {
          this.movies.set(collection.movies);
        } else {
          this.movies.set([]);
        }
      }
    });

    // Update collections when service changes
    effect(() => {
      const serviceCollections = this.collectionsService.collections$();
      this.collections.set(serviceCollections);
    });
  }

  ngOnInit(): void {
    // Load collections
    this.collections.set(this.collectionsService.getCollections());

    // Get collection ID from route
    const collectionId = this.route.snapshot.paramMap.get('id');
    if (collectionId) {
      // Verify collection exists
      const collection = this.collectionsService.getCollection(collectionId);
      if (collection) {
        this.selectedCollectionId.set(collectionId);
      } else {
        // Collection not found, redirect to collections list
        this.router.navigate(['/collections']);
      }
    } else {
      // No ID in route, redirect to collections list
      this.router.navigate(['/collections']);
    }
  }

  onCollectionChange(collectionId: string): void {
    // Update URL when collection changes
    this.router.navigate(['/collections', collectionId], { replaceUrl: true });
    this.selectedCollectionId.set(collectionId);
  }

  getSelectedCollection(): Collection | null {
    const id = this.selectedCollectionId();
    if (!id) {
      return null;
    }
    return this.collectionsService.getCollection(id) || null;
  }
}


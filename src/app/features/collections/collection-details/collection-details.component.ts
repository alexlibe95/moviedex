import { Component, inject, signal, computed, OnInit, effect } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CollectionsService } from '../../../core/services/collections.service';
import { Collection } from '../../../core/models/collection.model';
import { Movie } from '../../../core/models/movie.model';
import { MovieListComponent } from '../../../shared/components/movie-list/movie-list.component';

@Component({
  selector: 'app-collection-details',
  imports: [
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MovieListComponent,
  ],
  templateUrl: './collection-details.component.html',
  styleUrl: './collection-details.component.scss',
})
export class CollectionDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly collectionsService = inject(CollectionsService);
  private readonly snackBar = inject(MatSnackBar);

  readonly collections = signal<Collection[]>([]);
  readonly selectedCollectionId = signal<string | null>(null);
  readonly movies = signal<Movie[]>([]);
  readonly selectedMovieIds = signal<Set<number>>(new Set());
  
  // Use computed to automatically update when selectedMovieIds or movies change
  readonly selectedMovies = computed(() => {
    const ids = this.selectedMovieIds();
    const movies = this.movies();
    return movies.filter((m) => ids.has(m.id));
  });

  constructor() {
    // Update collections when service changes
    effect(() => {
      const serviceCollections = this.collectionsService.collections$();
      this.collections.set(serviceCollections);
    });

    // Update movies when selected collection changes or when collections update
    effect(() => {
      const collectionId = this.selectedCollectionId();
      // Watch collections changes to update movies when collection is modified
      this.collectionsService.collections$();
      if (collectionId) {
        const collection = this.collectionsService.getCollection(collectionId);
        if (collection) {
          this.movies.set(collection.movies);
        } else {
          this.movies.set([]);
        }
      }
    });

    // Clear selection when collection ID changes (but not when movies update)
    effect(() => {
      const collectionId = this.selectedCollectionId();
      // Only clear if collection ID actually changed, not on every effect run
      if (collectionId) {
        // This will run when collectionId changes, clearing selection
        const currentIds = this.selectedMovieIds();
        // Filter out any selected movies that are no longer in the collection
        const collection = this.collectionsService.getCollection(collectionId);
        if (collection) {
          const validIds = new Set(collection.movies.map((m) => m.id));
          const filteredIds = new Set([...currentIds].filter((id) => validIds.has(id)));
          if (filteredIds.size !== currentIds.size) {
            this.selectedMovieIds.set(filteredIds);
          }
        }
      }
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
    // Clear selection when switching collections
    this.selectedMovieIds.set(new Set());
    // selectedMovies is computed, so it will update automatically
    this.selectedCollectionId.set(collectionId);
  }

  getSelectedCollection(): Collection | null {
    const id = this.selectedCollectionId();
    if (!id) {
      return null;
    }
    return this.collectionsService.getCollection(id) || null;
  }

  onMovieSelectionToggle(movie: Movie): void {
    const currentIds = new Set(this.selectedMovieIds());
    if (currentIds.has(movie.id)) {
      currentIds.delete(movie.id);
    } else {
      currentIds.add(movie.id);
    }
    this.selectedMovieIds.set(currentIds);
    // selectedMovies is now computed, so it will update automatically
  }

  removeSelectedMovies(): void {
    const collectionId = this.selectedCollectionId();
    const selectedMovies = this.selectedMovies();

    if (!collectionId || selectedMovies.length === 0) {
      return;
    }

    const collection = this.collectionsService.getCollection(collectionId);
    if (!collection) {
      return;
    }

    let removedCount = 0;
    let notFoundCount = 0;

    for (const movie of selectedMovies) {
      const success = this.collectionsService.removeMovieFromCollection(collectionId, movie.id);
      if (success) {
        removedCount++;
      } else {
        notFoundCount++;
      }
    }

    // Combine messages if both conditions are true to avoid losing messages
    if (removedCount > 0 && notFoundCount > 0) {
      this.snackBar.open(
        `Removed ${removedCount} movie${removedCount > 1 ? 's' : ''} from "${collection.name}". ${notFoundCount} movie${notFoundCount > 1 ? 's were' : ' was'} not found in the collection.`,
        'Close',
        { duration: 4000 }
      );
    } else if (removedCount > 0) {
      this.snackBar.open(
        `Removed ${removedCount} movie${removedCount > 1 ? 's' : ''} from "${collection.name}"`,
        'Close',
        { duration: 3000 }
      );
    } else if (notFoundCount > 0) {
      this.snackBar.open(
        `${notFoundCount} movie${notFoundCount > 1 ? 's were' : ' was'} not found in the collection`,
        'Close',
        { duration: 3000 }
      );
    }

    // Clear selection
    this.selectedMovieIds.set(new Set());
    // selectedMovies is computed, so it will update automatically
  }
}


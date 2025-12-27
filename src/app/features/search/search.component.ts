import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Subject, firstValueFrom } from 'rxjs';

import { TmdbService } from '../../core/api/tmdb.service';
import { Movie } from '../../core/models/movie.model';
import { AlphanumericMinLengthDirective } from '../../core/directives/alphanumeric-min-length.directive';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchStateService } from '../../core/services/search-state.service';
import { CollectionsService } from '../../core/services/collections.service';
import { AddToCollectionDialogComponent } from './add-to-collection-dialog/add-to-collection-dialog.component';

@Component({
  selector: 'app-search',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatTooltipModule,
    ReactiveFormsModule,
    AlphanumericMinLengthDirective,
    SearchResultsComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent implements OnInit, OnDestroy {
  private readonly tmdbService = inject(TmdbService);
  private readonly searchStateService = inject(SearchStateService);
  private readonly collectionsService = inject(CollectionsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroy$ = new Subject<void>();

  protected readonly searchControl = new FormControl('', [Validators.required]);
  readonly searchResults = signal<Movie[]>([]);
  readonly isLoading = signal<boolean | null>(null);

  // Pagination state
  readonly totalResults = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

  // Selection state
  readonly selectedMovieIds = signal<Set<number>>(new Set());
  readonly selectedMovies = signal<Movie[]>([]);

  // Scroll state
  readonly isFormVisible = signal(true);
  private lastScrollTop = 0;
  private readonly scrollThreshold = 10; // Minimum scroll distance to trigger hide/show

  ngOnInit(): void {
    // Restore search state if available
    const savedState = this.searchStateService.getState();
    if (savedState) {
      this.searchControl.setValue(savedState.query);
      this.searchResults.set(savedState.results);
      this.totalResults.set(savedState.totalResults);
      this.currentPage.set(savedState.currentPage);
      this.pageSize.set(savedState.pageSize);
      this.isLoading.set(savedState.isLoading);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(page = 1): void {
    // Mark control as touched to show validation errors
    this.searchControl.markAsTouched();

    // Check if form control is valid before calling the service
    if (this.searchControl.invalid) {
      return;
    }

    const query = this.searchControl.value?.trim();
    if (query && query.length >= 3) {
      this.isLoading.set(true);
      const pageSize = this.pageSize();
      this.tmdbService.searchMovies(query, page, pageSize).subscribe({
        next: (response) => {
          this.searchResults.set(response.results);
          this.totalResults.set(response.total_results);
          this.currentPage.set(response.page - 1); // mat-paginator uses 0-based index
          this.isLoading.set(false);

          // Save search state
          this.searchStateService.setState({
            query,
            results: response.results,
            totalResults: response.total_results,
            currentPage: response.page - 1,
            pageSize,
            isLoading: false,
          });
        },
        error: (error) => {
          console.error('Search error:', error);
          this.isLoading.set(false);
        },
      });
    }
  }

  onPageChange(event: PageEvent): void {
    const newPageSize = event.pageSize;
    const pageSizeChanged = newPageSize !== this.pageSize();

    this.pageSize.set(newPageSize);

    // If page size changed, reset to first page, otherwise use the selected page
    if (pageSizeChanged) {
      this.currentPage.set(0);
      this.onSearch(1);
    } else {
      // Call search with the new page (API uses 1-based, mat-paginator uses 0-based)
      this.onSearch(event.pageIndex + 1);
    }
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: Event): void {
    const target = event.target as HTMLElement;
    const scrollTop = target.scrollTop;

    // Show form when at the top
    if (scrollTop <= this.scrollThreshold) {
      this.isFormVisible.set(true);
    } else {
      // Hide form when scrolling down, show when scrolling up
      const scrollingDown = scrollTop > this.lastScrollTop;
      if (Math.abs(scrollTop - this.lastScrollTop) > this.scrollThreshold) {
        this.isFormVisible.set(!scrollingDown);
      }
    }

    this.lastScrollTop = scrollTop;
  }

  onMovieSelectionToggle(movie: Movie): void {
    const currentIds = new Set(this.selectedMovieIds());
    if (currentIds.has(movie.id)) {
      currentIds.delete(movie.id);
    } else {
      currentIds.add(movie.id);
    }
    this.selectedMovieIds.set(currentIds);
    this.updateSelectedMovies();
  }

  private updateSelectedMovies(): void {
    const ids = this.selectedMovieIds();
    const movies = this.searchResults().filter((m) => ids.has(m.id));
    this.selectedMovies.set(movies);
  }

  async openAddToCollectionDialog(): Promise<void> {
    const selectedMovies = this.selectedMovies();
    if (selectedMovies.length === 0) {
      return;
    }

    const dialogRef = this.dialog.open(AddToCollectionDialogComponent, {
      width: '500px',
      data: { movies: selectedMovies },
    });

    const result = await firstValueFrom(dialogRef.afterClosed());
    if (result && result.collectionId) {
      const collection = this.collectionsService.getCollection(result.collectionId);
      if (collection) {
        let addedCount = 0;
        let skippedCount = 0;

        for (const movie of selectedMovies) {
          const success = this.collectionsService.addMovieToCollection(result.collectionId, movie);
          if (success) {
            addedCount++;
          } else {
            skippedCount++;
          }
        }

        if (addedCount > 0) {
          this.snackBar.open(
            `Added ${addedCount} movie${addedCount > 1 ? 's' : ''} to "${collection.name}"`,
            'Close',
            { duration: 3000 }
          );
        }

        if (skippedCount > 0) {
          this.snackBar.open(
            `${skippedCount} movie${skippedCount > 1 ? 's were' : ' was'} already in the collection`,
            'Close',
            { duration: 3000 }
          );
        }

        // Clear selection
        this.selectedMovieIds.set(new Set());
        this.updateSelectedMovies();
      }
    }
  }
}

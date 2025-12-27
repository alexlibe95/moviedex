import { Component, inject, signal, HostListener, OnInit, OnDestroy } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

import { TmdbService } from '../../core/api/tmdb.service';
import { Movie } from '../../core/models/movie.model';
import { AlphanumericMinLengthDirective } from '../../core/directives/alphanumeric-min-length.directive';
import { SearchResultsComponent } from './search-results/search-results.component';
import { SearchStateService } from '../../core/services/search-state.service';
import {
  MovieDetailsComponent,
  MovieDetailsDialogData,
} from '../movie-details/movie-details.component';

@Component({
  selector: 'app-search',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly destroy$ = new Subject<void>();
  private currentDialogMovieId: number | null = null;
  private currentDialogRef: MatDialogRef<MovieDetailsComponent> | null = null;
  private currentDialogSubscription: Subscription | null = null;
  private isReplacingDialog = false;

  protected readonly searchControl = new FormControl('', [Validators.required]);
  readonly searchResults = signal<Movie[]>([]);
  readonly isLoading = signal<boolean | null>(null);

  // Pagination state
  readonly totalResults = signal(0);
  readonly currentPage = signal(0);
  readonly pageSize = signal(20);

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

    // Listen for route param changes to open dialog when navigating to /movie/:id
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const movieId = params.get('id');
      if (movieId) {
        const id = parseInt(movieId, 10);
        if (!isNaN(id)) {
          // Small delay to ensure component is fully initialized
          setTimeout(() => {
            this.openMovieDialog(id);
          }, 0);
        }
      } else {
        // If movieId is null, we've navigated away from /movie/:id - close the dialog
        this.closeMovieDialog();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up dialog when component is destroyed
    this.closeMovieDialog();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private closeMovieDialog(): void {
    // Unsubscribe from dialog's afterClosed to prevent callbacks
    if (this.currentDialogSubscription) {
      this.currentDialogSubscription.unsubscribe();
      this.currentDialogSubscription = null;
    }
    // Close any open dialogs
    if (this.currentDialogRef) {
      this.currentDialogRef.close();
      this.currentDialogRef = null;
    }
    // Clear tracking variables
    this.currentDialogMovieId = null;
    this.isReplacingDialog = false;
  }

  private openMovieDialog(movieId: number): void {
    // If dialog is already open for the same movie, don't reopen
    if (this.dialog.openDialogs.length > 0 && this.currentDialogMovieId === movieId) {
      return;
    }

    // If dialog is open for a different movie, close it first
    if (this.dialog.openDialogs.length > 0) {
      this.isReplacingDialog = true;
      // Unsubscribe from previous dialog's afterClosed to prevent race condition
      if (this.currentDialogSubscription) {
        this.currentDialogSubscription.unsubscribe();
        this.currentDialogSubscription = null;
      }
      // Close the previous dialog
      if (this.currentDialogRef) {
        this.currentDialogRef.close();
      } else {
        this.dialog.closeAll();
      }
      // Clear tracking variables (subscription already unsubscribed above)
      this.currentDialogMovieId = null;
      this.currentDialogRef = null;
    }

    const dialogData: MovieDetailsDialogData = { movieId };
    const dialogRef = this.dialog.open(MovieDetailsComponent, {
      data: dialogData,
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
    });

    // Track the current movie ID and dialog reference
    this.currentDialogMovieId = movieId;
    this.currentDialogRef = dialogRef;

    // Subscribe to afterClosed and store the subscription
    this.currentDialogSubscription = dialogRef.afterClosed().subscribe(() => {
      // Clear the tracked movie ID and reference when dialog closes
      this.currentDialogMovieId = null;
      this.currentDialogRef = null;
      this.currentDialogSubscription = null;

      // Only navigate back to root if we're not replacing the dialog
      if (!this.isReplacingDialog) {
        this.router.navigate(['/'], { replaceUrl: true });
      }
      this.isReplacingDialog = false;
    });
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
}

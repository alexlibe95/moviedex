import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { SearchComponent } from './search.component';
import { TmdbService } from '../../core/api/tmdb.service';
import { SearchStateService } from '../../core/services/search-state.service';
import { CollectionsService } from '../../core/services/collections.service';
import { Movie } from '../../core/models/movie.model';
import { Collection } from '../../core/models/collection.model';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let mockTmdbService: {
    searchMovies: ReturnType<typeof vi.fn>;
  };
  let mockSearchStateService: {
    getState: ReturnType<typeof vi.fn>;
    setState: ReturnType<typeof vi.fn>;
  };
  let mockCollectionsService: {
    getCollection: ReturnType<typeof vi.fn>;
    addMovieToCollection: ReturnType<typeof vi.fn>;
    collections$: ReturnType<typeof vi.fn>;
  };
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    vote_average: 8.5,
    release_date: '2024-01-01',
  };

  const mockCollection: Collection = {
    id: 'collection1',
    name: 'Test Collection',
    description: 'Test Description',
    movies: [],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(async () => {
    mockTmdbService = {
      searchMovies: vi.fn().mockReturnValue(
        of({
          results: [mockMovie],
          total_results: 1,
          page: 1,
          total_pages: 1,
        })
      ),
    };

    mockSearchStateService = {
      getState: vi.fn().mockReturnValue(null),
      setState: vi.fn(),
    };

    const collectionsSignal = signal<Collection[]>([mockCollection]);
    mockCollectionsService = {
      getCollection: vi.fn().mockReturnValue(mockCollection),
      addMovieToCollection: vi.fn().mockReturnValue(true),
      collections$: vi.fn(() => collectionsSignal()),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(null)),
      } as Partial<MatDialogRef<unknown>>),
    };

    mockSnackBar = {
      open: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [SearchComponent, NoopAnimationsModule],
      providers: [
        { provide: TmdbService, useValue: mockTmdbService },
        { provide: SearchStateService, useValue: mockSearchStateService },
        { provide: CollectionsService, useValue: mockCollectionsService },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty search results', () => {
    expect(component.searchResults().length).toBe(0);
    expect(component.isLoading()).toBeNull();
  });

  it('should have form control with required validator', () => {
    expect(component.searchControl.hasError('required')).toBe(true);
  });
});

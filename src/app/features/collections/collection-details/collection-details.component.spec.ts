import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { vi } from 'vitest';

import { CollectionDetailsComponent } from './collection-details.component';
import { CollectionsService } from '../../../core/services/collections.service';
import { Collection } from '../../../core/models/collection.model';
import { Movie } from '../../../core/models/movie.model';

describe('CollectionDetailsComponent', () => {
  let component: CollectionDetailsComponent;
  let fixture: ComponentFixture<CollectionDetailsComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockCollectionsService: {
    getCollections: ReturnType<typeof vi.fn>;
    getCollection: ReturnType<typeof vi.fn>;
    removeMovieFromCollection: ReturnType<typeof vi.fn>;
    collections$: ReturnType<typeof vi.fn>;
  };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };

  const mockMovies: Movie[] = [
    {
      id: 1,
      title: 'Movie 1',
      overview: 'Overview 1',
      poster_path: '/poster1.jpg',
      vote_average: 8.5,
      release_date: '2024-01-01',
    },
    {
      id: 2,
      title: 'Movie 2',
      overview: 'Overview 2',
      poster_path: '/poster2.jpg',
      vote_average: 7.5,
      release_date: '2024-02-01',
    },
  ];

  const mockCollection: Collection = {
    id: 'collection1',
    name: 'Test Collection',
    description: 'Test Description',
    movies: mockMovies,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(async () => {
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
    mockSnackBar = { open: vi.fn() };
    const collectionsSignal = signal<Collection[]>([mockCollection]);
    mockCollectionsService = {
      getCollections: vi.fn().mockReturnValue([mockCollection]),
      getCollection: vi.fn().mockReturnValue(mockCollection),
      removeMovieFromCollection: vi.fn().mockReturnValue(true),
      collections$: vi.fn().mockReturnValue(collectionsSignal()),
    };

    await TestBed.configureTestingModule({
      imports: [CollectionDetailsComponent, NoopAnimationsModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => 'collection1' } },
          },
        },
        { provide: Router, useValue: mockRouter },
        { provide: CollectionsService, useValue: mockCollectionsService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collection from route on init', () => {
    expect(mockCollectionsService.getCollection).toHaveBeenCalledWith('collection1');
    expect(component.selectedCollectionId()).toBe('collection1');
  });

  it('should redirect to collections if collection not found', () => {
    mockCollectionsService.getCollection.mockReturnValue(undefined);
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections']);
  });

  it('should update movies when collection changes', () => {
    expect(component.movies()).toEqual(mockMovies);
  });

  it('should handle movie selection toggle', () => {
    component.onMovieSelectionToggle(mockMovies[0]);
    expect(component.selectedMovieIds().has(1)).toBe(true);

    component.onMovieSelectionToggle(mockMovies[0]);
    expect(component.selectedMovieIds().has(1)).toBe(false);
  });

  it('should update selectedMovies computed signal when selection changes', () => {
    component.onMovieSelectionToggle(mockMovies[0]);
    expect(component.selectedMovies().length).toBe(1);
    expect(component.selectedMovies()[0].id).toBe(1);
  });

  it('should remove selected movies from collection', () => {
    component.onMovieSelectionToggle(mockMovies[0]);
    component.onMovieSelectionToggle(mockMovies[1]);

    component.removeSelectedMovies();

    expect(mockCollectionsService.removeMovieFromCollection).toHaveBeenCalledTimes(2);
    expect(mockCollectionsService.removeMovieFromCollection).toHaveBeenCalledWith('collection1', 1);
    expect(mockCollectionsService.removeMovieFromCollection).toHaveBeenCalledWith('collection1', 2);
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  it('should clear selection after removing movies', () => {
    component.onMovieSelectionToggle(mockMovies[0]);
    component.removeSelectedMovies();
    expect(component.selectedMovieIds().size).toBe(0);
  });

  it('should handle collection change', () => {
    const newCollection: Collection = {
      id: 'collection2',
      name: 'New Collection',
      movies: [],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    };
    mockCollectionsService.getCollection.mockReturnValue(newCollection);

    component.onCollectionChange('collection2');

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections', 'collection2'], {
      replaceUrl: true,
    });
    expect(component.selectedCollectionId()).toBe('collection2');
    expect(component.selectedMovieIds().size).toBe(0);
  });

  it('should get selected collection', () => {
    const collection = component.getSelectedCollection();
    expect(collection).toEqual(mockCollection);
  });

  it('should return null when no collection is selected', () => {
    component.selectedCollectionId.set(null);
    const collection = component.getSelectedCollection();
    expect(collection).toBeNull();
  });

  it('should not remove movies if none are selected', () => {
    component.removeSelectedMovies();
    expect(mockCollectionsService.removeMovieFromCollection).not.toHaveBeenCalled();
  });
});


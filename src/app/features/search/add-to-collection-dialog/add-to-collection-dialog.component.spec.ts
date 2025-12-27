import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { signal, computed } from '@angular/core';

import { AddToCollectionDialogComponent } from './add-to-collection-dialog.component';
import { Movie } from '../../../core/models/movie.model';
import { CollectionsService } from '../../../core/services/collections.service';
import { Collection } from '../../../core/models/collection.model';

describe('AddToCollectionDialogComponent', () => {
  let component: AddToCollectionDialogComponent;
  let fixture: ComponentFixture<AddToCollectionDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockCollectionsService: {
    getCollections: ReturnType<typeof vi.fn>;
    getCollection: ReturnType<typeof vi.fn>;
    createCollection: ReturnType<typeof vi.fn>;
    collections$: ReturnType<typeof computed>;
  };

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

  const mockCollections: Collection[] = [
    {
      id: 'collection1',
      name: 'Collection 1',
      description: 'Description 1',
      movies: [],
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'collection2',
      name: 'Collection 2',
      description: 'Description 2',
      movies: [mockMovies[0]],
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
    },
  ];

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    const collectionsSignal = signal(mockCollections);
    mockCollectionsService = {
      getCollections: vi.fn().mockReturnValue(mockCollections),
      getCollection: vi.fn().mockReturnValue(mockCollections[0]),
      createCollection: vi.fn().mockReturnValue({
        id: 'new-collection',
        name: 'New Collection',
        description: 'New Description',
        movies: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      }),
      collections$: computed(() => collectionsSignal()),
    };

    await TestBed.configureTestingModule({
      imports: [AddToCollectionDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { movies: mockMovies } },
        {
          provide: MatDialog,
          useValue: {
            open: vi.fn(),
            openDialogs: [],
          },
        },
        { provide: CollectionsService, useValue: mockCollectionsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with movies from dialog data', () => {
    expect(component.movies).toEqual(mockMovies);
  });

  it('should load collections on init', () => {
    expect(mockCollectionsService.getCollections).toHaveBeenCalled();
    // Wait for effect to run
    fixture.detectChanges();
    expect(component.collections().length).toBeGreaterThan(0);
  });

  it('should display collection count in template', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain(mockMovies.length.toString());
  });

  it('should close dialog when onCancel is called', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should close dialog with collection ID when onAdd is called', () => {
    component.selectedCollectionId.set('collection1');
    component.onAdd();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ collectionId: 'collection1' });
  });

  it('should not close dialog when onAdd is called without selection', () => {
    component.selectedCollectionId.set(null);
    component.onAdd();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('should handle empty collections list', () => {
    mockCollectionsService.getCollections.mockReturnValue([]);
    component.ngOnInit();
    expect(component.collections().length).toBe(0);
  });
});


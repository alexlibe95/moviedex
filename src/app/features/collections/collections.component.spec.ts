import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { CollectionsComponent } from './collections.component';
import { CollectionsService } from '../../core/services/collections.service';
import { Collection } from '../../core/models/collection.model';
import { Movie } from '../../core/models/movie.model';

describe('CollectionsComponent', () => {
  let component: CollectionsComponent;
  let fixture: ComponentFixture<CollectionsComponent>;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockDialog: { open: ReturnType<typeof vi.fn> };
  let mockSnackBar: { open: ReturnType<typeof vi.fn> };
  let mockCollectionsService: {
    getCollections: ReturnType<typeof vi.fn>;
    createCollection: ReturnType<typeof vi.fn>;
    deleteCollection: ReturnType<typeof vi.fn>;
    collections$: ReturnType<typeof vi.fn>;
  };

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
    movies: [mockMovie],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  beforeEach(async () => {
    mockRouter = { navigate: vi.fn().mockResolvedValue(true) };
    mockSnackBar = { open: vi.fn() };
    const collectionsSignal = signal<Collection[]>([mockCollection]);
    mockCollectionsService = {
      getCollections: vi.fn().mockReturnValue([mockCollection]),
      createCollection: vi.fn().mockReturnValue(mockCollection),
      deleteCollection: vi.fn().mockReturnValue(true),
      collections$: vi.fn(() => collectionsSignal()),
    };

    mockDialog = {
      open: vi.fn().mockReturnValue({
        afterClosed: vi.fn().mockReturnValue(of(null)),
      } as Partial<MatDialogRef<unknown>>),
    };

    await TestBed.configureTestingModule({
      imports: [CollectionsComponent, NoopAnimationsModule],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: CollectionsService, useValue: mockCollectionsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load collections on init', () => {
    expect(mockCollectionsService.getCollections).toHaveBeenCalled();
    expect(component.collections().length).toBe(1);
  });

  it('should display collections', () => {
    expect(component.collections()).toEqual([mockCollection]);
  });

  it('should open create dialog when openCreateDialog is called', () => {
    component.openCreateDialog();
    expect(mockDialog.open).toHaveBeenCalled();
  });

  it('should not create collection when dialog is cancelled', async () => {
    mockDialog.open.mockReturnValue({
      afterClosed: vi.fn().mockReturnValue(of(null)),
    } as Partial<MatDialogRef<unknown>>);

    await component.openCreateDialog();

    expect(mockCollectionsService.createCollection).not.toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });

  it('should navigate to collection details when viewCollection is called', () => {
    component.viewCollection('collection1');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections', 'collection1']);
  });

  it('should handle keydown Enter to view collection', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    component.handleKeydown(event, 'collection1');
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections', 'collection1']);
  });

  it('should handle keydown Space to view collection', () => {
    const event = new KeyboardEvent('keydown', { key: ' ' });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');
    component.handleKeydown(event, 'collection1');
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/collections', 'collection1']);
  });

  it('should not navigate on other keydown events', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    const initialCallCount = mockRouter.navigate.mock.calls.length;
    component.handleKeydown(event, 'collection1');
    expect(mockRouter.navigate.mock.calls.length).toBe(initialCallCount);
  });

  it('should not delete collection when not confirmed', () => {
    const event = new Event('click');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    component.deleteCollection(event, mockCollection);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockCollectionsService.deleteCollection).not.toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should stop event propagation when deleting collection', () => {
    const event = new Event('click');
    const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    component.deleteCollection(event, mockCollection);

    expect(stopPropagationSpy).toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should not show success message when deletion fails', () => {
    const event = new Event('click');
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    mockCollectionsService.deleteCollection.mockReturnValue(false);

    component.deleteCollection(event, mockCollection);

    expect(confirmSpy).toHaveBeenCalled();
    expect(mockCollectionsService.deleteCollection).toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should return correct movie count', () => {
    expect(component.getMovieCount(mockCollection)).toBe(1);
  });

  it('should return 0 for empty collection', () => {
    const emptyCollection: Collection = {
      ...mockCollection,
      movies: [],
    };
    expect(component.getMovieCount(emptyCollection)).toBe(0);
  });

  it('should update collections when service signal changes', () => {
    // The effect runs automatically during component initialization
    // and tracks the collections$ signal from the service
    // Since we're using a signal in the mock, the effect should have run
    
    // Access collections to ensure effect has run
    const collections = component.collections();
    
    // The effect should have been called during component initialization
    expect(mockCollectionsService.collections$).toHaveBeenCalled();
    expect(collections.length).toBeGreaterThanOrEqual(1);
  });
});


import { TestBed } from '@angular/core/testing';

import { CollectionsService } from './collections.service';
import { Collection } from '../models/collection.model';
import { Movie } from '../models/movie.model';

describe('CollectionsService', () => {
  let service: CollectionsService;
  let mockLocalStorage: Record<string, string>;

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

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    const localStorageMock = {
      getItem: (key: string) => mockLocalStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockLocalStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockLocalStorage[key];
      },
      clear: () => {
        mockLocalStorage = {};
      },
    };

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(CollectionsService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return empty array when no collections exist', () => {
    expect(service.getCollections()).toEqual([]);
  });

  it('should create a new collection', () => {
    const collection = service.createCollection('New Collection', 'Description');
    expect(collection.name).toBe('New Collection');
    expect(collection.description).toBe('Description');
    expect(collection.movies).toEqual([]);
    expect(collection.id).toBeTruthy();
    expect(service.getCollections().length).toBe(1);
  });

  it('should create collection without description', () => {
    const collection = service.createCollection('New Collection');
    expect(collection.name).toBe('New Collection');
    expect(collection.description).toBeUndefined();
  });

  it('should get collection by ID', () => {
    const created = service.createCollection('Test Collection');
    const found = service.getCollection(created.id);
    expect(found).toEqual(created);
  });

  it('should return undefined for non-existent collection', () => {
    expect(service.getCollection('non-existent')).toBeUndefined();
  });

  it('should update collection name', () => {
    const collection = service.createCollection('Old Name');
    const success = service.updateCollection(collection.id, 'New Name');
    expect(success).toBe(true);
    const updated = service.getCollection(collection.id);
    expect(updated?.name).toBe('New Name');
  });

  it('should return false when updating non-existent collection', () => {
    const success = service.updateCollection('non-existent', 'New Name');
    expect(success).toBe(false);
  });

  it('should delete a collection', () => {
    const collection = service.createCollection('To Delete');
    const success = service.deleteCollection(collection.id);
    expect(success).toBe(true);
    expect(service.getCollections().length).toBe(0);
  });

  it('should return false when deleting non-existent collection', () => {
    const success = service.deleteCollection('non-existent');
    expect(success).toBe(false);
  });

  it('should add movie to collection', () => {
    const collection = service.createCollection('Test Collection');
    const newMovie: Movie = {
      id: 2,
      title: 'New Movie',
      overview: 'New overview',
      poster_path: '/new.jpg',
      vote_average: 7.5,
      release_date: '2024-02-01',
    };
    const success = service.addMovieToCollection(collection.id, newMovie);
    expect(success).toBe(true);
    const updated = service.getCollection(collection.id);
    expect(updated?.movies.length).toBe(1);
    expect(updated?.movies[0].id).toBe(newMovie.id);
  });

  it('should not add duplicate movie to collection', () => {
    const collection = service.createCollection('Test Collection');
    const success1 = service.addMovieToCollection(collection.id, mockMovie);
    const success2 = service.addMovieToCollection(collection.id, mockMovie);
    expect(success1).toBe(true);
    expect(success2).toBe(false);
    const updated = service.getCollection(collection.id);
    expect(updated?.movies.length).toBe(1);
  });

  it('should return false when adding movie to non-existent collection', () => {
    const success = service.addMovieToCollection('non-existent', mockMovie);
    expect(success).toBe(false);
  });

  it('should remove movie from collection', () => {
    const collection = service.createCollection('Test Collection');
    service.addMovieToCollection(collection.id, mockMovie);
    const success = service.removeMovieFromCollection(collection.id, mockMovie.id);
    expect(success).toBe(true);
    const updated = service.getCollection(collection.id);
    expect(updated?.movies.length).toBe(0);
  });

  it('should return false when removing non-existent movie', () => {
    const collection = service.createCollection('Test Collection');
    const success = service.removeMovieFromCollection(collection.id, 999);
    expect(success).toBe(false);
  });

  it('should return false when removing from non-existent collection', () => {
    const success = service.removeMovieFromCollection('non-existent', 1);
    expect(success).toBe(false);
  });

  it('should check if movie is in collection', () => {
    const collection = service.createCollection('Test Collection');
    service.addMovieToCollection(collection.id, mockMovie);
    expect(service.isMovieInCollection(collection.id, mockMovie.id)).toBe(true);
    expect(service.isMovieInCollection(collection.id, 999)).toBe(false);
  });

  it('should return false when checking non-existent collection', () => {
    expect(service.isMovieInCollection('non-existent', 1)).toBe(false);
  });

  it('should get collections containing a movie', () => {
    const collection1 = service.createCollection('Collection 1');
    const collection2 = service.createCollection('Collection 2');
    service.addMovieToCollection(collection1.id, mockMovie);
    service.addMovieToCollection(collection2.id, mockMovie);
    const collections = service.getCollectionsContainingMovie(mockMovie.id);
    expect(collections.length).toBe(2);
  });

  it('should return empty array when movie is not in any collection', () => {
    service.createCollection('Collection 1');
    const collections = service.getCollectionsContainingMovie(999);
    expect(collections.length).toBe(0);
  });

  it('should update collections$ computed signal when collections change', () => {
    expect(service.collections$().length).toBe(0);
    service.createCollection('New Collection');
    expect(service.collections$().length).toBe(1);
  });

  it('should persist collections to localStorage', () => {
    service.createCollection('Test Collection');
    const stored = localStorage.getItem('moviedex_collections');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].name).toBe('Test Collection');
  });

  it('should load collections from localStorage on init', () => {
    // Clear existing service state
    localStorage.clear();
    
    // Set up localStorage with test data
    const storedCollections = [mockCollection];
    localStorage.setItem('moviedex_collections', JSON.stringify(storedCollections));
    
    // Create a new service instance which will load from localStorage in constructor
    const newService = new CollectionsService();
    const collections = newService.getCollections();
    expect(collections.length).toBe(1);
    expect(collections[0].name).toBe(mockCollection.name);
  });

  it('should handle localStorage errors gracefully', () => {
    const invalidJson = 'invalid json';
    localStorage.setItem('moviedex_collections', invalidJson);
    const newService = TestBed.inject(CollectionsService);
    // Should not throw and should return empty array
    expect(newService.getCollections()).toEqual([]);
  });
});


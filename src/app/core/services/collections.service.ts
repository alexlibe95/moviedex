import { Injectable, signal, computed } from '@angular/core';
import { Collection } from '../models/collection.model';
import { Movie } from '../models/movie.model';

const STORAGE_KEY = 'moviedex_collections';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  private readonly collections = signal<Collection[]>(this.loadFromStorage());

  /**
   * Get all collections as a readonly signal
   */
  readonly collections$ = computed(() => this.collections());

  constructor() {
    // Initialize collections from localStorage
    this.loadCollections();
  }

  /**
   * Get all collections
   */
  getCollections(): Collection[] {
    return this.collections();
  }

  /**
   * Get a collection by ID
   */
  getCollection(id: string): Collection | undefined {
    return this.collections().find((c) => c.id === id);
  }

  /**
   * Create a new collection
   */
  createCollection(name: string, description?: string): Collection {
    const newCollection: Collection = {
      id: this.generateId(),
      name: name.trim(),
      description: description?.trim() || undefined,
      movies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedCollections = [...this.collections(), newCollection];
    this.collections.set(updatedCollections);
    this.saveToStorage(updatedCollections);

    return newCollection;
  }

  /**
   * Update a collection's name
   */
  updateCollection(id: string, name: string): boolean {
    const collections = this.collections();
    const index = collections.findIndex((c) => c.id === id);

    if (index === -1) {
      return false;
    }

    const updatedCollections = [...collections];
    updatedCollections[index] = {
      ...updatedCollections[index],
      name: name.trim(),
      updatedAt: new Date().toISOString(),
    };

    this.collections.set(updatedCollections);
    this.saveToStorage(updatedCollections);
    return true;
  }

  /**
   * Delete a collection
   */
  deleteCollection(id: string): boolean {
    const collections = this.collections();
    const filteredCollections = collections.filter((c) => c.id !== id);

    if (filteredCollections.length === collections.length) {
      return false; // Collection not found
    }

    this.collections.set(filteredCollections);
    this.saveToStorage(filteredCollections);
    return true;
  }

  /**
   * Add a movie to a collection
   */
  addMovieToCollection(collectionId: string, movie: Movie): boolean {
    const collections = this.collections();
    const index = collections.findIndex((c) => c.id === collectionId);

    if (index === -1) {
      return false;
    }

    // Check if movie already exists in collection
    const collection = collections[index];
    if (collection.movies.some((m) => m.id === movie.id)) {
      return false; // Movie already in collection
    }

    const updatedCollections = [...collections];
    updatedCollections[index] = {
      ...collection,
      movies: [...collection.movies, movie],
      updatedAt: new Date().toISOString(),
    };

    this.collections.set(updatedCollections);
    this.saveToStorage(updatedCollections);
    return true;
  }

  /**
   * Remove a movie from a collection
   */
  removeMovieFromCollection(collectionId: string, movieId: number): boolean {
    const collections = this.collections();
    const index = collections.findIndex((c) => c.id === collectionId);

    if (index === -1) {
      return false;
    }

    const collection = collections[index];
    const filteredMovies = collection.movies.filter((m) => m.id !== movieId);

    if (filteredMovies.length === collection.movies.length) {
      return false; // Movie not found in collection
    }

    const updatedCollections = [...collections];
    updatedCollections[index] = {
      ...collection,
      movies: filteredMovies,
      updatedAt: new Date().toISOString(),
    };

    this.collections.set(updatedCollections);
    this.saveToStorage(updatedCollections);
    return true;
  }

  /**
   * Check if a movie is in a collection
   */
  isMovieInCollection(collectionId: string, movieId: number): boolean {
    const collection = this.getCollection(collectionId);
    if (!collection) {
      return false;
    }
    return collection.movies.some((m) => m.id === movieId);
  }

  /**
   * Get all collections that contain a specific movie
   */
  getCollectionsContainingMovie(movieId: number): Collection[] {
    return this.collections().filter((c) => c.movies.some((m) => m.id === movieId));
  }

  /**
   * Load collections from localStorage
   */
  private loadCollections(): void {
    const stored = this.loadFromStorage();
    this.collections.set(stored);
  }

  /**
   * Load collections from localStorage
   */
  private loadFromStorage(): Collection[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading collections from localStorage:', error);
    }
    return [];
  }

  /**
   * Save collections to localStorage
   */
  private saveToStorage(collections: Collection[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch (error) {
      console.error('Error saving collections to localStorage:', error);
    }
  }

  /**
   * Generate a unique ID for a collection
   */
  private generateId(): string {
    return `collection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


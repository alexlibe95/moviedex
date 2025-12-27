import { Injectable, signal } from '@angular/core';
import { Movie } from '../models/movie.model';

export interface SearchState {
  query: string;
  results: Movie[];
  totalResults: number;
  currentPage: number;
  pageSize: number;
  isLoading: boolean | null;
}

@Injectable({
  providedIn: 'root',
})
export class SearchStateService {
  private readonly state = signal<SearchState | null>(null);

  getState(): SearchState | null {
    return this.state();
  }

  setState(state: SearchState): void {
    this.state.set(state);
  }

  clearState(): void {
    this.state.set(null);
  }

  hasState(): boolean {
    return this.state() !== null;
  }
}


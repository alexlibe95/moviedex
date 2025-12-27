import { TestBed } from '@angular/core/testing';
import { SearchStateService, SearchState } from './search-state.service';
import { Movie } from '../models/movie.model';

describe('SearchStateService', () => {
  let service: SearchStateService;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    vote_average: 8.5,
    release_date: '2024-01-01',
  };

  const mockState: SearchState = {
    query: 'test query',
    results: [mockMovie],
    totalResults: 100,
    currentPage: 0,
    pageSize: 20,
    isLoading: false,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null initially', () => {
    expect(service.getState()).toBeNull();
    expect(service.hasState()).toBe(false);
  });

  it('should set and get state', () => {
    service.setState(mockState);
    const state = service.getState();

    expect(state).toEqual(mockState);
    expect(state?.query).toBe('test query');
    expect(state?.results.length).toBe(1);
    expect(state?.totalResults).toBe(100);
  });

  it('should update state when setState is called multiple times', () => {
    service.setState(mockState);
    const updatedState: SearchState = {
      ...mockState,
      query: 'updated query',
      totalResults: 200,
    };

    service.setState(updatedState);
    const state = service.getState();

    expect(state?.query).toBe('updated query');
    expect(state?.totalResults).toBe(200);
  });

  it('should clear state', () => {
    service.setState(mockState);
    expect(service.hasState()).toBe(true);

    service.clearState();
    expect(service.getState()).toBeNull();
    expect(service.hasState()).toBe(false);
  });

  it('should handle empty results array', () => {
    const emptyState: SearchState = {
      ...mockState,
      results: [],
      totalResults: 0,
    };

    service.setState(emptyState);
    const state = service.getState();

    expect(state?.results.length).toBe(0);
    expect(state?.totalResults).toBe(0);
  });

  it('should handle loading state', () => {
    const loadingState: SearchState = {
      ...mockState,
      isLoading: true,
    };

    service.setState(loadingState);
    const state = service.getState();

    expect(state?.isLoading).toBe(true);
  });

  it('should handle null loading state', () => {
    const nullLoadingState: SearchState = {
      ...mockState,
      isLoading: null,
    };

    service.setState(nullLoadingState);
    const state = service.getState();

    expect(state?.isLoading).toBeNull();
  });

  it('should preserve pagination state', () => {
    const paginationState: SearchState = {
      ...mockState,
      currentPage: 2,
      pageSize: 40,
    };

    service.setState(paginationState);
    const state = service.getState();

    expect(state?.currentPage).toBe(2);
    expect(state?.pageSize).toBe(40);
  });
});

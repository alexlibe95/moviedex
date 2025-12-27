import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';

import { TmdbService } from './tmdb.service';
import { MovieSearchResponse } from '../models/movie-search.model';
import { Movie } from '../models/movie.model';

describe('TmdbService', () => {
  let service: TmdbService;
  let httpMock: HttpTestingController;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    vote_average: 8.5,
    release_date: '2024-01-01',
  };

  const mockSearchResponse: MovieSearchResponse = {
    page: 1,
    results: [mockMovie],
    total_pages: 1,
    total_results: 1,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TmdbService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('searchMovies', () => {
    it('should search movies with default parameters', () => {
      const query = 'test';

      service.searchMovies(query).subscribe((response) => {
        expect(response).toBeDefined();
        expect(response.results.length).toBeGreaterThanOrEqual(0);
      });

      const req = httpMock.expectOne(
        (request) => request.url.includes('/search/movie') && request.params.get('query') === query
      );

      expect(req.request.method).toBe('GET');
      req.flush(mockSearchResponse);
    });

    it('should search movies with custom page and pageSize', () => {
      const query = 'test';
      const page = 2;
      const pageSize = 20;

      service.searchMovies(query, page, pageSize).subscribe((response) => {
        expect(response).toBeDefined();
      });

      const req = httpMock.expectOne(
        (request) =>
          request.url.includes('/search/movie') &&
          request.params.get('query') === query &&
          request.params.get('page') === '2'
      );

      req.flush(mockSearchResponse);
    });

    it('should trim query string', () => {
      const query = '  test query  ';

      service.searchMovies(query).subscribe(() => {
        // Test passes if no error
      });

      const req = httpMock.expectOne((request) => request.params.get('query') === 'test query');

      req.flush(mockSearchResponse);
    });

    it('should throw error for empty query', () => {
      expect(() => service.searchMovies('')).toThrow('Search query cannot be empty');
      expect(() => service.searchMovies('   ')).toThrow('Search query cannot be empty');
    });

    it('should throw error for invalid page number', () => {
      expect(() => service.searchMovies('test', 0)).toThrow(
        'Page number must be a positive integer'
      );
      expect(() => service.searchMovies('test', -1)).toThrow(
        'Page number must be a positive integer'
      );
      expect(() => service.searchMovies('test', 1.5)).toThrow(
        'Page number must be a positive integer'
      );
    });

    it('should handle HTTP errors', () => {
      const query = 'test';
      const errorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error).toBeDefined();
          expect(error.message).toContain('Server error');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush('Server error', errorResponse);
    });

    it('should handle 400 error', () => {
      const query = 'test';
      const errorResponse = new HttpErrorResponse({
        error: 'Bad Request',
        status: 400,
        statusText: 'Bad Request',
      });

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Invalid request');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush('Bad Request', errorResponse);
    });

    it('should handle 401 error', () => {
      const query = 'test';
      const errorResponse = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized',
      });

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Authentication failed');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush('Unauthorized', errorResponse);
    });

    it('should handle 404 error', () => {
      const query = 'test';
      const errorResponse = new HttpErrorResponse({
        error: 'Not Found',
        status: 404,
        statusText: 'Not Found',
      });

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Resource not found');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush('Not Found', errorResponse);
    });

    it('should handle 429 error (rate limit)', () => {
      const query = 'test';
      const errorResponse = new HttpErrorResponse({
        error: 'Too Many Requests',
        status: 429,
        statusText: 'Too Many Requests',
      });

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Too many requests');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush('Too Many Requests', errorResponse);
    });

    it('should handle client-side errors', () => {
      const query = 'test';

      service.searchMovies(query).subscribe({
        next: () => {
          throw new Error('should have failed');
        },
        error: (error) => {
          expect(error.message).toContain('Client error');
        },
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.error(new ErrorEvent('Network error', { message: 'Connection failed' }));
    });

    it('should slice results for pageSize smaller than API response', () => {
      const query = 'test';
      const pageSize = 10;
      const largeResponse: MovieSearchResponse = {
        page: 1,
        results: Array.from({ length: 20 }, (_, i) => ({
          ...mockMovie,
          id: i + 1,
        })),
        total_pages: 1,
        total_results: 20,
      };

      service.searchMovies(query, 1, pageSize).subscribe((response) => {
        expect(response.results.length).toBe(pageSize);
      });

      const req = httpMock.expectOne((request) => request.url.includes('/search/movie'));
      req.flush(largeResponse);
    });

    it('should fetch multiple pages when pageSize exceeds API page size', () => {
      const query = 'test';
      const pageSize = 40;
      const page1Response: MovieSearchResponse = {
        page: 1,
        results: Array.from({ length: 20 }, (_, i) => ({
          ...mockMovie,
          id: i + 1,
        })),
        total_pages: 2,
        total_results: 40,
      };
      const page2Response: MovieSearchResponse = {
        page: 2,
        results: Array.from({ length: 20 }, (_, i) => ({
          ...mockMovie,
          id: i + 21,
        })),
        total_pages: 2,
        total_results: 40,
      };

      service.searchMovies(query, 1, pageSize).subscribe((response) => {
        expect(response.results.length).toBe(pageSize);
        expect(response.page).toBe(1);
      });

      const requests = httpMock.match((request) => request.url.includes('/search/movie'));
      expect(requests.length).toBe(2);
      requests[0].flush(page1Response);
      requests[1].flush(page2Response);
    });
  });
});

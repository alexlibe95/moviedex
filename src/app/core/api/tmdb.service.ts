import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MovieSearchResponse } from '../models/movie-search.model';
import { Observable, throwError, catchError, retry } from 'rxjs';
import { environment } from '../../../../environment';

/**
 * Service for interacting with The Movie Database (TMDB) API.
 * Provides methods for searching movies, getting movie details, creating guest sessions, and rating movies.
 */
@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly apiKey = environment.apiKey;
  private readonly maxRetries = 2;
  private readonly retryDelay = 1000;

  constructor() {
    if (!this.apiKey) {
      console.error(
        'TMDB API key is not configured. Please set apiKey in your environment.ts file.'
      );
    }
  }

  /**
   * Adds the API key to HTTP parameters.
   * @param params - Optional existing HttpParams to extend
   * @returns HttpParams with API key added
   */
  private withApiKey(params?: HttpParams): HttpParams {
    return (params ?? new HttpParams()).set('api_key', this.apiKey);
  }

  /**
   * Handles HTTP errors and converts them to user-friendly error messages.
   * @param error - The HTTP error response
   * @returns Observable that throws a formatted error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Authentication failed. Please check your API key.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 429:
          errorMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
        case 502:
        case 503:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = `Server error: ${error.status} ${error.statusText}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Validates that a query string is not empty.
   * @param query - The search query string
   * @throws Error if query is invalid
   */
  private validateQuery(query: string): void {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }
  }

  /**
   * Validates that a page number is valid.
   * @param page - The page number to validate
   * @throws Error if page is invalid
   */
  private validatePage(page: number): void {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page number must be a positive integer');
    }
  }

  /**
   * Searches for movies by query string.
   * @param query - The search query string
   * @param page - Page number (default: 1)
   * @returns Observable of MovieSearchResponse
   * @throws Error if query is invalid or API call fails
   */
  searchMovies(query: string, page = 1): Observable<MovieSearchResponse> {
    this.validateQuery(query);
    this.validatePage(page);

    const params = this.withApiKey(
      new HttpParams().set('query', query.trim()).set('page', page.toString())
    );

    return this.http
      .get<MovieSearchResponse>(`${this.apiUrl}/search/movie`, { params })
      .pipe(
        retry({ count: this.maxRetries, delay: this.retryDelay }),
        catchError(this.handleError)
      );
  }
}

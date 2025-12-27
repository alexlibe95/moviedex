import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { MovieDetailsComponent, MovieDetailsDialogData } from './movie-details.component';
import { MovieDetails } from '../../core/models/movie-details.model';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;
  let dialogRef: MatDialogRef<MovieDetailsComponent>;

  const mockDialogData: MovieDetailsDialogData = {
    movieId: 123,
  };

  const mockMovieDetails: MovieDetails = {
    id: 123,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    budget: 1000000,
    release_date: '2024-01-01',
    revenue: 5000000,
    vote_average: 8.5,
    vote_count: 1000,
    spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
  };

  beforeEach(() => {
    dialogRef = {
      close: () => {
        return;
      },
    } as MatDialogRef<MovieDetailsComponent>;

    TestBed.configureTestingModule({
      imports: [MovieDetailsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockDialogData,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
      ],
    });

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load movie details on init', () => {
    const httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = httpMock.expectOne((request) =>
      request.url.includes(`/movie/${mockDialogData.movieId}`)
    );
    req.flush(mockMovieDetails);

    expect(component.movieDetails()).toEqual(mockMovieDetails);
    expect(component.isLoading()).toBe(false);
  });

  it('should handle rating submission', () => {
    component.movieDetails.set(mockMovieDetails);
    fixture.detectChanges();

    expect(component.userRating()).toBeNull();
    component.onRatingSubmitted(8);
    expect(component.userRating()).toBe(8);
  });

  it('should close dialog when close is called', () => {
    const closeSpy = vi.spyOn(dialogRef, 'close');
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });
});

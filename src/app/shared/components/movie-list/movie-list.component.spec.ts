import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';
import { of } from 'rxjs';

import { MovieListComponent } from './movie-list.component';
import { Movie } from '../../../core/models/movie.model';
import { MovieDetailsComponent } from '../movie-details/movie-details.component';

describe('MovieListComponent', () => {
  let component: MovieListComponent;
  let fixture: ComponentFixture<MovieListComponent>;
  let mockDialog: { open: ReturnType<typeof vi.fn> };

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

  beforeEach(async () => {
    mockDialog = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [MovieListComponent, NoopAnimationsModule],
      providers: [{ provide: MatDialog, useValue: mockDialog }],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movies', mockMovies);
    fixture.componentRef.setInput('isLoading', false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display loading spinner when isLoading is true', () => {
    fixture.componentRef.setInput('isLoading', true);
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should display movies when loaded', () => {
    const movieCards = fixture.nativeElement.querySelectorAll('app-movie-card');
    expect(movieCards.length).toBe(mockMovies.length);
  });

  it('should display empty message when no movies', () => {
    fixture.componentRef.setInput('movies', []);
    fixture.detectChanges();

    const emptyMessage = fixture.nativeElement.querySelector('p');
    expect(emptyMessage?.textContent).toContain('No movies found');
  });

  it('should open movie details dialog when openMovieDetails is called', () => {
    const dialogRef = { afterClosed: () => of(null) };
    (mockDialog.open as ReturnType<typeof vi.fn>).mockReturnValue(dialogRef as unknown as ReturnType<MatDialog['open']>);

    component.openMovieDetails(1);

    expect(mockDialog.open).toHaveBeenCalledWith(MovieDetailsComponent, {
      data: { movieId: 1 },
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
    });
  });

  it('should emit movieSelectionToggle when onMovieSelectionToggle is called', () => {
    const emitSpy = vi.spyOn(component.movieSelectionToggle, 'emit');
    component.onMovieSelectionToggle(mockMovies[0]);
    expect(emitSpy).toHaveBeenCalledWith(mockMovies[0]);
  });

  it('should check if movie is selected', () => {
    const selectedIds = new Set([1]);
    fixture.componentRef.setInput('selectedMovieIds', selectedIds);
    fixture.detectChanges();

    expect(component.isMovieSelected(1)).toBe(true);
    expect(component.isMovieSelected(2)).toBe(false);
  });

  it('should pass selectedMovieIds to movie cards', () => {
    const selectedIds = new Set([1]);
    fixture.componentRef.setInput('selectedMovieIds', selectedIds);
    fixture.detectChanges();

    const movieCard = fixture.nativeElement.querySelector('app-movie-card');
    expect(movieCard).toBeTruthy();
  });
});


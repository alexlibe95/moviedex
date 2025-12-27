import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieCardComponent } from './movie-card.component';
import { Movie } from '../../../../core/models/movie.model';

describe('MovieCardComponent', () => {
  let component: MovieCardComponent;
  let fixture: ComponentFixture<MovieCardComponent>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    vote_average: 8.5,
    release_date: '2024-01-01',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movie', mockMovie);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title', () => {
    const titleElement = fixture.nativeElement.querySelector('mat-card-title');
    expect(titleElement?.textContent?.trim()).toBe(mockMovie.title);
  });

  it('should display movie poster when available', () => {
    const posterImage = fixture.nativeElement.querySelector('img');
    expect(posterImage).toBeTruthy();
    expect(posterImage?.getAttribute('src')).toContain(mockMovie.poster_path);
  });

  it('should display placeholder icon when poster is not available', () => {
    fixture.componentRef.setInput('movie', {
      ...mockMovie,
      poster_path: null,
    });
    fixture.detectChanges();

    const placeholderIcon = fixture.nativeElement.querySelector('mat-icon');
    expect(placeholderIcon).toBeTruthy();
  });

  it('should display vote average', () => {
    const voteAverage = fixture.nativeElement.querySelector('.font-medium');
    expect(voteAverage).toBeTruthy();
    expect(voteAverage?.textContent || '').toContain(mockMovie.vote_average.toFixed(1));
  });

  it('should display vote average with correct format', () => {
    const voteAverage = fixture.nativeElement.querySelector('.font-medium');
    const textContent = voteAverage?.textContent || '';
    expect(textContent).toContain('/10');
    expect(textContent).toContain(mockMovie.vote_average.toFixed(1));
  });
});

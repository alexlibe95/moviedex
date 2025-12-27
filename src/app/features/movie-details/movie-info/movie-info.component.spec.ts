import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MovieInfoComponent } from './movie-info.component';
import { MovieDetails } from '../../../core/models/movie-details.model';

describe('MovieInfoComponent', () => {
  let component: MovieInfoComponent;
  let fixture: ComponentFixture<MovieInfoComponent>;

  const mockMovieDetails: MovieDetails = {
    id: 123,
    title: 'Test Movie',
    overview: 'This is a test movie overview',
    poster_path: '/test-poster.jpg',
    budget: 1000000,
    release_date: '2024-01-15',
    revenue: 5000000,
    vote_average: 8.5,
    vote_count: 1000,
    spoken_languages: [{ english_name: 'English', iso_639_1: 'en', name: 'English' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieInfoComponent, DatePipe, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movie', mockMovieDetails);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display movie title', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Movie');
  });

  it('should display movie overview', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('This is a test movie overview');
  });

  it('should display vote average', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('8.5');
  });

  it('should display vote count', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('1000');
  });

  it('should display poster image when poster_path exists', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img).toBeTruthy();
    expect(img?.src).toContain('/test-poster.jpg');
    expect(img?.alt).toContain('Test Movie');
  });

  it('should not display poster image when poster_path is null', () => {
    const movieWithoutPoster = { ...mockMovieDetails, poster_path: null };
    fixture.componentRef.setInput('movie', movieWithoutPoster);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector('img');
    expect(img).toBeFalsy();
  });

  it('should format release date correctly', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // DatePipe formats dates, so we check for parts of the formatted date
    expect(compiled.textContent).toContain('2024');
  });
});

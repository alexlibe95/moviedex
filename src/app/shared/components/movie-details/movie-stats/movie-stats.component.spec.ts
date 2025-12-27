import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatePipe, DecimalPipe } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MovieStatsComponent } from './movie-stats.component';
import { MovieDetails } from '../../../../core/models/movie-details.model';

describe('MovieStatsComponent', () => {
  let component: MovieStatsComponent;
  let fixture: ComponentFixture<MovieStatsComponent>;

  const mockMovieDetails: MovieDetails = {
    id: 123,
    title: 'Test Movie',
    overview: 'Test overview',
    poster_path: '/test.jpg',
    budget: 1000000,
    release_date: '2024-01-15',
    revenue: 5000000,
    vote_average: 8.5,
    vote_count: 1000,
    spoken_languages: [
      { english_name: 'English', iso_639_1: 'en', name: 'English' },
      { english_name: 'Spanish', iso_639_1: 'es', name: 'Español' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieStatsComponent, DatePipe, DecimalPipe, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieStatsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movie', mockMovieDetails);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display budget when greater than 0', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Budget');
    expect(compiled.textContent).toContain('$');
  });

  it('should display N/A for budget when 0', () => {
    const movieWithZeroBudget = { ...mockMovieDetails, budget: 0 };
    fixture.componentRef.setInput('movie', movieWithZeroBudget);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Budget');
    expect(compiled.textContent).toContain('N/A');
  });

  it('should display revenue when greater than 0', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Revenue');
    expect(compiled.textContent).toContain('$');
  });

  it('should display N/A for revenue when 0', () => {
    const movieWithZeroRevenue = { ...mockMovieDetails, revenue: 0 };
    fixture.componentRef.setInput('movie', movieWithZeroRevenue);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Revenue');
    expect(compiled.textContent).toContain('N/A');
  });

  it('should compute languages correctly', () => {
    fixture.detectChanges();
    expect(component.languages()).toBe('English, Spanish');
  });

  it('should return N/A for languages when empty', () => {
    const movieWithoutLanguages = { ...mockMovieDetails, spoken_languages: [] };
    fixture.componentRef.setInput('movie', movieWithoutLanguages);
    fixture.detectChanges();
    expect(component.languages()).toBe('N/A');
  });

  it('should display release date', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Release Date');
    expect(compiled.textContent).toContain('2024');
  });

  it('should handle single language', () => {
    const movieWithOneLanguage = {
      ...mockMovieDetails,
      spoken_languages: [{ english_name: 'French', iso_639_1: 'fr', name: 'Français' }],
    };
    fixture.componentRef.setInput('movie', movieWithOneLanguage);
    fixture.detectChanges();
    expect(component.languages()).toBe('French');
  });
});

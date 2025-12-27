import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

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
      imports: [MovieCardComponent, NoopAnimationsModule],
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
    expect(titleElement?.textContent?.trim()).toContain(mockMovie.title);
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

  it('should display checkbox when selection mode is enabled', () => {
    fixture.componentRef.setInput('isSelected', false);
    fixture.detectChanges();

    const checkbox = fixture.nativeElement.querySelector('mat-checkbox');
    expect(checkbox).toBeTruthy();
  });

  it('should emit selectionToggle when checkbox is clicked', () => {
    const emitSpy = vi.spyOn(component.selectionToggle, 'emit');
    component.onCheckboxClick();
    expect(emitSpy).toHaveBeenCalledWith(mockMovie);
  });

  it('should emit cardClick when title is clicked', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    component.onTitleClick();
    expect(emitSpy).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should emit cardClick when content is clicked', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    component.onContentClick();
    expect(emitSpy).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should handle keyboard events on title', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    const preventDefaultSpy = vi.spyOn(enterEvent, 'preventDefault');
    component.onTitleKeydown(enterEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should handle keyboard events on content', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', cancelable: true });
    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
    component.onContentKeydown(spaceEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(mockMovie.id);
  });

  it('should not emit cardClick for other keys', () => {
    const emitSpy = vi.spyOn(component.cardClick, 'emit');
    const otherKeyEvent = new KeyboardEvent('keydown', { key: 'Tab' });
    component.onTitleKeydown(otherKeyEvent);
    expect(emitSpy).not.toHaveBeenCalled();
  });
});

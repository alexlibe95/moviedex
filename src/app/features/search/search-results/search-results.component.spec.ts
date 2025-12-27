import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';

import { SearchResultsComponent } from './search-results.component';
import { Movie } from '../../../core/models/movie.model';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

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
      imports: [SearchResultsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { params: {} },
            params: {
              subscribe: () => ({
                unsubscribe: () => {
                  // Mock unsubscribe
                },
              }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
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

  it('should display initial message when isLoading is null', () => {
    fixture.componentRef.setInput('isLoading', null);
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p');
    expect(message?.textContent?.trim()).toBe('Search for a movie');
  });

  it('should display search results when results are available', () => {
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('searchResults', [mockMovie]);
    fixture.detectChanges();

    const movieCards = fixture.nativeElement.querySelectorAll('app-movie-card');
    expect(movieCards.length).toBe(1);
  });

  it('should display pagination when results are available', () => {
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('searchResults', [mockMovie]);
    fixture.componentRef.setInput('totalResults', 100);
    fixture.detectChanges();

    const pagination = fixture.nativeElement.querySelector('app-pagination');
    expect(pagination).toBeTruthy();
  });

  it('should display "No results found" when results array is empty', () => {
    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('searchResults', []);
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('p');
    expect(message?.textContent?.trim()).toBe('No results found');
  });

  it('should have pageChange output defined', () => {
    expect(component.pageChange).toBeDefined();
    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 100,
    };

    fixture.componentRef.setInput('isLoading', false);
    fixture.componentRef.setInput('searchResults', [mockMovie]);
    fixture.detectChanges();

    // Verify output exists and can emit
    expect(() => component.pageChange.emit(pageEvent)).not.toThrow();
  });

  it('should use default pageSizeOptions when not provided', () => {
    expect(component.pageSizeOptions()).toEqual([20, 40, 60, 100]);
  });

  it('should use custom pageSizeOptions when provided', () => {
    const customOptions = [10, 25, 50];
    fixture.componentRef.setInput('pageSizeOptions', customOptions);
    fixture.detectChanges();

    expect(component.pageSizeOptions()).toEqual(customOptions);
  });
});

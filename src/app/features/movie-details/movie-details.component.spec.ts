import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { MovieDetailsComponent } from './movie-details.component';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MovieDetailsComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: { id: '123' },
            },
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
    });

    fixture = TestBed.createComponent(MovieDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract movie id from route params', () => {
    expect(component.id()).toBe(123);
  });

  it('should convert string id to number', () => {
    // Verify the id is a number, not a string
    expect(typeof component.id()).toBe('number');
    expect(component.id()).toBe(123);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { MovieDetailsContentComponent } from './movie-details-content.component';

describe('MovieDetailsContentComponent', () => {
  let component: MovieDetailsContentComponent;
  let fixture: ComponentFixture<MovieDetailsContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailsContentComponent, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailsContentComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movieId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { MovieDetailsComponent, MovieDetailsDialogData } from './movie-details.component';

describe('MovieDetailsComponent', () => {
  let component: MovieDetailsComponent;
  let fixture: ComponentFixture<MovieDetailsComponent>;
  let dialogRef: MatDialogRef<MovieDetailsComponent>;

  const mockDialogData: MovieDetailsDialogData = {
    movieId: 123,
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

  it('should have movieId from dialog data', () => {
    fixture.detectChanges();
    expect(component.movieId).toBe(mockDialogData.movieId);
  });

  it('should close dialog when close is called', () => {
    const closeSpy = vi.spyOn(dialogRef, 'close');
    component.close();
    expect(closeSpy).toHaveBeenCalled();
  });
});

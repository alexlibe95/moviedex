import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { vi } from 'vitest';

import { MovieRatingComponent } from './movie-rating.component';

describe('MovieRatingComponent', () => {
  let component: MovieRatingComponent;
  let fixture: ComponentFixture<MovieRatingComponent>;
  let httpMock: HttpTestingController;
  let snackBar: MatSnackBar;

  const mockGuestSession = {
    success: true,
    guest_session_id: 'test-session-id',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [MovieRatingComponent, MatSnackBarModule, NoopAnimationsModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    fixture = TestBed.createComponent(MovieRatingComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);

    // Set required inputs
    fixture.componentRef.setInput('movieId', 123);
    fixture.componentRef.setInput('currentRating', null);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with no selected stars', () => {
    fixture.detectChanges();
    expect(component.selectedStars()).toBeNull();
  });

  it('should initialize with current rating converted to stars', () => {
    fixture.componentRef.setInput('currentRating', 8); // 8/10 = 4 stars
    fixture.detectChanges();
    expect(component.selectedStars()).toBe(4);
  });

  it('should select stars when selectStars is called', () => {
    fixture.detectChanges();
    component.selectStars(3);
    expect(component.selectedStars()).toBe(3);
  });

  it('should convert stars to API rating correctly', async () => {
    fixture.detectChanges();
    component.selectStars(5);

    const sessionPromise = component.submitRating();

    // Handle session request (may retry, so use match to get all)
    const sessionRequests = httpMock.match((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    // Flush the first request (retries will be handled if needed)
    if (sessionRequests.length > 0) {
      sessionRequests[0].flush(mockGuestSession);
    }

    // Wait a bit for the session to be processed
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Second request for rating
    const ratingReq = httpMock.expectOne((request) => request.url.includes('/movie/123/rating'));
    expect(ratingReq.request.method).toBe('POST');
    expect(ratingReq.request.body.value).toBe(10); // 5 stars * 2 = 10
    ratingReq.flush({ success: true });

    await sessionPromise;
    expect(component.isRating()).toBe(false);
  });

  it('should not submit if no stars selected', async () => {
    fixture.detectChanges();
    // Ensure no stars are selected (selectedStars should be null by default)
    expect(component.selectedStars()).toBeNull();
    await component.submitRating();

    httpMock.expectNone((request) => request.url.includes('/movie/123/rating'));
    httpMock.expectNone((request) => request.url.includes('/authentication/guest_session/new'));
  });

  it('should show success message on successful rating', async () => {
    const snackBarSpy = vi.spyOn(snackBar, 'open');
    fixture.detectChanges();
    component.selectStars(4);

    const sessionPromise = component.submitRating();

    // Handle session request
    const sessionRequests = httpMock.match((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    if (sessionRequests.length > 0) {
      sessionRequests[0].flush(mockGuestSession);
    }

    // Wait for session to be processed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const ratingReq = httpMock.expectOne((request) => request.url.includes('/movie/123/rating'));
    ratingReq.flush({ success: true });

    await sessionPromise;

    expect(snackBarSpy).toHaveBeenCalledWith('Rating submitted successfully!', 'Close', {
      duration: 3000,
    });
  });

  it('should show error message on rating failure', async () => {
    const snackBarSpy = vi.spyOn(snackBar, 'open');
    fixture.detectChanges();
    component.selectStars(3);

    const sessionPromise = component.submitRating();

    // Handle session request
    const sessionRequests = httpMock.match((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    if (sessionRequests.length > 0) {
      sessionRequests[0].flush(mockGuestSession);
    }

    // Wait for session to be processed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const ratingReq = httpMock.expectOne((request) => request.url.includes('/movie/123/rating'));
    ratingReq.flush(null, { status: 500, statusText: 'Server Error' });

    await sessionPromise;

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Failed to submit rating. Please try again.',
      'Close',
      {
        duration: 5000,
      }
    );
  });

  it('should show error message on session creation failure', async () => {
    const snackBarSpy = vi.spyOn(snackBar, 'open');
    fixture.detectChanges();
    component.selectStars(2);

    vi.useFakeTimers();

    const sessionPromise = component.submitRating().catch(() => {
      // Expected error
    });

    // First request - flush with error
    const req1 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req1.flush(null, { status: 500, statusText: 'Server Error' });

    // Advance time for first retry (1000ms delay)
    vi.advanceTimersByTime(1000);

    // Second request (first retry)
    const req2 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req2.flush(null, { status: 500, statusText: 'Server Error' });

    // Advance time for second retry (1000ms delay)
    vi.advanceTimersByTime(1000);

    // Third request (second retry)
    const req3 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req3.flush(null, { status: 500, statusText: 'Server Error' });

    // Advance time to ensure all async operations complete
    vi.advanceTimersByTime(100);

    await sessionPromise.catch(() => {
      // Expected error
    });

    vi.useRealTimers();

    expect(snackBarSpy).toHaveBeenCalledWith(
      'Failed to initialize rating session. Please try again.',
      'Close',
      {
        duration: 5000,
      }
    );
  });

  it('should emit ratingSubmitted event on success', async () => {
    const ratingSubmittedSpy = vi.spyOn(component.ratingSubmitted, 'emit');
    fixture.detectChanges();
    component.selectStars(5);

    const sessionPromise = component.submitRating();

    // Handle session request
    const sessionRequests = httpMock.match((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    if (sessionRequests.length > 0) {
      sessionRequests[0].flush(mockGuestSession);
    }

    // Wait for session to be processed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const ratingReq = httpMock.expectOne((request) => request.url.includes('/movie/123/rating'));
    ratingReq.flush({ success: true });

    await sessionPromise;

    expect(ratingSubmittedSpy).toHaveBeenCalledWith(10);
  });

  it('should set isRating to true during submission', async () => {
    fixture.detectChanges();
    component.selectStars(3);

    const sessionPromise = component.submitRating();
    expect(component.isRating()).toBe(true);

    // Handle session request
    const sessionRequests = httpMock.match((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    if (sessionRequests.length > 0) {
      sessionRequests[0].flush(mockGuestSession);
    }

    // Wait for session to be processed
    await new Promise((resolve) => setTimeout(resolve, 50));

    const ratingReq = httpMock.expectOne((request) => request.url.includes('/movie/123/rating'));
    ratingReq.flush({ success: true });

    await sessionPromise;
    expect(component.isRating()).toBe(false);
  });
});

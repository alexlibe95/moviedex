import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { GuestSessionService } from './guest-session.service';
import { GuestSessionResponse } from '../models/guest-session.model';

describe('GuestSessionService', () => {
  let service: GuestSessionService;
  let httpMock: HttpTestingController;

  const mockGuestSession: GuestSessionResponse = {
    success: true,
    guest_session_id: 'test-session-id-123',
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(GuestSessionService);
  });

  afterEach(() => {
    httpMock.verify();
    if (service) {
      service.clearSession();
    }
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return null sessionId initially', () => {
    expect(service.sessionId()).toBeNull();
  });

  it('should create a new session when getSessionId is called', async () => {
    const sessionPromise = service.getSessionId();

    const req = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockGuestSession);

    const sessionId = await sessionPromise;
    expect(sessionId).toBe('test-session-id-123');
    expect(service.sessionId()).toBe('test-session-id-123');
  });

  it('should reuse existing valid session', async () => {
    // Create initial session
    const firstPromise = service.getSessionId();
    const req1 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req1.flush(mockGuestSession);
    await firstPromise;

    // Second call should reuse the session
    const secondSessionId = await service.getSessionId();
    expect(secondSessionId).toBe('test-session-id-123');
    httpMock.expectNone((request) => request.url.includes('/authentication/guest_session/new'));
  });

  it('should create new session when current session expires', async () => {
    // Create expired session
    const expiredSession: GuestSessionResponse = {
      ...mockGuestSession,
      expires_at: new Date(Date.now() - 1000).toISOString(), // Expired
    };

    const firstPromise = service.getSessionId();
    const req1 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req1.flush(expiredSession);
    await firstPromise;

    // Second call should create a new session
    const secondPromise = service.getSessionId();
    const req2 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req2.flush(mockGuestSession);
    const newSessionId = await secondPromise;
    expect(newSessionId).toBe('test-session-id-123');
  });

  it('should handle session creation errors', async () => {
    service.clearSession(); // Ensure clean state

    vi.useFakeTimers();

    let errorCaught = false;
    const sessionPromise = service.getSessionId().catch((error) => {
      errorCaught = true;
      expect(error).toBeDefined();
    });

    // First request - flush with error
    const req1 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req1.flush(
      { status_message: 'Internal Server Error' },
      { status: 500, statusText: 'Server Error' }
    );

    // Advance time for first retry (1000ms delay)
    vi.advanceTimersByTime(1000);

    // Second request (first retry)
    const req2 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req2.flush(
      { status_message: 'Internal Server Error' },
      { status: 500, statusText: 'Server Error' }
    );

    // Advance time for second retry (1000ms delay)
    vi.advanceTimersByTime(1000);

    // Third request (second retry)
    const req3 = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req3.flush(
      { status_message: 'Internal Server Error' },
      { status: 500, statusText: 'Server Error' }
    );

    // Advance time to ensure all async operations complete
    vi.advanceTimersByTime(100);

    // Wait for promise to reject
    await sessionPromise.catch(() => {
      // Expected error
    });

    vi.useRealTimers();

    // Ensure error was caught
    expect(errorCaught).toBe(true);

    // Ensure loading state is cleared after error
    expect(service.isSessionLoading()).toBe(false);
  });

  it('should clear session', async () => {
    const sessionPromise = service.getSessionId();
    const req = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req.flush(mockGuestSession);
    await sessionPromise;

    expect(service.sessionId()).toBe('test-session-id-123');
    service.clearSession();
    expect(service.sessionId()).toBeNull();
  });

  it('should handle concurrent session requests', async () => {
    // Ensure clean state
    service.clearSession();

    const promise1 = service.getSessionId();
    const promise2 = service.getSessionId();

    // Only one request should be made
    const req = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req.flush(mockGuestSession);

    const sessionId1 = await promise1;
    const sessionId2 = await promise2;

    expect(sessionId1).toBe('test-session-id-123');
    expect(sessionId2).toBe('test-session-id-123');

    // Ensure loading state is cleared
    expect(service.isSessionLoading()).toBe(false);
    httpMock.expectNone((request) => request.url.includes('/authentication/guest_session/new'));
  });

  it('should indicate loading state', async () => {
    // Ensure we start with a clean state
    service.clearSession();
    expect(service.isSessionLoading()).toBe(false);

    const sessionPromise = service.getSessionId();

    // Check loading state immediately after starting the request
    expect(service.isSessionLoading()).toBe(true);

    const req = httpMock.expectOne((request) =>
      request.url.includes('/authentication/guest_session/new')
    );
    req.flush(mockGuestSession);

    await sessionPromise;

    // Verify loading state is false after completion
    expect(service.isSessionLoading()).toBe(false);
  });
});

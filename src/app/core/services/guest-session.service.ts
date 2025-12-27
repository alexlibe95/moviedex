import { Injectable, inject, signal, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TmdbService } from '../api/tmdb.service';
import { GuestSessionResponse } from '../models/guest-session.model';

@Injectable({
  providedIn: 'root',
})
export class GuestSessionService {
  private readonly tmdbService = inject(TmdbService);
  private readonly session = signal<GuestSessionResponse | null>(null);
  private readonly isLoading = signal(false);

  readonly sessionId = computed(() => this.session()?.guest_session_id ?? null);
  readonly isSessionLoading = computed(() => this.isLoading());

  /**
   * Gets the current guest session ID, creating one if it doesn't exist or has expired.
   * @returns Promise that resolves with the guest session ID
   */
  async getSessionId(): Promise<string> {
    const currentSession = this.session();

    // Check if we have a valid session
    if (currentSession && this.isSessionValid(currentSession)) {
      return currentSession.guest_session_id;
    }

    // Create a new session if we don't have one or it's expired
    if (!this.isLoading()) {
      this.isLoading.set(true);
      try {
        const newSession = await firstValueFrom(this.tmdbService.createGuestSession());
        if (newSession) {
          this.session.set(newSession);
          this.isLoading.set(false);
          return newSession.guest_session_id;
        }
        throw new Error('Failed to create guest session');
      } catch (error) {
        console.error('Failed to create guest session:', error);
        this.isLoading.set(false);
        throw error;
      }
    }

    // If we're already loading, wait for it
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        const session = this.session();
        if (session && this.isSessionValid(session)) {
          clearInterval(checkInterval);
          resolve(session.guest_session_id);
        } else if (!this.isLoading()) {
          clearInterval(checkInterval);
          reject(new Error('Failed to create guest session'));
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for guest session'));
      }, 5000);
    });
  }

  /**
   * Checks if a session is still valid based on expiration time.
   * @param session - The guest session to check
   * @returns True if session is valid, false otherwise
   */
  private isSessionValid(session: GuestSessionResponse): boolean {
    if (!session.expires_at) {
      return false;
    }

    const expiresAt = new Date(session.expires_at);
    const now = new Date();
    // Add 5 minute buffer to account for clock differences
    const buffer = 5 * 60 * 1000;
    return expiresAt.getTime() - now.getTime() > buffer;
  }

  /**
   * Clears the current session (useful for testing or logout).
   */
  clearSession(): void {
    this.session.set(null);
  }
}

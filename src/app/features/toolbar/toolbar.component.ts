import { Component, inject, signal } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
})
export class ToolbarComponent {
  private readonly router = inject(Router);
  readonly showBackButton = signal(this.checkShowBackButton());

  constructor() {
    // Update signal on route changes
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.showBackButton.set(this.checkShowBackButton());
    });
  }

  private checkShowBackButton(): boolean {
    const url = this.router.url;
    // Get the path without query parameters
    const path = url.split('?')[0];
    // Show back button when not on root route
    return path !== '/' && path !== '';
  }

  goBack(): void {
    const url = this.router.url;
    const path = url.split('?')[0];
    
    // Navigate back based on current route
    if (path.startsWith('/collections/')) {
      // From collection details, go back to collections list
      this.router.navigate(['/collections']);
    } else if (path === '/collections') {
      // From collections list, go back to home
      this.router.navigate(['/']);
    } else if (path.startsWith('/movie/')) {
      // From movie details, go back to home
      this.router.navigate(['/']);
    } else {
      // Default: go to home
      this.router.navigate(['/']);
    }
  }

  goToCollections(): void {
    this.router.navigate(['/collections']);
  }
}

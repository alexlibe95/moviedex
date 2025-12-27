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
  readonly isRootRoute = signal(this.checkIsRootRoute());

  constructor() {
    // Update signal on route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isRootRoute.set(this.checkIsRootRoute());
      });
  }

  private checkIsRootRoute(): boolean {
    const url = this.router.url;
    // Get the path without query parameters
    const path = url.split('?')[0];
    // Check if path is root route (empty string or '/')
    return path === '/' || path === '';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}


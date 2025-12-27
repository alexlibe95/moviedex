import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';

import { ToolbarComponent } from './toolbar.component';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;
  let navigationSubject: Subject<NavigationEnd>;
  let navigateCalled = false;
  let navigateArgs: unknown[] = [];

  let mockRouter: {
    url: string;
    navigate: (path: unknown[]) => Promise<boolean>;
    events: Subject<NavigationEnd>;
  };

  beforeEach(async () => {
    navigationSubject = new Subject<NavigationEnd>();
    navigateCalled = false;
    navigateArgs = [];
    mockRouter = {
      url: '/',
      navigate: (path: unknown[]) => {
        navigateCalled = true;
        navigateArgs = path;
        return Promise.resolve(true);
      },
      events: navigationSubject,
    };

    await TestBed.configureTestingModule({
      imports: [ToolbarComponent],
      providers: [
        {
          provide: Router,
          useValue: mockRouter,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show back button when on collections route', () => {
    mockRouter.url = '/collections';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.showBackButton()).toBe(true);
  });

  it('should hide back button when on root route', () => {
    mockRouter.url = '/';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.showBackButton()).toBe(false);
  });

  it('should show back button when on movie route', () => {
    mockRouter.url = '/movie/123';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.showBackButton()).toBe(true);
  });

  it('should navigate to root when goBack is called', () => {
    component.goBack();
    expect(navigateCalled).toBe(true);
    expect(navigateArgs).toEqual(['/']);
  });

  it('should update showBackButton signal on navigation end', () => {
    mockRouter.url = '/';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showBackButton()).toBe(false);

    mockRouter.url = '/collections';
    navigationSubject.next(new NavigationEnd(1, '/collections', '/collections'));
    fixture.detectChanges();

    expect(component.showBackButton()).toBe(true);
  });

  it('should hide back button on root route with query params', () => {
    mockRouter.url = '/?';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showBackButton()).toBe(false);
  });

  it('should hide back button on root route with query parameters', () => {
    mockRouter.url = '/?page=1';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showBackButton()).toBe(false);
  });

  it('should hide back button on root route with multiple query parameters', () => {
    mockRouter.url = '/?search=test&page=1';
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showBackButton()).toBe(false);
  });
});

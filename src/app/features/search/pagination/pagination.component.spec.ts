import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PageEvent } from '@angular/material/paginator';

import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default values', () => {
    expect(component.length()).toBe(0);
    expect(component.pageSize()).toBe(20);
    expect(component.pageIndex()).toBe(0);
    expect(component.pageSizeOptions()).toEqual([20, 40, 60, 100]);
  });

  it('should accept custom input values', () => {
    fixture.componentRef.setInput('length', 100);
    fixture.componentRef.setInput('pageSize', 40);
    fixture.componentRef.setInput('pageIndex', 2);
    fixture.componentRef.setInput('pageSizeOptions', [10, 20, 30]);
    fixture.detectChanges();

    expect(component.length()).toBe(100);
    expect(component.pageSize()).toBe(40);
    expect(component.pageIndex()).toBe(2);
    expect(component.pageSizeOptions()).toEqual([10, 20, 30]);
  });

  it('should emit pageChange event when onPageChange is called', () => {
    let emittedEvent: PageEvent | undefined;
    component.pageChange.subscribe((event) => {
      emittedEvent = event;
    });

    const pageEvent: PageEvent = {
      pageIndex: 1,
      pageSize: 20,
      length: 100,
    };

    component.onPageChange(pageEvent);

    expect(emittedEvent).toEqual(pageEvent);
  });

  it('should render mat-paginator element', () => {
    fixture.componentRef.setInput('length', 200);
    fixture.componentRef.setInput('pageSize', 40);
    fixture.componentRef.setInput('pageIndex', 1);
    fixture.detectChanges();

    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
    // Verify component inputs are set correctly
    expect(component.length()).toBe(200);
    expect(component.pageSize()).toBe(40);
    expect(component.pageIndex()).toBe(1);
  });

  it('should have onPageChange method defined', () => {
    expect(component.onPageChange).toBeDefined();
    expect(typeof component.onPageChange).toBe('function');
  });
});

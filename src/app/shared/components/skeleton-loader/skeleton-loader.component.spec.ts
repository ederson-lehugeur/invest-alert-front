import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonLoaderComponent, SkeletonVariant } from './skeleton-loader.component';

describe('SkeletonLoaderComponent', () => {
  let component: SkeletonLoaderComponent;
  let fixture: ComponentFixture<SkeletonLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoaderComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should default to text variant and count of 1', () => {
    expect(component.variant).toBe('text');
    expect(component.count).toBe(1);
  });

  describe('card variant', () => {
    beforeEach(() => {
      component.variant = 'card';
      fixture.detectChanges();
    });

    it('should render a skeleton card with circle, rect, and text lines', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.skeleton-card')).toBeTruthy();
      expect(el.querySelector('.skeleton-circle')).toBeTruthy();
      expect(el.querySelector('.skeleton-rect')).toBeTruthy();
      expect(el.querySelectorAll('.skeleton-line').length).toBeGreaterThanOrEqual(2);
    });

    it('should render multiple cards when count > 1', () => {
      fixture.componentRef.setInput('count', 3);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelectorAll('.skeleton-card').length).toBe(3);
    });
  });

  describe('table-row variant', () => {
    beforeEach(() => {
      component.variant = 'table-row';
      fixture.detectChanges();
    });

    it('should render a skeleton table row with cells', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.skeleton-table-row')).toBeTruthy();
      expect(el.querySelectorAll('.skeleton-cell').length).toBeGreaterThanOrEqual(3);
    });

    it('should render multiple rows when count > 1', () => {
      fixture.componentRef.setInput('count', 5);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelectorAll('.skeleton-table-row').length).toBe(5);
    });
  });

  describe('text variant', () => {
    beforeEach(() => {
      component.variant = 'text';
      fixture.detectChanges();
    });

    it('should render skeleton text lines of varying width', () => {
      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelector('.skeleton-text')).toBeTruthy();

      const lines = el.querySelectorAll('.skeleton-text .skeleton-line');
      expect(lines.length).toBeGreaterThanOrEqual(2);

      const hasFullLine = el.querySelector('.skeleton-line--full');
      const hasMediumLine = el.querySelector('.skeleton-line--medium');
      expect(hasFullLine).toBeTruthy();
      expect(hasMediumLine).toBeTruthy();
    });

    it('should render multiple text blocks when count > 1', () => {
      fixture.componentRef.setInput('count', 2);
      fixture.detectChanges();

      const el: HTMLElement = fixture.nativeElement;
      expect(el.querySelectorAll('.skeleton-text').length).toBe(2);
    });
  });

  describe('accessibility', () => {
    it('should have aria-busy attribute on container', () => {
      fixture.detectChanges();
      const container: HTMLElement = fixture.nativeElement.querySelector('.skeleton-container');
      expect(container.getAttribute('aria-busy')).toBe('true');
    });

    it('should have role="status" on container', () => {
      fixture.detectChanges();
      const container: HTMLElement = fixture.nativeElement.querySelector('.skeleton-container');
      expect(container.getAttribute('role')).toBe('status');
    });

    it('should have aria-label on container', () => {
      fixture.detectChanges();
      const container: HTMLElement = fixture.nativeElement.querySelector('.skeleton-container');
      expect(container.getAttribute('aria-label')).toBe('Loading content');
    });
  });

  describe('items getter', () => {
    it('should return array of correct length', () => {
      component.count = 4;
      expect(component.items.length).toBe(4);
    });

    it('should return empty array when count is 0', () => {
      component.count = 0;
      expect(component.items.length).toBe(0);
    });

    it('should return single-element array for default count', () => {
      expect(component.items.length).toBe(1);
    });
  });
});

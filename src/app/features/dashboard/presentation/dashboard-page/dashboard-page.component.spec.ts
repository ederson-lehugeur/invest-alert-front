import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPageComponent } from './dashboard-page.component';

describe('DashboardPageComponent', () => {
  let component: DashboardPageComponent;
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render the dashboard title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.dashboard-title');
    expect(title).toBeTruthy();
    expect(title!.textContent).toContain('Dashboard');
  });

  it('should render navigation cards for Assets, Rules, and Alerts', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.dashboard-card');
    expect(cards.length).toBe(3);

    const titles = Array.from(cards).map(
      (card) => card.querySelector('.dashboard-card-title')?.textContent?.trim()
    );
    expect(titles).toEqual(['Assets', 'Rules', 'Alerts']);
  });

  it('should have correct routerLink paths on cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.dashboard-card');

    expect(cards[0].getAttribute('href')).toBe('/assets');
    expect(cards[1].getAttribute('href')).toBe('/rules');
    expect(cards[2].getAttribute('href')).toBe('/alerts');
  });

  it('should render descriptions for each card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const descriptions = compiled.querySelectorAll('.dashboard-card-description');
    expect(descriptions.length).toBe(3);

    descriptions.forEach((desc) => {
      expect(desc.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});

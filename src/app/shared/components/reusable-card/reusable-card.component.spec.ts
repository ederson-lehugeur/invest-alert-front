import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReusableCardComponent } from './reusable-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  imports: [ReusableCardComponent],
  template: `
    <app-reusable-card [title]="title" [icon]="icon" [elevated]="elevated">
      <p class="projected-content">Projected body</p>
    </app-reusable-card>
  `,
})
class TestHostComponent {
  title = '';
  icon = '';
  elevated = false;
}

function createFixture(
  overrides: Partial<{ title: string; icon: string; elevated: boolean }> = {},
): { fixture: ComponentFixture<TestHostComponent>; host: TestHostComponent } {
  const fixture = TestBed.createComponent(TestHostComponent);
  const host = fixture.componentInstance;
  Object.assign(host, overrides);
  fixture.detectChanges();
  return { fixture, host };
}

describe('ReusableCardComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ReusableCardComponent, MatCardModule, MatIconModule],
    }).compileComponents();
  });

  it('should create the component', () => {
    const { fixture } = createFixture();
    const card = fixture.debugElement.query(By.directive(ReusableCardComponent));
    expect(card).toBeTruthy();
  });

  it('should render the title when provided', () => {
    const { fixture } = createFixture({ title: 'Total Assets' });
    const titleEl = fixture.debugElement.query(By.css('mat-card-title'));
    expect(titleEl).toBeTruthy();
    expect(titleEl.nativeElement.textContent).toContain('Total Assets');
  });

  it('should render the icon when provided', () => {
    const { fixture } = createFixture({ icon: 'dashboard' });
    const iconEl = fixture.debugElement.query(By.css('mat-icon'));
    expect(iconEl).toBeTruthy();
    expect(iconEl.nativeElement.textContent).toContain('dashboard');
  });

  it('should not render header when title and icon are empty', () => {
    const { fixture } = createFixture();
    const header = fixture.debugElement.query(By.css('mat-card-header'));
    expect(header).toBeFalsy();
  });

  it('should project content into mat-card-content', () => {
    const { fixture } = createFixture();
    const projected = fixture.debugElement.query(By.css('.projected-content'));
    expect(projected).toBeTruthy();
    expect(projected.nativeElement.textContent).toContain('Projected body');
  });

  it('should apply card--elevated class when elevated is true', () => {
    const { fixture } = createFixture({ elevated: true });
    const matCard = fixture.debugElement.query(By.css('mat-card'));
    expect(matCard.nativeElement.classList.contains('card--elevated')).toBe(true);
    expect(matCard.nativeElement.classList.contains('card--default')).toBe(false);
  });

  it('should apply card--default class when elevated is false', () => {
    const { fixture } = createFixture({ elevated: false });
    const matCard = fixture.debugElement.query(By.css('mat-card'));
    expect(matCard.nativeElement.classList.contains('card--default')).toBe(true);
    expect(matCard.nativeElement.classList.contains('card--elevated')).toBe(false);
  });

  it('should default elevated to false', () => {
    const { fixture } = createFixture();
    const card = fixture.debugElement.query(By.directive(ReusableCardComponent));
    expect(card.componentInstance.elevated).toBe(false);
  });

  it('should default title and icon to empty strings', () => {
    const { fixture } = createFixture();
    const card = fixture.debugElement.query(By.directive(ReusableCardComponent));
    expect(card.componentInstance.title).toBe('');
    expect(card.componentInstance.icon).toBe('');
  });
});

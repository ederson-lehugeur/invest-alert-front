import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([
          { path: 'dashboard', component: DummyComponent },
          { path: 'assets', component: DummyComponent },
          { path: 'rules', component: DummyComponent },
          { path: 'alerts', component: DummyComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 4 navigation links', () => {
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    expect(links.length).toBe(4);
  });

  it('should render correct labels for each link', () => {
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim(),
    );
    expect(labels).toEqual(['Dashboard', 'Assets', 'Rules', 'Alerts']);
  });

  it('should render correct icons for each link', () => {
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const iconTexts = icons.map((icon) => icon.nativeElement.textContent.trim());
    expect(iconTexts).toEqual(['dashboard', 'trending_up', 'rule', 'notifications']);
  });

  it('should set correct routerLink paths', () => {
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const hrefs = links.map((link) => link.nativeElement.getAttribute('href'));
    expect(hrefs).toEqual(['/dashboard', '/assets', '/rules', '/alerts']);
  });

  it('should use a nav element with aria-label', () => {
    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeTruthy();
    expect(nav.nativeElement.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should emit linkClicked when a link is clicked', () => {
    const emitSpy = vi.spyOn(component.linkClicked, 'emit');
    const firstLink = fixture.debugElement.query(By.css('a[mat-list-item]'));
    firstLink.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should have routerLinkActive directive on links', () => {
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    links.forEach((link) => {
      expect(link.attributes['routerLinkActive']).toBe('active-link');
    });
  });
});

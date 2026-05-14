import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SidebarComponent } from './sidebar.component';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

@Component({ standalone: true, template: '' })
class DummyComponent {}

function buildMockAuthFacade(initialPermissions: readonly string[] = []) {
  const permissionsSubject = new BehaviorSubject<readonly string[]>(initialPermissions);
  const facade = {
    permissions$: permissionsSubject.asObservable(),
    hasPermission: (permission: string): Observable<boolean> =>
      permissionsSubject.pipe(map((perms) => perms.includes(permission))),
  } as unknown as AuthFacade;
  return { facade, permissionsSubject };
}

async function createFixture(
  permissions: readonly string[] = []
): Promise<{
  fixture: ComponentFixture<SidebarComponent>;
  component: SidebarComponent;
  permissionsSubject: BehaviorSubject<readonly string[]>;
}> {
  const { facade, permissionsSubject } = buildMockAuthFacade(permissions);

  await TestBed.configureTestingModule({
    imports: [SidebarComponent],
    providers: [
      { provide: AuthFacade, useValue: facade },
      provideRouter([
        { path: 'dashboard', component: DummyComponent },
        { path: 'assets', component: DummyComponent },
        { path: 'rules', component: DummyComponent },
        { path: 'alerts', component: DummyComponent },
      ]),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(SidebarComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();

  return { fixture, component, permissionsSubject };
}

describe('SidebarComponent', () => {
  it('should create', async () => {
    const { component } = await createFixture(['ALERT_CREATE']);
    expect(component).toBeTruthy();
  });

  it('should render 4 navigation links when user has ALERT_CREATE', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    expect(links.length).toBe(4);
  });

  it('should render 3 navigation links when user does not have ALERT_CREATE', async () => {
    const { fixture } = await createFixture([]);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    expect(links.length).toBe(3);
  });

  it('should render correct labels for each link when user has ALERT_CREATE', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).toEqual(['Dashboard', 'Assets', 'Rules', 'Alerts']);
  });

  it('should render correct icons for each link when user has ALERT_CREATE', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const icons = fixture.debugElement.queryAll(By.css('mat-icon'));
    const iconTexts = icons.map((icon) => icon.nativeElement.textContent.trim());
    expect(iconTexts).toEqual(['dashboard', 'trending_up', 'rule', 'notifications']);
  });

  it('should set correct routerLink paths when user has ALERT_CREATE', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const hrefs = links.map((link) => link.nativeElement.getAttribute('href'));
    expect(hrefs).toEqual(['/dashboard', '/assets', '/rules', '/alerts']);
  });

  it('should use a nav element with aria-label', async () => {
    const { fixture } = await createFixture();
    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeTruthy();
    expect(nav.nativeElement.getAttribute('aria-label')).toBe('Main navigation');
  });

  it('should emit linkClicked when a link is clicked', async () => {
    const { fixture, component } = await createFixture();
    const emitSpy = vi.spyOn(component.linkClicked, 'emit');
    const firstLink = fixture.debugElement.query(By.css('a[mat-list-item]'));
    firstLink.nativeElement.click();
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('should have routerLinkActive directive on links', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    links.forEach((link) => {
      expect(link.attributes['routerLinkActive']).toBe('active-link');
    });
  });

  // --- RBAC: Rules link visibility ---

  it('should display the "Rules" link when user has ALERT_CREATE', async () => {
    const { fixture } = await createFixture(['ALERT_CREATE']);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).toContain('Rules');
  });

  it('should hide the "Rules" link when user does not have ALERT_CREATE', async () => {
    const { fixture } = await createFixture([]);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).not.toContain('Rules');
  });

  it('should show "Rules" link when ALERT_CREATE permission is added reactively', async () => {
    const { fixture, permissionsSubject } = await createFixture([]);

    let links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    let labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).not.toContain('Rules');

    permissionsSubject.next(['ALERT_CREATE']);
    fixture.detectChanges();

    links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).toContain('Rules');
  });

  it('should hide "Rules" link when ALERT_CREATE permission is removed reactively', async () => {
    const { fixture, permissionsSubject } = await createFixture(['ALERT_CREATE']);

    let links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    let labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).toContain('Rules');

    permissionsSubject.next([]);
    fixture.detectChanges();

    links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).not.toContain('Rules');
  });

  it('should always show Dashboard, Assets, and Alerts links regardless of permissions', async () => {
    const { fixture } = await createFixture([]);
    const links = fixture.debugElement.queryAll(By.css('a[mat-list-item]'));
    const labels = links.map((link) =>
      link.query(By.css('[matListItemTitle]'))?.nativeElement.textContent.trim()
    );
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('Assets');
    expect(labels).toContain('Alerts');
  });
});

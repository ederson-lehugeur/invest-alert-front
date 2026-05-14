import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fc from 'fast-check';
import { HasPermissionDirective } from './has-permission.directive';
import { AuthFacade } from '../../features/auth/application/auth.facade';

function buildMockAuthFacade(initialPermissions: readonly string[] = []) {
  const permissionsSubject = new BehaviorSubject<readonly string[]>(initialPermissions);
  const facade = {
    permissions$: permissionsSubject.asObservable(),
    hasPermission: (permission: string): Observable<boolean> =>
      permissionsSubject.pipe(map((perms) => perms.includes(permission))),
  } as unknown as AuthFacade;
  return { facade, permissionsSubject };
}

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<span *appHasPermission="'ALERT_CREATE'" id="target">Visible</span>`,
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<span *appHasPermission="permission" id="target">Visible</span>`,
})
class DynamicPermissionHostComponent {
  permission = 'ALERT_CREATE';
}

describe('HasPermissionDirective', () => {
  let permissionsSubject: BehaviorSubject<readonly string[]>;
  let mockFacade: AuthFacade;

  function setup(initialPermissions: readonly string[] = []) {
    const { facade, permissionsSubject: subject } = buildMockAuthFacade(initialPermissions);
    permissionsSubject = subject;
    mockFacade = facade;

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: AuthFacade, useValue: mockFacade }],
    });
  }

  it('should render element when user has the permission', () => {
    setup(['ALERT_CREATE']);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('#target');
    expect(el).toBeTruthy();
    expect(el.textContent).toBe('Visible');
  });

  it('should not render element when user does not have the permission', () => {
    setup([]);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('#target');
    expect(el).toBeFalsy();
  });

  it('should not render element when user has different permissions', () => {
    setup(['ALERT_UPDATE', 'ALERT_DELETE']);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement.querySelector('#target');
    expect(el).toBeFalsy();
  });

  it('should update DOM reactively when permissions change - add permission', () => {
    setup([]);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeFalsy();

    permissionsSubject.next(['ALERT_CREATE']);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeTruthy();
  });

  it('should update DOM reactively when permissions change - remove permission', () => {
    setup(['ALERT_CREATE']);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeTruthy();

    permissionsSubject.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeFalsy();
  });

  it('should update DOM reactively on logout (permissions cleared)', () => {
    setup(['ALERT_CREATE', 'ALERT_UPDATE']);

    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeTruthy();

    // Simulate logout
    permissionsSubject.next([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#target')).toBeFalsy();
  });
});

describe('HasPermissionDirective - Property Tests', () => {
  // Feature: invest-alert-front-rbac, Property 6: HasPermissionDirective controla o DOM com base na permission
  it('should render element iff user has the required permission', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 8 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (userPermissions, requiredPermission) => {
          TestBed.resetTestingModule();

          const { facade, permissionsSubject } = buildMockAuthFacade(userPermissions);

          @Component({
            standalone: true,
            imports: [HasPermissionDirective],
            template: `<span *appHasPermission="permission" id="target">Visible</span>`,
          })
          class PropertyTestHostComponent {
            permission = requiredPermission;
          }

          TestBed.configureTestingModule({
            imports: [PropertyTestHostComponent],
            providers: [{ provide: AuthFacade, useValue: facade }],
          });

          const fixture: ComponentFixture<PropertyTestHostComponent> =
            TestBed.createComponent(PropertyTestHostComponent);
          fixture.detectChanges();

          const el = fixture.nativeElement.querySelector('#target');
          const shouldBeVisible = userPermissions.includes(requiredPermission);

          if (shouldBeVisible) {
            expect(el).toBeTruthy();
          } else {
            expect(el).toBeFalsy();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: invest-alert-front-rbac, Property 7: HasPermissionDirective reage a mudanças de permissions
  it('should reactively update DOM for any sequence of permission changes', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            permissions: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        fc.string({ minLength: 1, maxLength: 20 }),
        (permissionStates, requiredPermission) => {
          TestBed.resetTestingModule();

          const { facade, permissionsSubject } = buildMockAuthFacade([]);

          @Component({
            standalone: true,
            imports: [HasPermissionDirective],
            template: `<span *appHasPermission="permission" id="target">Visible</span>`,
          })
          class ReactivityTestHostComponent {
            permission = requiredPermission;
          }

          TestBed.configureTestingModule({
            imports: [ReactivityTestHostComponent],
            providers: [{ provide: AuthFacade, useValue: facade }],
          });

          const fixture: ComponentFixture<ReactivityTestHostComponent> =
            TestBed.createComponent(ReactivityTestHostComponent);
          fixture.detectChanges();

          for (const state of permissionStates) {
            permissionsSubject.next(state.permissions);
            fixture.detectChanges();

            const el = fixture.nativeElement.querySelector('#target');
            const shouldBeVisible = state.permissions.includes(requiredPermission);

            if (shouldBeVisible) {
              expect(el).toBeTruthy();
            } else {
              expect(el).toBeFalsy();
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

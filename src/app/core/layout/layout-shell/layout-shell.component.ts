import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MaterialModule } from '../../../shared/material/material.module';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { routeAnimations } from '../../../shared/animations/route-animations';

const MOBILE_BREAKPOINT = '(max-width: 767.98px)';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [MaterialModule, RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations],
})
export class LayoutShellComponent {
  readonly sidenavMode = signal<'side' | 'over'>('side');
  readonly sidenavOpened = signal(true);

  private readonly isMobile: ReturnType<typeof toSignal<boolean>>;

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);
    this.isMobile = toSignal(
      breakpointObserver
        .observe(MOBILE_BREAKPOINT)
        .pipe(
          map((result) => {
            const mobile = result.matches;
            this.sidenavMode.set(mobile ? 'over' : 'side');
            this.sidenavOpened.set(!mobile);
            return mobile;
          }),
        ),
      { initialValue: false },
    );
  }

  toggleSidenav(): void {
    this.sidenavOpened.update((opened) => !opened);
  }

  onSidebarLinkClicked(): void {
    if (this.sidenavMode() === 'over') {
      this.sidenavOpened.set(false);
    }
  }
}

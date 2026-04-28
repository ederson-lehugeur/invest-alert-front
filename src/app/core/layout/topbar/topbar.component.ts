import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  Signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { MaterialModule } from '../../../shared/material/material.module';
import { ThemeService } from '../../services/theme.service';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

const MOBILE_BREAKPOINT = '(max-width: 767.98px)';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopbarComponent {
  @Output() readonly menuToggle = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);
  readonly authFacade = inject(AuthFacade);

  readonly isMobile: Signal<boolean>;

  constructor() {
    const breakpointObserver = inject(BreakpointObserver);
    this.isMobile = toSignal(
      breakpointObserver
        .observe(MOBILE_BREAKPOINT)
        .pipe(map((result) => result.matches)),
      { initialValue: false },
    );
  }

  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onLogout(): void {
    this.authFacade.logout();
  }
}

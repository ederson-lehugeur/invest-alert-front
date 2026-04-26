import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthFacade } from '../../../features/auth/application/auth.facade';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  protected readonly authFacade = inject(AuthFacade);
  protected readonly isMobileMenuOpen = signal(false);

  protected readonly navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/assets', label: 'Assets' },
    { path: '/rules', label: 'Rules' },
    { path: '/alerts', label: 'Alerts' },
  ];

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update((open) => !open);
  }

  protected onLogout(): void {
    this.authFacade.logout();
  }
}

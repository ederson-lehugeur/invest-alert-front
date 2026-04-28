import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MaterialModule } from '../../../shared/material/material.module';

interface NavLink {
  readonly path: string;
  readonly label: string;
  readonly icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Output() readonly linkClicked = new EventEmitter<void>();

  readonly navLinks: readonly NavLink[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/assets', label: 'Assets', icon: 'trending_up' },
    { path: '/rules', label: 'Rules', icon: 'rule' },
    { path: '/alerts', label: 'Alerts', icon: 'notifications' },
  ];

  onLinkClick(): void {
    this.linkClicked.emit();
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  protected readonly navigationCards = [
    {
      title: 'Assets',
      description: 'Browse monitored assets and their current market data.',
      path: '/assets',
    },
    {
      title: 'Rules',
      description: 'Create and manage your monitoring rules and rule groups.',
      path: '/rules',
    },
    {
      title: 'Alerts',
      description: 'View triggered alerts and their delivery status.',
      path: '/alerts',
    },
  ];
}

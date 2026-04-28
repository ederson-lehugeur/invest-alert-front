import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MaterialModule } from '../../material/material.module';

@Component({
  selector: 'app-reusable-card',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './reusable-card.component.html',
  styleUrl: './reusable-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReusableCardComponent {
  @Input() title = '';
  @Input() icon = '';
  @Input() elevated = false;
}

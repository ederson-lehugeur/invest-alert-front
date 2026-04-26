import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  templateUrl: './error-message.component.html',
  styleUrl: './error-message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageComponent {
  @Input() message: string | null = null;
}

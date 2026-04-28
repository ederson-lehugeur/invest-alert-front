import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type SkeletonVariant = 'card' | 'table-row' | 'text';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  templateUrl: './skeleton-loader.component.html',
  styleUrl: './skeleton-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  @Input({ required: true }) variant: SkeletonVariant = 'text';
  @Input() count = 1;

  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}

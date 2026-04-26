import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input({ required: true }) page = 0;
  @Input({ required: true }) totalPages = 0;
  @Output() readonly pageChange = new EventEmitter<number>();

  get isFirstPage(): boolean {
    return this.page <= 0;
  }

  get isLastPage(): boolean {
    return this.page >= this.totalPages - 1;
  }

  goToPrevious(): void {
    if (!this.isFirstPage) {
      this.pageChange.emit(this.page - 1);
    }
  }

  goToNext(): void {
    if (!this.isLastPage) {
      this.pageChange.emit(this.page + 1);
    }
  }
}

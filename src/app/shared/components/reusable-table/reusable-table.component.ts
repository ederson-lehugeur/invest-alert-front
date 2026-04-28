import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
  TrackByFunction,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sort } from '@angular/material/sort';
import { PageEvent } from '@angular/material/paginator';
import { MaterialModule } from '../../material/material.module';
import { ColumnConfig } from './column-config.model';
import { CellDefDirective } from './cell-def.directive';

@Component({
  selector: 'app-reusable-table',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './reusable-table.component.html',
  styleUrl: './reusable-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReusableTableComponent<T> implements AfterContentInit {
  @Input({ required: true }) columns: ColumnConfig[] = [];
  @Input({ required: true }) data: T[] = [];
  @Input() sortable = false;
  @Input() paginator = false;
  @Input() pageSize = 20;
  @Input() totalElements = 0;
  @Input() pageIndex = 0;
  @Input() trackByFn: TrackByFunction<T> = (index: number) => index;
  @Input() rowClickable = false;
  @Input() emptyIcon = 'inbox';
  @Input() emptyMessage = 'No data found.';

  @Output() readonly sortChange = new EventEmitter<Sort>();
  @Output() readonly pageChange = new EventEmitter<PageEvent>();
  @Output() readonly rowClick = new EventEmitter<T>();

  @ContentChildren(CellDefDirective) cellDefs!: QueryList<CellDefDirective>;

  private cellTemplateMap = new Map<string, CellDefDirective>();

  get displayedColumns(): string[] {
    return this.columns.map((c) => c.key);
  }

  get isEmpty(): boolean {
    return !this.data || this.data.length === 0;
  }

  ngAfterContentInit(): void {
    this.buildTemplateMap();
    this.cellDefs.changes.subscribe(() => this.buildTemplateMap());
  }

  getCellTemplate(columnKey: string): CellDefDirective | undefined {
    return this.cellTemplateMap.get(columnKey);
  }

  getCellValue(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  getTextAlign(column: ColumnConfig): string {
    return column.align ?? 'left';
  }

  onSortChange(sort: Sort): void {
    this.sortChange.emit(sort);
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: T): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }

  onRowKeydown(event: KeyboardEvent, row: T): void {
    if (this.rowClickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  private buildTemplateMap(): void {
    this.cellTemplateMap.clear();
    this.cellDefs.forEach((def) => {
      this.cellTemplateMap.set(def.columnKey, def);
    });
  }
}

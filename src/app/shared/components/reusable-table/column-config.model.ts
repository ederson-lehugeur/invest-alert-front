import { TemplateRef } from '@angular/core';

export interface ColumnConfig {
  readonly key: string;
  readonly header: string;
  readonly sortable?: boolean;
  readonly align?: 'left' | 'right' | 'center';
  readonly cellTemplate?: TemplateRef<unknown>;
}

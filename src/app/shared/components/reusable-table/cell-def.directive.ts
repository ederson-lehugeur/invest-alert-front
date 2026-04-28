import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appCellDef]',
  standalone: true,
})
export class CellDefDirective {
  @Input({ required: true, alias: 'appCellDef' }) columnKey = '';

  constructor(public readonly templateRef: TemplateRef<unknown>) {}
}

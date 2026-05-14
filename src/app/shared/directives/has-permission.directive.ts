import {
  Directive,
  Input,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthFacade } from '../../features/auth/application/auth.facade';

@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authFacade = inject(AuthFacade);
  private readonly destroy$ = new Subject<void>();

  @Input({ required: true }) appHasPermission!: string;

  ngOnInit(): void {
    this.authFacade
      .hasPermission(this.appHasPermission)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasPermission) => {
        this.viewContainer.clear();
        if (hasPermission) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

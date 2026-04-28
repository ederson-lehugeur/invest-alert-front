import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const defaultData: ConfirmDialogData = {
    title: 'Delete Rule',
    message: 'Are you sure you want to delete this rule?',
  };

  function createComponent(data: ConfirmDialogData = defaultData): void {
    TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
        provideNoopAnimations(),
      ],
    });

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    mockDialogRef = { close: vi.fn() };
  });

  it('should display the title from injected data', () => {
    createComponent();
    const titleEl = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(titleEl.textContent).toContain('Delete Rule');
  });

  it('should display the message from injected data', () => {
    createComponent();
    const contentEl = fixture.nativeElement.querySelector('mat-dialog-content p');
    expect(contentEl.textContent).toContain('Are you sure you want to delete this rule?');
  });

  it('should default confirmLabel to Confirm and cancelLabel to Cancel', () => {
    createComponent();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const labels = Array.from(buttons).map((b: unknown) => (b as HTMLButtonElement).textContent?.trim());
    expect(labels).toContain('Cancel');
    expect(labels).toContain('Confirm');
  });

  it('should use custom labels when provided', () => {
    createComponent({
      title: 'Remove',
      message: 'Remove this item?',
      confirmLabel: 'Yes, remove',
      cancelLabel: 'No, keep',
    });
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const labels = Array.from(buttons).map((b: unknown) => (b as HTMLButtonElement).textContent?.trim());
    expect(labels).toContain('No, keep');
    expect(labels).toContain('Yes, remove');
  });

  it('should close dialog with true on confirm', () => {
    createComponent();
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    createComponent();
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when confirm button is clicked', () => {
    createComponent();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const confirmBtn = Array.from(buttons).find(
      (b: unknown) => (b as HTMLButtonElement).textContent?.trim() === 'Confirm',
    ) as HTMLButtonElement;
    confirmBtn.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false when cancel button is clicked', () => {
    createComponent();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const cancelBtn = Array.from(buttons).find(
      (b: unknown) => (b as HTMLButtonElement).textContent?.trim() === 'Cancel',
    ) as HTMLButtonElement;
    cancelBtn.click();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});

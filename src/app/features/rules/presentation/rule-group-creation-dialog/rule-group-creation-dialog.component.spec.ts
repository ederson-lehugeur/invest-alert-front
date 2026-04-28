import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RuleGroupCreationDialogComponent } from './rule-group-creation-dialog.component';
import { RuleGroupFormData } from '../rule-group-form/rule-group-form.component';

describe('RuleGroupCreationDialogComponent', () => {
  let component: RuleGroupCreationDialogComponent;
  let fixture: ComponentFixture<RuleGroupCreationDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RuleGroupCreationDialogComponent, NoopAnimationsModule],
      providers: [{ provide: MatDialogRef, useValue: mockDialogRef }],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleGroupCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render app-rule-group-form inside mat-dialog-content', () => {
    const dialogContent = fixture.nativeElement.querySelector('mat-dialog-content');
    expect(dialogContent).toBeTruthy();
    const form = dialogContent.querySelector('app-rule-group-form');
    expect(form).toBeTruthy();
  });

  it('should contain mat-dialog-title with text "Create Rule Group"', () => {
    const title = fixture.nativeElement.querySelector('[mat-dialog-title]');
    expect(title).toBeTruthy();
    expect(title.textContent.trim()).toBe('Create Rule Group');
  });

  it('should call dialogRef.close(data) with the exact data when onFormSubmit is called', () => {
    const formData: RuleGroupFormData = {
      ticker: 'PETR4',
      name: 'Petrobras Alerts',
      rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 40 }],
    };

    component.onFormSubmit(formData);

    expect(mockDialogRef.close).toHaveBeenCalledWith(formData);
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should call dialogRef.close() with no argument when onFormCancel is called', () => {
    component.onFormCancel();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
  });

  it('should not pass any argument to dialogRef.close() on cancel', () => {
    component.onFormCancel();

    const callArgs = mockDialogRef.close.mock.calls[0];
    expect(callArgs.length).toBe(0);
  });
});

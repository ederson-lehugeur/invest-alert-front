import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AlertCreationDialogComponent, AlertCreationDialogData } from './alert-creation-dialog.component';
import { Rule } from '../../domain/models/rule.model';
import { RuleGroup } from '../../domain/models/rule-group.model';

describe('AlertCreationDialogComponent', () => {
  let component: AlertCreationDialogComponent;
  let fixture: ComponentFixture<AlertCreationDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };

  const mockRule: Rule = {
    id: 1,
    ticker: 'PETR4',
    field: 'PRICE',
    operator: 'GREATER_THAN',
    targetValue: 40.0,
    groupId: null,
    active: true,
    triggered: false,
  };

  const mockRuleGroup: RuleGroup = {
    id: 10,
    ticker: 'PETR4',
    name: 'Petrobras Alerts',
    rules: [mockRule],
  };

  function createComponent(data: AlertCreationDialogData): void {
    TestBed.configureTestingModule({
      imports: [AlertCreationDialogComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    });

    fixture = TestBed.createComponent(AlertCreationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    mockDialogRef = { close: vi.fn() };
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('Create mode (no rule provided)', () => {
    beforeEach(() => {
      createComponent({ ruleGroups: [] });
    });

    it('should render "Create Rule" title', () => {
      const title = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(title.textContent).toContain('Create Rule');
    });

    it('should have isEditMode as false', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should have ticker field enabled', () => {
      expect(component.form.get('ticker')?.disabled).toBe(false);
    });

    it('should initialize form with empty ticker', () => {
      expect(component.form.get('ticker')?.value).toBe('');
    });

    it('should initialize form with default field PRICE', () => {
      expect(component.form.get('field')?.value).toBe('PRICE');
    });

    it('should initialize form with default operator GREATER_THAN', () => {
      expect(component.form.get('operator')?.value).toBe('GREATER_THAN');
    });

    it('should be invalid when form is empty', () => {
      expect(component.form.valid).toBe(false);
    });

    it('should close dialog with null on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });

    it('should not close dialog when form is invalid on submit', () => {
      component.onSubmit();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.onSubmit();
      expect(component.form.get('ticker')?.touched).toBe(true);
      expect(component.form.get('field')?.touched).toBe(true);
      expect(component.form.get('operator')?.touched).toBe(true);
      expect(component.form.get('targetValue')?.touched).toBe(true);
    });

    it('should close dialog with form data on valid submit', () => {
      component.form.patchValue({
        ticker: 'VALE3',
        field: 'DIVIDEND_YIELD',
        operator: 'LESS_THAN',
        targetValue: 5.5,
        groupId: null,
      });

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith({
        ticker: 'VALE3',
        field: 'DIVIDEND_YIELD',
        operator: 'LESS_THAN',
        targetValue: 5.5,
        groupId: null,
      });
    });

    it('should set isSubmitting to true during submission', () => {
      component.form.patchValue({
        ticker: 'VALE3',
        field: 'PRICE',
        operator: 'GREATER_THAN',
        targetValue: 10,
      });

      // isSubmitting is set before dialogRef.close is called
      const closeSpy = vi.spyOn(mockDialogRef, 'close').mockImplementation(() => {
        expect(component.isSubmitting()).toBe(true);
      });

      component.onSubmit();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Edit mode (rule provided)', () => {
    beforeEach(() => {
      createComponent({ rule: mockRule, ruleGroups: [mockRuleGroup] });
    });

    it('should render "Edit Rule" title', () => {
      const title = fixture.nativeElement.querySelector('[mat-dialog-title]');
      expect(title.textContent).toContain('Edit Rule');
    });

    it('should have isEditMode as true', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should pre-populate ticker from rule', () => {
      expect(component.form.getRawValue().ticker).toBe('PETR4');
    });

    it('should pre-populate field from rule', () => {
      expect(component.form.get('field')?.value).toBe('PRICE');
    });

    it('should pre-populate operator from rule', () => {
      expect(component.form.get('operator')?.value).toBe('GREATER_THAN');
    });

    it('should pre-populate targetValue from rule', () => {
      expect(component.form.get('targetValue')?.value).toBe(40.0);
    });

    it('should disable ticker field in edit mode', () => {
      expect(component.form.get('ticker')?.disabled).toBe(true);
    });

    it('should include disabled ticker value in submitted data', () => {
      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        expect.objectContaining({ ticker: 'PETR4' }),
      );
    });

    it('should close dialog with null on cancel', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith(null);
    });
  });

  describe('Rule groups', () => {
    it('should not render rule group select when no groups provided', () => {
      createComponent({ ruleGroups: [] });
      const groupSelect = fixture.nativeElement.querySelector('[formControlName="groupId"]');
      expect(groupSelect).toBeFalsy();
    });

    it('should render rule group select when groups are provided', () => {
      createComponent({ ruleGroups: [mockRuleGroup] });
      const groupField = fixture.nativeElement.querySelector('mat-select[formcontrolname="groupId"]');
      expect(groupField).toBeTruthy();
    });
  });

  describe('Submit button state', () => {
    beforeEach(() => {
      createComponent({ ruleGroups: [] });
    });

    it('should show submit button text when not submitting', () => {
      const submitBtn = fixture.nativeElement.querySelector('button[color="primary"]');
      expect(submitBtn.textContent).toContain('Create Rule');
    });

    it('should show spinner and disable button while submitting', () => {
      component.isSubmitting.set(true);
      fixture.detectChanges();

      const submitBtn = fixture.nativeElement.querySelector('button[color="primary"]');
      const spinner = fixture.nativeElement.querySelector('mat-progress-spinner');
      expect(submitBtn.disabled).toBe(true);
      expect(spinner).toBeTruthy();
    });
  });
});

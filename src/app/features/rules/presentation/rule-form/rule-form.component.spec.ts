import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleFormComponent, RuleFormData } from './rule-form.component';
import { Rule } from '../../domain/models/rule.model';

describe('RuleFormComponent', () => {
  let component: RuleFormComponent;
  let fixture: ComponentFixture<RuleFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create in create mode by default', () => {
    expect(component.isEditMode).toBe(false);
  });

  it('should show validation errors when submitting empty form', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');
    component.onSubmit();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.get('ticker')?.touched).toBe(true);
    expect(component.form.get('targetValue')?.touched).toBe(true);
  });

  it('should emit form data on valid submission', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.form.patchValue({
      ticker: 'PETR4',
      field: 'PRICE',
      operator: 'GREATER_THAN',
      targetValue: 40,
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      ticker: 'PETR4',
      field: 'PRICE',
      operator: 'GREATER_THAN',
      targetValue: 40,
      groupId: null,
    } satisfies RuleFormData);
  });

  it('should populate form in edit mode', () => {
    const rule: Rule = {
      id: 1,
      ticker: 'VALE3',
      field: 'DIVIDEND_YIELD',
      operator: 'LESS_THAN',
      targetValue: 5.0,
      groupId: null,
      active: true,
      triggered: false,
    };

    component.rule = rule;
    component.ngOnChanges({
      rule: { currentValue: rule, previousValue: null, firstChange: true, isFirstChange: () => true },
    });
    fixture.detectChanges();

    expect(component.isEditMode).toBe(true);
    expect(component.form.getRawValue().ticker).toBe('VALE3');
    expect(component.form.getRawValue().field).toBe('DIVIDEND_YIELD');
    expect(component.form.get('ticker')?.disabled).toBe(true);
  });

  it('should emit cancel event', () => {
    const cancelSpy = vi.spyOn(component.formCancel, 'emit');
    component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });

  it('should display error message when error input is set', () => {
    component.error = 'Bad request';
    fixture.detectChanges();

    const errorEl = fixture.nativeElement.querySelector('app-error-message');
    expect(errorEl).toBeTruthy();
  });
});

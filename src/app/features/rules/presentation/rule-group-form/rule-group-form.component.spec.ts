import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RuleGroupFormComponent, RuleGroupFormData } from './rule-group-form.component';

describe('RuleGroupFormComponent', () => {
  let component: RuleGroupFormComponent;
  let fixture: ComponentFixture<RuleGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleGroupFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RuleGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with one rule entry by default', () => {
    expect(component.rulesArray.length).toBe(1);
  });

  it('should add a rule entry', () => {
    component.addRule();
    expect(component.rulesArray.length).toBe(2);
  });

  it('should remove a rule entry when more than one exists', () => {
    component.addRule();
    expect(component.rulesArray.length).toBe(2);

    component.removeRule(0);
    expect(component.rulesArray.length).toBe(1);
  });

  it('should not remove the last rule entry', () => {
    component.removeRule(0);
    expect(component.rulesArray.length).toBe(1);
  });

  it('should show validation errors when submitting empty form', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');
    component.onSubmit();
    fixture.detectChanges();

    expect(emitSpy).not.toHaveBeenCalled();
    expect(component.form.get('ticker')?.touched).toBe(true);
    expect(component.form.get('name')?.touched).toBe(true);
  });

  it('should emit form data on valid submission', () => {
    const emitSpy = vi.spyOn(component.formSubmit, 'emit');

    component.form.patchValue({
      ticker: 'PETR4',
      name: 'My Group',
    });
    component.rulesArray.at(0).patchValue({
      field: 'PRICE',
      operator: 'GREATER_THAN',
      targetValue: 40,
    });

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledWith({
      ticker: 'PETR4',
      name: 'My Group',
      rules: [{ field: 'PRICE', operator: 'GREATER_THAN', targetValue: 40 }],
    } satisfies RuleGroupFormData);
  });

  it('should emit cancel event', () => {
    const cancelSpy = vi.spyOn(component.formCancel, 'emit');
    component.onCancel();
    expect(cancelSpy).toHaveBeenCalled();
  });
});

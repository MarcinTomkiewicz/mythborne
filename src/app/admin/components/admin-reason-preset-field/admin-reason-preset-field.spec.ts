import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AdminReasonPresetField } from './admin-reason-preset-field';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, AdminReasonPresetField],
  template: '<app-admin-reason-preset-field [control]="reason" />',
})
class HostComponent {
  readonly reason = new FormControl<string>('', { nonNullable: true });
}

describe('AdminReasonPresetField', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent],
    });

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writes preset text into the supplied reason control', () => {
    const field = fixture.debugElement.query(By.directive(AdminReasonPresetField))
      .componentInstance as AdminReasonPresetField;

    expect(host.reason.value).toBe('Balance update');

    field.preset.setValue('content_correction');
    field.applyReason();

    expect(host.reason.value).toBe('Content correction');
  });

  it('requires custom text for Other by leaving the reason empty until text is entered', () => {
    const field = fixture.debugElement.query(By.directive(AdminReasonPresetField))
      .componentInstance as AdminReasonPresetField;

    field.preset.setValue('other');
    field.applyReason();

    expect(host.reason.value).toBe('');

    field.customReason.setValue('  Manual correction.  ');
    field.applyReason();

    expect(host.reason.value).toBe('Manual correction.');
  });
});

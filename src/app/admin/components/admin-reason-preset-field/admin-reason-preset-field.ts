import { Component, Input, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import {
  ADMIN_REASON_PRESET_OPTIONS,
  DEFAULT_ADMIN_REASON_PRESET,
  presetKeyForAdminReason,
  resolveAdminReasonPresetText,
} from '../../../core/utils/admin-reason-presets';
import { AdminReasonPresetKey } from '../../../core/types/admin-reason.types';

@Component({
  selector: 'app-admin-reason-preset-field',
  standalone: true,
  imports: [ReactiveFormsModule, SelectModule, InputTextModule],
  templateUrl: './admin-reason-preset-field.html',
})
export class AdminReasonPresetField implements OnInit {
  @Input({ required: true }) control!: FormControl<string>;
  @Input() label = 'Reason';
  @Input() error: string | null = null;

  readonly presetOptions = ADMIN_REASON_PRESET_OPTIONS;
  readonly preset = new FormControl<AdminReasonPresetKey>(DEFAULT_ADMIN_REASON_PRESET, {
    nonNullable: true,
  });
  readonly customReason = new FormControl<string>('', { nonNullable: true });

  ngOnInit(): void {
    const presetKey = presetKeyForAdminReason(this.control.value);

    this.preset.setValue(presetKey, { emitEvent: false });
    this.customReason.setValue(presetKey === 'other' ? this.control.value : '', {
      emitEvent: false,
    });
    this.applyReason();
  }

  isOther(): boolean {
    return this.preset.value === 'other';
  }

  applyReason(): void {
    const reason = resolveAdminReasonPresetText(this.preset.value, this.customReason.value);

    this.control.setValue(reason);
    this.control.markAsDirty();
  }
}

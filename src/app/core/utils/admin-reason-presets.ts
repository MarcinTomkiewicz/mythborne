import { AdminReasonPresetKey, AdminReasonPresetOption } from '../types/admin-reason.types';

export const ADMIN_REASON_PRESET_OPTIONS: AdminReasonPresetOption[] = [
  { key: 'test_entry', label: 'Test entry', reason: 'Test entry' },
  { key: 'balance_update', label: 'Balance update', reason: 'Balance update' },
  { key: 'content_correction', label: 'Content correction', reason: 'Content correction' },
  { key: 'other', label: 'Other', reason: null },
];

export const DEFAULT_ADMIN_REASON_PRESET: AdminReasonPresetKey = 'balance_update';

export function resolveAdminReasonPresetText(
  presetKey: AdminReasonPresetKey,
  customReason: string,
): string {
  const preset = ADMIN_REASON_PRESET_OPTIONS.find((entry) => entry.key === presetKey);

  return preset?.reason ?? customReason.trim();
}

export function presetKeyForAdminReason(reason: string): AdminReasonPresetKey {
  const normalized = reason.trim();
  const preset = ADMIN_REASON_PRESET_OPTIONS.find((entry) => entry.reason === normalized);

  return preset?.key ?? (normalized ? 'other' : DEFAULT_ADMIN_REASON_PRESET);
}

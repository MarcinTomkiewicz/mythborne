import {
  DEFAULT_ADMIN_REASON_PRESET,
  presetKeyForAdminReason,
  resolveAdminReasonPresetText,
} from './admin-reason-presets';

describe('admin reason presets', () => {
  it('resolves preset reasons as plain RPC text and trims Other text', () => {
    expect(resolveAdminReasonPresetText('test_entry', '')).toBe('Test entry');
    expect(resolveAdminReasonPresetText('balance_update', '')).toBe('Balance update');
    expect(resolveAdminReasonPresetText('content_correction', '')).toBe('Content correction');
    expect(resolveAdminReasonPresetText('other', '  Custom audit reason.  ')).toBe(
      'Custom audit reason.',
    );
  });

  it('infers preset state from an existing reason value', () => {
    expect(presetKeyForAdminReason('Balance update')).toBe('balance_update');
    expect(presetKeyForAdminReason('Custom audit reason.')).toBe('other');
    expect(presetKeyForAdminReason('')).toBe(DEFAULT_ADMIN_REASON_PRESET);
  });
});

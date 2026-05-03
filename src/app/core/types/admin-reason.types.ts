export type AdminReasonPresetKey =
  | 'test_entry'
  | 'balance_update'
  | 'content_correction'
  | 'other';

export interface AdminReasonPresetOption {
  key: AdminReasonPresetKey;
  label: string;
  reason: string | null;
}

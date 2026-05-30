export interface AccountEntrySummaryRow {
  label: string;
  value: string;
  tone?: 'default' | 'danger';
  multiline?: boolean;
  primary?: boolean;
}

export interface AccountEntrySummaryRowConfig<Key extends string = string> {
  key: Key;
  label: string;
  tone?: 'default' | 'danger';
  multiline?: boolean;
  primary?: boolean;
}

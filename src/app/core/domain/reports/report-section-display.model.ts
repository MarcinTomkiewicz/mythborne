export interface ReportDetailSectionEntryRow {
  key: string;
  label: string;
  value: string;
}

export interface ReportDetailSectionEntry {
  key: string;
  title: string | null;
  description: string | null;
  chips: readonly string[];
  lines: readonly string[];
  rows: readonly ReportDetailSectionEntryRow[];
}

export interface ReportDetailSectionView {
  key: string;
  title: string;
  emptyLabel: string | null;
  entries: readonly ReportDetailSectionEntry[];
}

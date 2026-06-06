export type ReportDetailPreviewOutcomeTone = 'success' | 'danger' | 'warning' | 'neutral';

export interface ReportDetailPreviewSection {
  key: string;
  title: string;
  summary: string | null;
  chips: readonly string[];
  lines: readonly string[];
}

export interface ReportDetailPreviewOutcomeBanner {
  title: string;
  tone: ReportDetailPreviewOutcomeTone;
}

export interface ReportDetailPreviewRewardResult {
  title: string;
  summary: string | null;
  entries: readonly ReportDetailPreviewRewardEntry[];
}

export interface ReportDetailPreviewRewardEntry {
  key: string;
  title: string;
  summary: string | null;
  value: string | null;
}

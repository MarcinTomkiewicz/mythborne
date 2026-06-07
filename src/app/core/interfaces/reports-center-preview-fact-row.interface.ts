import {
  ReportsCenterPreviewFactRowCopyLabelKey,
  ReportsCenterPreviewFactRowKey,
} from '../types/reports-center-preview-fact-row.types';

export interface ReportsCenterPreviewFactRowConfig {
  key: ReportsCenterPreviewFactRowKey;
  copyLabelKey: ReportsCenterPreviewFactRowCopyLabelKey;
}

export interface ReportsCenterPreviewFactViewRow {
  key: ReportsCenterPreviewFactRowKey;
  label: string;
  value: string;
  datetime?: string;
}

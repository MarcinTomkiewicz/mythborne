import type { ReportsCenterPreviewFactRowConfig } from '../interfaces/reports-center-preview-fact-row.interface';

export const REPORTS_CENTER_PREVIEW_FACT_ROWS = [
  {
    key: 'source',
    copyLabelKey: 'sourceLabel',
  },
  {
    key: 'eventType',
    copyLabelKey: 'eventTypeLabel',
  },
  {
    key: 'reportDate',
    copyLabelKey: 'reportDateLabel',
  },
] as const satisfies readonly ReportsCenterPreviewFactRowConfig[];

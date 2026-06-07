import type { ReportsCenterFilterGroupConfig } from '../interfaces/reports-center-filter-group-config.interface';

export const REPORTS_CENTER_FILTER_GROUPS = [
  {
    controlName: 'reportAreaKey',
    controlKind: 'badge',
    capabilityKey: 'eventType',
    optionsKey: 'eventTypes',
    copyLabelKey: 'eventTypeLabel',
  },
  {
    controlName: 'readModeKey',
    controlKind: 'select',
    capabilityKey: 'readMode',
    optionsKey: 'readModes',
    copyLabelKey: 'readModeLabel',
  },
  {
    controlName: 'timeRangeKey',
    controlKind: 'select',
    capabilityKey: 'timeRange',
    optionsKey: 'timeRanges',
    copyLabelKey: 'timeRangeLabel',
  },
] as const satisfies readonly ReportsCenterFilterGroupConfig[];

import type { ReportsCenterFilterGroupConfig } from '../interfaces/reports-center-filter-group-config.interface';

export const REPORTS_CENTER_FILTER_GROUPS = [
  {
    controlName: 'reportAreaKey',
    capabilityKey: 'eventType',
    optionsKey: 'eventTypes',
    copyLabelKey: 'eventTypeLabel',
  },
  {
    controlName: 'readModeKey',
    capabilityKey: 'readMode',
    optionsKey: 'readModes',
    copyLabelKey: 'readModeLabel',
  },
  {
    controlName: 'timeRangeKey',
    capabilityKey: 'timeRange',
    optionsKey: 'timeRanges',
    copyLabelKey: 'timeRangeLabel',
  },
] as const satisfies readonly ReportsCenterFilterGroupConfig[];

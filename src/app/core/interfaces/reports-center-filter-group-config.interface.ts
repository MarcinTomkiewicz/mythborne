import {
  ReportsCenterFilterCapabilityKey,
  ReportsCenterFilterControlName,
  ReportsCenterFilterCopyLabelKey,
  ReportsCenterFilterOptionsKey,
} from '../types/reports-center-filter.types';

export interface ReportsCenterFilterGroupConfig {
  controlName: ReportsCenterFilterControlName;
  capabilityKey: ReportsCenterFilterCapabilityKey;
  optionsKey: ReportsCenterFilterOptionsKey;
  copyLabelKey: ReportsCenterFilterCopyLabelKey;
}

import {
  ReportsCenterFilterCapabilityKey,
  ReportsCenterFilterControlKind,
  ReportsCenterFilterControlName,
  ReportsCenterFilterCopyLabelKey,
  ReportsCenterFilterOptionsKey,
} from '../types/reports-center-filter.types';

export interface ReportsCenterFilterGroupConfig {
  controlName: ReportsCenterFilterControlName;
  controlKind: ReportsCenterFilterControlKind;
  capabilityKey: ReportsCenterFilterCapabilityKey;
  optionsKey: ReportsCenterFilterOptionsKey;
  copyLabelKey: ReportsCenterFilterCopyLabelKey;
}

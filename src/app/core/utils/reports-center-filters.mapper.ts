import {
  ReportsCenterAppliedFilters,
  ReportsCenterFilterOption,
  ReportsCenterFilters,
} from '../domain/reports/reports-center.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapFilters(record: JsonRecord, field: string): ReportsCenterFilters {
  const options = requiredRecord(read(record, 'options'), `${field}.options`);

  return {
    applied: mapAppliedFilters(
      requiredRecord(read(record, 'applied'), `${field}.applied`),
      `${field}.applied`,
    ),
    options: {
      eventTypes: mapFilterOptions(read(options, 'eventTypes'), `${field}.options.eventTypes`),
      readModes: mapFilterOptions(read(options, 'readModes'), `${field}.options.readModes`),
      timeRanges: mapFilterOptions(read(options, 'timeRanges'), `${field}.options.timeRanges`),
    },
  };
}

export function mapAppliedFilters(
  record: JsonRecord,
  field: string,
): ReportsCenterAppliedFilters {
  return {
    query: requiredNullableText(read(record, 'query'), `${field}.query`),
    reportAreaKey: requiredText(read(record, 'reportAreaKey'), `${field}.reportAreaKey`),
    readModeKey: requiredText(read(record, 'readModeKey'), `${field}.readModeKey`),
    timeRangeKey: requiredText(read(record, 'timeRangeKey'), `${field}.timeRangeKey`),
  };
}

function mapFilterOptions(value: Json | undefined, field: string): ReportsCenterFilterOption[] {
  return requiredArray(value, field).map((option, index) => ({
    key: requiredText(read(option, 'key'), `${field}[${index}].key`),
    label: requiredText(read(option, 'label'), `${field}[${index}].label`),
    enabled: requiredBoolean(read(option, 'enabled'), `${field}[${index}].enabled`),
  }));
}

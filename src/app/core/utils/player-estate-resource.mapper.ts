import {
  EstateResourceCostRow,
  EstateResourceRow,
} from '../domain/estate/player-estate-page-context.model';
import { assignBoolean, assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredNumber,
  requiredText,
} from './json-read';

export function mapResource(resource: JsonRecord, field: string): EstateResourceRow {
  const row: EstateResourceRow = {
    resourceType: requiredText(read(resource, 'resourceType'), `${field}.resourceType`),
    displayLabel: requiredText(read(resource, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(resource, 'displayValue'), `${field}.displayValue`),
  };

  assignText(row, 'resourceId', optionalText(read(resource, 'resourceId')));
  assignText(row, 'heroId', optionalText(read(resource, 'heroId')));
  assignNumber(row, 'amount', optionalNumber(read(resource, 'amount')));
  assignNumber(row, 'perHour', optionalNumber(read(resource, 'perHour')));
  assignText(row, 'updatedAt', optionalText(read(resource, 'updatedAt')));
  assignText(row, 'dbNow', optionalText(read(resource, 'dbNow')));
  assignNumber(row, 'elapsedHours', optionalNumber(read(resource, 'elapsedHours')));
  assignNumber(
    row,
    'naiveLiveAmountIfAccrued',
    optionalNumber(read(resource, 'naiveLiveAmountIfAccrued')),
  );

  return row;
}

export function mapCost(cost: JsonRecord, field: string): EstateResourceCostRow {
  const row: EstateResourceCostRow = {
    resourceType: requiredText(read(cost, 'resourceType'), `${field}.resourceType`),
    amount: requiredNumber(read(cost, 'amount'), `${field}.amount`),
    displayLabel: requiredText(read(cost, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(cost, 'displayValue'), `${field}.displayValue`),
  };

  assignNumber(row, 'sortOrder', optionalNumber(read(cost, 'sortOrder')));
  assignNumber(row, 'currentAmount', optionalNumber(read(cost, 'currentAmount')));
  assignText(row, 'currentDisplayValue', optionalText(read(cost, 'currentDisplayValue')));
  assignBoolean(row, 'isMet', optionalBoolean(read(cost, 'isMet')));
  assignText(row, 'statusKey', optionalText(read(cost, 'statusKey')));
  assignText(row, 'displayTone', optionalText(read(cost, 'displayTone')));
  assignNumber(row, 'missingAmount', optionalNumber(read(cost, 'missingAmount')));
  assignText(row, 'missingDisplayValue', optionalText(read(cost, 'missingDisplayValue')));
  assignText(row, 'failureReasonKey', optionalText(read(cost, 'failureReasonKey')));
  assignText(row, 'failureReasonLabel', optionalText(read(cost, 'failureReasonLabel')));
  assignText(row, 'valueSource', optionalText(read(cost, 'valueSource')));

  return row;
}

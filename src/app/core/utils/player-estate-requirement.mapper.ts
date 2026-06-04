import { EstateRequirementRow } from '../domain/estate/player-estate-page-context.model';
import { assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
  requiredBoolean,
  requiredText,
} from './json-read';

export function mapRequirement(
  requirement: JsonRecord,
  field: string,
): EstateRequirementRow {
  const row: EstateRequirementRow = {
    entityRequirementId: requiredText(
      read(requirement, 'entityRequirementId'),
      `${field}.entityRequirementId`,
    ),
    requirementDefinitionKey: requiredText(
      read(requirement, 'requirementDefinitionKey'),
      `${field}.requirementDefinitionKey`,
    ),
    displayLabel: requiredText(read(requirement, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(requirement, 'displayValue'), `${field}.displayValue`),
    isMet: requiredBoolean(read(requirement, 'isMet'), `${field}.isMet`),
    statusKey: requiredText(read(requirement, 'statusKey'), `${field}.statusKey`),
    displayTone: requiredText(read(requirement, 'displayTone'), `${field}.displayTone`),
  };

  assignNumber(row, 'requiredValue', optionalNumber(read(requirement, 'requiredValue')));
  assignText(row, 'requiredStatKey', optionalText(read(requirement, 'requiredStatKey')));
  assignText(row, 'requiredBuildingKey', optionalText(read(requirement, 'requiredBuildingKey')));
  assignText(row, 'requiredResourceType', optionalText(read(requirement, 'requiredResourceType')));
  assignText(row, 'requiredDistrictCode', optionalText(read(requirement, 'requiredDistrictCode')));
  assignText(row, 'context', optionalText(read(requirement, 'context')));
  assignNumber(row, 'sortOrder', optionalNumber(read(requirement, 'sortOrder')));
  assignText(row, 'displayUnit', optionalText(read(requirement, 'displayUnit')));
  assignNumber(row, 'currentValue', optionalNumber(read(requirement, 'currentValue')));
  assignText(row, 'currentDisplayValue', optionalText(read(requirement, 'currentDisplayValue')));
  assignNumber(row, 'missingValue', optionalNumber(read(requirement, 'missingValue')));
  assignText(row, 'missingDisplayValue', optionalText(read(requirement, 'missingDisplayValue')));
  assignText(row, 'failureReasonKey', optionalText(read(requirement, 'failureReasonKey')));
  assignText(row, 'failureReasonLabel', optionalText(read(requirement, 'failureReasonLabel')));
  assignText(row, 'valueSource', optionalText(read(requirement, 'valueSource')));

  return row;
}

import { EstateBuildingBonusRow } from '../domain/estate/player-estate-page-context.model';
import { assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
  requiredText,
} from './json-read';

export function mapBonus(bonus: JsonRecord, field: string): EstateBuildingBonusRow {
  const row: EstateBuildingBonusRow = {
    entityBonusId: requiredText(read(bonus, 'entityBonusId'), `${field}.entityBonusId`),
    targetKey: requiredText(read(bonus, 'targetKey'), `${field}.targetKey`),
    typeKey: requiredText(read(bonus, 'typeKey'), `${field}.typeKey`),
    scopeKey: requiredText(read(bonus, 'scopeKey'), `${field}.scopeKey`),
  };

  assignText(row, 'displayLabel', optionalText(read(bonus, 'displayLabel')));
  assignText(row, 'targetLabel', optionalText(read(bonus, 'targetLabel')));
  assignText(row, 'targetDescription', optionalText(read(bonus, 'targetDescription')));
  assignText(row, 'targetHelperText', optionalText(read(bonus, 'targetHelperText')));
  assignNumber(row, 'currentLevel', optionalNumber(read(bonus, 'currentLevel')));
  assignNumber(row, 'nextLevel', optionalNumber(read(bonus, 'nextLevel')));
  assignNumber(row, 'currentValue', optionalNumber(read(bonus, 'currentValue')));
  assignNumber(row, 'nextValue', optionalNumber(read(bonus, 'nextValue')));
  assignNumber(row, 'delta', optionalNumber(read(bonus, 'delta')));
  assignText(row, 'displayValue', optionalText(read(bonus, 'displayValue')));
  assignText(row, 'nextDisplayValue', optionalText(read(bonus, 'nextDisplayValue')));
  assignText(row, 'deltaDisplayValue', optionalText(read(bonus, 'deltaDisplayValue')));
  assignText(row, 'displayText', optionalText(read(bonus, 'displayText')));
  assignText(row, 'nextDisplayText', optionalText(read(bonus, 'nextDisplayText')));
  assignText(row, 'deltaDisplayText', optionalText(read(bonus, 'deltaDisplayText')));
  assignText(row, 'fullDisplayText', optionalText(read(bonus, 'fullDisplayText')));
  assignText(row, 'nextFullDisplayText', optionalText(read(bonus, 'nextFullDisplayText')));
  assignText(row, 'deltaFullDisplayText', optionalText(read(bonus, 'deltaFullDisplayText')));

  return row;
}

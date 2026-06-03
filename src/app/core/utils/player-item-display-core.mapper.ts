import type {
  PlayerItemDisplayCore,
  PlayerItemDisplayCoreValueDisplay,
} from '../domain/item/player-item-display-core.model';
import { Json } from '../types/database.types';
import {
  optionalText,
  read,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapPlayerItemDisplayCore(
  value: Json | undefined,
  field: string,
): PlayerItemDisplayCore {
  const row = requiredRecord(value, field);

  return {
    itemId: requiredText(read(row, 'itemId'), `${field}.itemId`),
    itemName: requiredText(read(row, 'itemName'), `${field}.itemName`),
    lifecycleStatusKey: optionalText(read(row, 'lifecycleStatusKey')),
    lifecycleStatusLabel: optionalText(read(row, 'lifecycleStatusLabel')),
    generationQualityKey: optionalText(read(row, 'generationQualityKey')),
    qualityLabel: optionalText(read(row, 'qualityLabel')),
    baseKey: optionalText(read(row, 'baseKey')),
    baseName: optionalText(read(row, 'baseName')),
    baseTypeKey: optionalText(read(row, 'baseTypeKey')),
    baseTypeLabel: optionalText(read(row, 'baseTypeLabel')),
    drachmaValue: optionalText(read(row, 'drachmaValue')),
    valueDisplay: mapPlayerItemDisplayCoreValueDisplay(
      read(row, 'valueDisplay'),
      `${field}.valueDisplay`,
    ),
    displayIconKey: requiredText(read(row, 'displayIconKey'), `${field}.displayIconKey`),
    equipmentArea: optionalText(read(row, 'equipmentArea')),
    handUsageKey: optionalText(read(row, 'handUsageKey')),
    handUsageLabel: optionalText(read(row, 'handUsageLabel')),
    primarySlotKey: optionalText(read(row, 'primarySlotKey')),
    primarySlotLabel: optionalText(read(row, 'primarySlotLabel')),
    equipmentSlotKey: optionalText(read(row, 'equipmentSlotKey')),
    equipmentSlotLabel: optionalText(read(row, 'equipmentSlotLabel')),
    allowedSlotKeys: requiredTextArray(
      read(row, 'allowedSlotKeys'),
      `${field}.allowedSlotKeys`,
    ),
    allowedSlotLabel: optionalText(read(row, 'allowedSlotLabel')),
  };
}

function mapPlayerItemDisplayCoreValueDisplay(
  value: Json | undefined,
  field: string,
): PlayerItemDisplayCoreValueDisplay | null {
  if (value === null || value === undefined) {
    return null;
  }

  const row = requiredRecord(value, field);

  return {
    displayLabel: requiredText(read(row, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(row, 'displayValue'), `${field}.displayValue`),
  };
}

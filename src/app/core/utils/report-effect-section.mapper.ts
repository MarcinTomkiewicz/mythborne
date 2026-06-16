import {
  ReportEffectDisplay,
  ReportEffectRow,
  ReportEffectSection,
  ReportRewardEffectEntryRow,
} from '../domain/reports/report.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableText,
  optionalTextArray,
  read,
  requiredArray,
  requiredBoolean,
  requiredNullableText,
  requiredRecord,
  requiredText,
  requiredTextArray,
} from './json-read';

export function mapNullableEffectSection(
  value: Json | undefined,
  field: string,
): ReportEffectSection | null {
  if (value === undefined) {
    throw new Error(`${field} must be present.`);
  }

  return value === null ? null : mapEffectSection(requiredRecord(value, field), field);
}

export function mapNullableEffectDisplay(
  value: Json | undefined,
  field: string,
): ReportEffectDisplay | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapEffectDisplay(requiredRecord(value, field), field);
}

function mapEffectSection(record: JsonRecord, field: string): ReportEffectSection {
  return {
    hasEffects: requiredBoolean(read(record, 'hasEffects'), `${field}.hasEffects`),
    title: requiredText(read(record, 'title'), `${field}.title`),
    summary: requiredText(read(record, 'summary'), `${field}.summary`),
    sourceLabel: requiredText(read(record, 'sourceLabel'), `${field}.sourceLabel`),
    effects: requiredArray(read(record, 'effects'), `${field}.effects`)
      .map((row, index) => mapEffectRow(row, `${field}.effects[${index}]`)),
    rewardEffectEntries: requiredArray(
      read(record, 'rewardEffectEntries'),
      `${field}.rewardEffectEntries`,
    ).map((row, index) => mapRewardEffectEntry(
      row,
      `${field}.rewardEffectEntries[${index}]`,
      index,
    )),
    narrativeLines: optionalTextArray(read(record, 'narrativeLines'), `${field}.narrativeLines`),
  };
}

function mapEffectRow(row: JsonRecord, field: string): ReportEffectRow {
  return {
    ...mapEffectDisplay(row, field),
    status: requiredText(read(row, 'status'), `${field}.status`),
    statusLabel: requiredText(read(row, 'statusLabel'), `${field}.statusLabel`),
    isActive: requiredBoolean(read(row, 'isActive'), `${field}.isActive`),
    appliedAt: requiredNullableText(read(row, 'appliedAt'), `${field}.appliedAt`),
    consumedAt: requiredNullableText(read(row, 'consumedAt'), `${field}.consumedAt`),
  };
}

function mapRewardEffectEntry(
  row: JsonRecord,
  field: string,
  index: number,
): ReportRewardEffectEntryRow {
  const reason = read(row, 'reason');

  return {
    ...mapEffectDisplay(row, field),
    skipped: requiredBoolean(read(row, 'skipped'), `${field}.skipped`),
    applied: requiredBoolean(read(row, 'applied'), `${field}.applied`),
    reason: reason === undefined
      ? `report.effectSectionJson.rewardEffectEntries[${index}].reason`
      : optionalNullableText(reason, `${field}.reason`),
    createdAt: requiredNullableText(read(row, 'createdAt'), `${field}.createdAt`),
  };
}

function mapEffectDisplay(row: JsonRecord, field: string): ReportEffectDisplay {
  return {
    effectKey: requiredText(read(row, 'effectKey', 'effect_key'), `${field}.effectKey`),
    effectLabel: requiredText(read(row, 'effectLabel', 'effect_label'), `${field}.effectLabel`),
    effectDescription: optionalNullableText(
      read(row, 'effectDescription', 'effect_description'),
      `${field}.effectDescription`,
    ),
    effectHelperText: optionalNullableText(
      read(row, 'effectHelperText', 'effect_helper_text'),
      `${field}.effectHelperText`,
    ),
    effectKind: requiredText(read(row, 'effectKind', 'effect_kind'), `${field}.effectKind`),
    effectKindLabel: requiredText(
      read(row, 'effectKindLabel', 'effect_kind_label'),
      `${field}.effectKindLabel`,
    ),
    title: requiredText(read(row, 'title'), `${field}.title`),
    summary: requiredText(read(row, 'summary'), `${field}.summary`),
    playerSummary: requiredText(read(row, 'playerSummary', 'player_summary'), `${field}.playerSummary`),
    displayValue: requiredText(read(row, 'displayValue', 'display_value'), `${field}.displayValue`),
    valueDisplay: requiredText(read(row, 'valueDisplay', 'value_display'), `${field}.valueDisplay`),
    narrativeLines: requiredTextArray(
      read(row, 'narrativeLines', 'narrative_lines'),
      `${field}.narrativeLines`,
    ),
    descriptionLines: requiredTextArray(
      read(row, 'descriptionLines', 'description_lines'),
      `${field}.descriptionLines`,
    ),
    bonusTemplateKey: optionalNullableText(
      read(row, 'bonusTemplateKey', 'bonus_template_key'),
      `${field}.bonusTemplateKey`,
    ),
    bonusTemplateLabel: optionalNullableText(
      read(row, 'bonusTemplateLabel', 'bonus_template_label'),
      `${field}.bonusTemplateLabel`,
    ),
    bonusTemplateDescription: optionalNullableText(
      read(row, 'bonusTemplateDescription', 'bonus_template_description'),
      `${field}.bonusTemplateDescription`,
    ),
    bonusTypeKey: optionalNullableText(read(row, 'bonusTypeKey', 'bonus_type_key'), `${field}.bonusTypeKey`),
    bonusTypeLabel: optionalNullableText(read(row, 'bonusTypeLabel', 'bonus_type_label'), `${field}.bonusTypeLabel`),
    effectTargetKey: optionalNullableText(
      read(row, 'effectTargetKey', 'effect_target_key'),
      `${field}.effectTargetKey`,
    ),
    effectTargetLabel: optionalNullableText(
      read(row, 'effectTargetLabel', 'effect_target_label'),
      `${field}.effectTargetLabel`,
    ),
    effectTargetDescription: optionalNullableText(
      read(row, 'effectTargetDescription', 'effect_target_description'),
      `${field}.effectTargetDescription`,
    ),
    effectTargetHelperText: optionalNullableText(
      read(row, 'effectTargetHelperText', 'effect_target_helper_text'),
      `${field}.effectTargetHelperText`,
    ),
    effectScopeKey: optionalNullableText(
      read(row, 'effectScopeKey', 'effect_scope_key'),
      `${field}.effectScopeKey`,
    ),
    effectScopeLabel: optionalNullableText(
      read(row, 'effectScopeLabel', 'effect_scope_label'),
      `${field}.effectScopeLabel`,
    ),
  };
}

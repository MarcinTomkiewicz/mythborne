import {
  GameReportContextSection,
  GameReportRelatedReport,
  GameReportSectionFact,
  GameReportSectionItem,
} from '../domain/reports/game-report.model';
import { Json } from '../types/database.types';
import {
  optionalJsonString,
  readJsonField,
  requiredJsonArray,
  requiredJsonRecord,
} from './game-report-json-reader';
import { resourceTypeLabel, signedAmountLabel } from './resource-display';

type ReportSectionKind = GameReportContextSection['sectionKind'];

export function parseGameReportContextSection(
  value: Json | undefined,
  sectionKind: ReportSectionKind,
): GameReportContextSection | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = requiredJsonRecord(value, `${sectionKind}_section_json`);
  const title = firstText(record, 'title', 'label', 'heading');

  if (!title) {
    return null;
  }

  return {
    sectionKind,
    title,
    summary: firstText(record, 'summary', 'description', 'helperText', 'body'),
    badge: firstText(record, 'badge', 'statusLabel', 'outcomeLabel', 'kindLabel'),
    facts: parseFacts(readJsonField(record, 'facts')),
    items: [
      ...parseItems(readJsonField(record, 'items')),
      ...parseItems(readJsonField(record, 'entries')),
      ...parseItems(readJsonField(record, 'effects')),
    ],
  };
}

export function parseGameReportRelatedReports(value: Json | undefined): GameReportRelatedReport[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'related_reports_json')
    .map((entry) => {
      const record = requiredJsonRecord(entry, 'related_reports_json entry');
      const title = firstText(record, 'title', 'label');

      if (!title) {
        return null;
      }

      return {
        reportId: firstText(record, 'reportId', 'report_id'),
        publicToken: firstText(record, 'publicToken', 'public_token'),
        reportTypeKey: firstText(record, 'reportTypeKey', 'report_type_key'),
        reportTypeLabel: firstText(record, 'reportTypeLabel', 'report_type_label'),
        title,
        summary: firstText(record, 'summary', 'description'),
        relationLabel: firstText(record, 'relationLabel', 'relation_label', 'relation'),
      };
    })
    .filter((report): report is GameReportRelatedReport => report !== null);
}

function parseFacts(value: Json | undefined): GameReportSectionFact[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'section facts')
    .map((entry) => {
      const record = requiredJsonRecord(entry, 'section fact');
      const label = firstText(record, 'label', 'name');
      const rawValue = readJsonField(record, 'value');
      const factValue = typeof rawValue === 'string'
        ? rawValue
        : typeof rawValue === 'number' || typeof rawValue === 'boolean'
          ? String(rawValue)
          : firstText(record, 'text');

      return label && factValue ? { label, value: factValue } : null;
    })
    .filter((fact): fact is GameReportSectionFact => fact !== null);
}

function parseItems(value: Json | undefined): GameReportSectionItem[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'section items')
    .map((entry): GameReportSectionItem | null => {
      const record = requiredJsonRecord(entry, 'section item');
      const entryKind = firstText(record, 'entryKind', 'entry_kind', 'kind', 'rewardEntryKind', 'reward_entry_kind');
      const resourceType = firstText(record, 'resourceType', 'resource_type');
      const amount = firstNumber(record, 'amount', 'resourceAmount', 'resource_amount');
      const rawLabel = firstText(
        record,
        'label',
        'title',
        'name',
        'entryLabel',
        'entry_label',
        'displayName',
        'display_name',
      );
      const label = resourceType && isGenericResourceLabel(rawLabel)
        ? resourceTypeLabel(resourceType)
        : rawLabel ?? entryKindLabel(entryKind, resourceType);

      if (!label) {
        return null;
      }

      return {
        label,
        value: resourceType && amount !== null
          ? signedAmountLabel(amount)
          : firstPrimitiveText(record, 'value', 'amount', 'amountLabel', 'amount_label', 'statusLabel', 'summary'),
        details: parseStringArray(readJsonField(record, 'details')),
        ...(entryKind ? { entryKind } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(amount !== null ? { amount } : {}),
      };
    })
    .filter((item): item is GameReportSectionItem => item !== null);
}

function firstNumber(
  record: Record<string, Json | undefined>,
  ...keys: string[]
): number | null {
  for (const key of keys) {
    const value = readJsonField(record, key);

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function isGenericResourceLabel(label: string | null): boolean {
  return !label || ['resource', 'resources', 'zasob', 'zasoby'].includes(label.toLowerCase());
}

function entryKindLabel(entryKind: string | null, resourceType: string | null): string | null {
  switch (normalizeKey(entryKind)) {
    case 'experience':
      return 'Experience';
    case 'character_points':
    case 'hero_points':
      return 'Character Points';
    case 'resource':
      return resourceType ? resourceTypeLabel(resourceType) : 'Resource';
    case 'item_generation':
    case 'generated_item':
      return 'Przedmiot';
    default:
      return null;
  }
}

function normalizeKey(value: string | null): string {
  return String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
}

function parseStringArray(value: Json | undefined): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'details')
    .map((entry) => typeof entry === 'string' && entry.length > 0 ? entry : null)
    .filter((entry): entry is string => entry !== null);
}

function firstPrimitiveText(
  record: Record<string, Json | undefined>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = readJsonField(record, key);

    if (typeof value === 'string' && value.length > 0) {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
  }

  return null;
}

function firstText(
  record: Record<string, Json | undefined>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = optionalJsonString(readJsonField(record, key));

    if (value) {
      return value;
    }
  }

  return null;
}

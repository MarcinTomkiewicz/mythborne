import {
  GameReportContextSection,
  GameReportRelatedReport,
  GameReportSectionFact,
  GameReportSectionItem,
  GameReportSpyBuildingDisplay,
  GameReportSpyDisplay,
} from '../domain/reports/game-report.model';
import { mapEquipmentPreviewRows } from '../domain/equipment/equipment-preview.mapper';
import { EquipmentPreviewSlotRow } from '../domain/equipment/equipment-preview.model';
import { equipmentPreviewIconClassForSlot } from '../domain/equipment/equipment-preview-icons.config';
import { EquipmentSlot } from '../domain/item/item-equipment.model';
import { Json } from '../types/database.types';
import {
  optionalJsonBoolean,
  optionalJsonNumber,
  optionalJsonString,
  readJsonField,
  requiredJsonArray,
  requiredJsonRecord,
} from './game-report-json-reader';
import { firstText } from './json-display-text';
import { normalizeKeyText } from './normalize-text';
import { resourceTypeLabel, signedAmountLabel } from './resource-display';
import { colorableToneTextClass, statTone } from './stat-tone-class';

type ReportSectionKind = GameReportContextSection['sectionKind'];

const SPY_STANDARD_EQUIPMENT_SLOTS: EquipmentSlot[] = [
  equipmentSlot('main_hand', 'Główna ręka', 10, 'weapon', 'hand'),
  equipmentSlot('off_hand', 'Druga ręka', 20, 'weapon', 'hand'),
  equipmentSlot('helmet', 'Hełm', 30, 'armor', 'head'),
  equipmentSlot('armor', 'Pancerz', 40, 'armor', 'torso'),
  equipmentSlot('pants', 'Nogawice', 50, 'armor', 'legs'),
  equipmentSlot('boots', 'Buty', 60, 'armor', 'feet'),
  equipmentSlot('amulet', 'Amulet', 70, 'jewelry', 'neck'),
  equipmentSlot('ring_1', 'Pierścień 1', 80, 'jewelry', 'finger'),
  equipmentSlot('ring_2', 'Pierścień 2', 90, 'jewelry', 'finger'),
];

export function parseGameReportContextSection(
  value: Json | undefined,
  sectionKind: ReportSectionKind,
): GameReportContextSection | null {
  if (value === undefined || value === null) {
    return null;
  }

  const record = requiredJsonRecord(value, `${sectionKind}_section_json`);
  const title = firstText(record, 'title', 'label', 'heading') ??
    (sectionKind === 'spy'
      ? firstText(record, 'outcomeLabel') ?? 'Raport szpiegowania'
      : null);

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
    spyDisplay: sectionKind === 'spy' ? parseSpyDisplay(record) : null,
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
      const entryKind = firstText(
        record,
        'entryKind',
        'entry_kind',
        'kind',
        'rewardEntryKind',
        'reward_entry_kind',
      );
      const resourceType = firstText(record, 'resourceType', 'resource_type');
      const amount = optionalJsonNumber(readJsonField(record, 'amount')) ??
        optionalJsonNumber(readJsonField(record, 'resourceAmount')) ??
        optionalJsonNumber(readJsonField(record, 'resource_amount'));
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
      const rawItemValue = readJsonField(record, 'value') ??
        readJsonField(record, 'amount') ??
        readJsonField(record, 'amountLabel') ??
        readJsonField(record, 'amount_label') ??
        readJsonField(record, 'statusLabel') ??
        readJsonField(record, 'summary');
      const itemValue = typeof rawItemValue === 'string'
        ? rawItemValue
        : typeof rawItemValue === 'number' || typeof rawItemValue === 'boolean'
          ? String(rawItemValue)
          : null;
      const detailsJson = readJsonField(record, 'details');

      if (!label) {
        return null;
      }

      return {
        label,
        value: resourceType && amount !== null
          ? signedAmountLabel(amount)
          : itemValue,
        details: detailsJson === undefined || detailsJson === null
          ? []
          : requiredJsonArray(detailsJson, 'details')
            .map((detail) => optionalJsonString(detail))
            .filter((detail): detail is string => detail !== null),
        ...(entryKind ? { entryKind } : {}),
        ...(resourceType ? { resourceType } : {}),
        ...(amount !== null ? { amount } : {}),
      };
    })
    .filter((item): item is GameReportSectionItem => item !== null);
}

function parseSpyDisplay(record: Record<string, Json | undefined>): GameReportSpyDisplay {
  return {
    outcomeKey: firstText(record, 'outcomeKey'),
    outcomeLabel: firstText(record, 'outcomeLabel'),
    playerSummary: firstText(record, 'playerSummary'),
    viewerRole: firstText(record, 'viewerRole'),
    equipment: parseSpyEquipment(
      readJsonField(record, 'equipment'),
      isSpyEquipmentRevealed(record),
    ),
    baseStats: parseSpyBaseStats(readJsonField(record, 'baseStats')),
    buildings: parseSpyBuildings(readJsonField(record, 'buildings')),
    resources: parseSpyResources(readJsonField(record, 'resources')),
  };
}

function parseSpyEquipment(
  value: Json | undefined,
  isRevealed: boolean,
): EquipmentPreviewSlotRow[] {
  if (value === undefined || value === null) {
    return isRevealed ? mapEquipmentPreviewRows(SPY_STANDARD_EQUIPMENT_SLOTS, []) : [];
  }

  const entries = spyEquipmentEntries(value);

  const rows = entries
    .map((entry, index): EquipmentPreviewSlotRow | null => {
      const record = requiredJsonRecord(entry, 'spy equipment entry');
      const slotKey = firstText(record, 'slotKey');
      const label = firstText(record, 'slotLabel') ?? slotKey;

      if (!slotKey || !label) {
        return null;
      }

      const itemRecord = itemRecordFromSpyEquipment(record);
      const sortOrder = optionalJsonNumber(readJsonField(record, 'sortOrder')) ?? index;

      return {
        slotKey,
        label,
        sortOrder,
        iconClass: equipmentPreviewIconClassForSlot(slotKey),
        item: itemRecord ? {
          itemId: firstText(itemRecord, 'itemId', 'sourceItemId') ?? `${slotKey}-${sortOrder}`,
          name: firstText(itemRecord, 'displayName', 'itemName', 'name') ?? 'Nieznany przedmiot',
          metadata: firstText(itemRecord, 'metadata', 'summary', 'description'),
          statusLabel: firstText(itemRecord, 'statusLabel'),
          qualityLabel: firstText(itemRecord, 'qualityLabel', 'qualityKey'),
          kindLabel: firstText(itemRecord, 'kindLabel', 'baseName', 'typeLabel'),
          slotLabel: label,
        } : null,
      };
    })
    .filter((row): row is EquipmentPreviewSlotRow => row !== null);

  return rows.length || !isRevealed
    ? rows
    : mapEquipmentPreviewRows(SPY_STANDARD_EQUIPMENT_SLOTS, []);
}

function spyEquipmentEntries(value: Json): Json[] {
  if (Array.isArray(value)) {
    return value;
  }

  const record = requiredJsonRecord(value, 'spy equipment');
  const slots = readJsonField(record, 'slots');

  if (Array.isArray(slots)) {
    return slots;
  }

  return Object.entries(record)
    .map(([slotKey, item]) => item && typeof item === 'object'
      ? { slotKey, item } as unknown as Json
      : null)
    .filter((entry): entry is Json => entry !== null);
}

function isSpyEquipmentRevealed(record: Record<string, Json | undefined>): boolean {
  const revealedSections = readJsonField(record, 'revealedSections');

  if (!revealedSections) {
    return false;
  }

  return optionalJsonBoolean(readJsonField(
    requiredJsonRecord(revealedSections, 'spy revealedSections'),
    'equipment',
  )) === true;
}

function itemRecordFromSpyEquipment(
  record: Record<string, Json | undefined>,
): Record<string, Json | undefined> | null {
  const nested = readJsonField(record, 'item');

  if (nested === null) {
    return null;
  }

  if (nested !== undefined) {
    return requiredJsonRecord(nested, 'spy equipment item');
  }

  const hasInlineItemName = Boolean(
    firstText(record, 'itemName', 'displayName', 'name'),
  );

  return hasInlineItemName ? record : null;
}

function parseSpyBaseStats(value: Json | undefined): GameReportSectionFact[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'spy baseStats')
    .map((entry): GameReportSectionFact | null => {
      const record = requiredJsonRecord(entry, 'spy baseStats entry');
      const label = firstText(record, 'statLabel');
      const rawValue = readJsonField(record, 'value');
      const rowValue = firstText(record, 'displayValue') ??
        (typeof rawValue === 'number' || typeof rawValue === 'boolean'
          ? String(rawValue)
          : optionalJsonString(rawValue));

      return label && rowValue
        ? {
          label,
          value: rowValue,
          valueClass: colorableToneTextClass(
            statTone(readJsonField(record, 'tone')),
            optionalJsonBoolean(readJsonField(record, 'colorableFinalValue')) === true,
            'text-sm',
          ),
        }
        : null;
    })
    .filter((row): row is GameReportSectionFact => row !== null);
}

function parseSpyBuildings(value: Json | undefined): GameReportSpyBuildingDisplay[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'spy buildings')
    .map((entry) => {
      const record = requiredJsonRecord(entry, 'spy buildings entry');
      const districtCode = firstText(record, 'districtCode');
      const label = firstText(record, 'buildingName');
      const rowValue = levelDisplay(optionalJsonNumber(readJsonField(record, 'level'))) ??
        firstText(record, 'displayValue');

      return districtCode && label && rowValue
        ? { districtCode, label, value: rowValue }
        : null;
    })
    .filter((row): row is GameReportSpyBuildingDisplay => row !== null);
}

function parseSpyResources(value: Json | undefined): GameReportSectionFact[] {
  if (value === undefined || value === null) {
    return [];
  }

  return requiredJsonArray(value, 'spy resources')
    .map((entry) => {
      const record = requiredJsonRecord(entry, 'spy resources entry');
      const label = firstText(record, 'resourceLabel');
      const rawAmount = readJsonField(record, 'amount');
      const rowValue = firstText(record, 'displayValue') ??
        (typeof rawAmount === 'number' || typeof rawAmount === 'boolean'
          ? String(rawAmount)
          : optionalJsonString(rawAmount));

      return label && rowValue ? { label, value: rowValue } : null;
    })
    .filter((row): row is GameReportSectionFact => row !== null);
}

function levelDisplay(value: number | null): string | null {
  return value === null ? null : `Poziom ${value}`;
}

function isGenericResourceLabel(label: string | null): boolean {
  return !label || ['resource', 'resources', 'zasob', 'zasoby'].includes(label.toLowerCase());
}

function entryKindLabel(entryKind: string | null, resourceType: string | null): string | null {
  switch (normalizeKeyText(entryKind)) {
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

function equipmentSlot(
  slotKey: string,
  label: string,
  sortOrder: number,
  equipmentArea: string,
  equipmentSlotGroup: string,
): EquipmentSlot {
  return {
    slotKey,
    label,
    sortOrder,
    equipmentArea,
    equipmentSlotGroup,
  };
}

import { PvpSpyResult } from '../../../core/domain/pvp/pvp.model';
import { Json } from '../../../core/types/database.types';
import {
  jsonRecord,
  JsonRecord,
  mapJsonArray,
  optionalNumber,
  optionalText,
  read,
} from '../../../core/utils/json-read';

export interface PvpSpyResultDisplay {
  targetFacts: PvpSpyResultDisplayRow[];
  sections: PvpSpyResultDisplaySection[];
}

export interface PvpSpyResultDisplaySection {
  title: string;
  description: string;
  rows: PvpSpyResultDisplayRow[];
  emptyText: string;
}

export interface PvpSpyResultDisplayRow {
  label: string;
  value: string;
}

const BLOCKED_KEY_PARTS = [
  'id',
  'user',
  'account',
  'auth',
  'owner',
  'metadata',
  'admin',
  'staff',
  'anti_abuse',
  'antiabuse',
  'abuse',
  'request',
  'active_exploration',
  'activeexploration',
  'active_pvp',
  'activepvp',
  'runtime',
];

export function pvpSpyResultDisplay(result: PvpSpyResult): PvpSpyResultDisplay {
  return {
    targetFacts: [
      { label: 'Target', value: result.targetDisplayName },
      { label: 'Target level', value: String(result.targetLevelSnapshot) },
      { label: 'Target estate', value: result.targetAddress ?? 'Unknown estate' },
      { label: 'Spy level', value: String(result.spyLevelSnapshot) },
      { label: 'Created', value: dateTimeLabel(result.createdAt) },
      { label: 'Visibility', value: humanLabel(result.visibilityKey) },
    ],
    sections: [
      {
        title: 'Base stats',
        description: 'Snapshot recorded by the PvP spy result.',
        rows: primitiveRows(result.snapshots.baseStats),
        emptyText: 'No base stat snapshot was recorded.',
      },
      {
        title: 'Resources',
        description: 'Resource amounts visible in this spy result.',
        rows: primitiveRows(result.snapshots.resources),
        emptyText: 'No resource snapshot was recorded.',
      },
      {
        title: 'Equipment',
        description: 'Current equipment snapshot recorded by the DB spy result.',
        rows: equipmentRows(result.snapshots.equipment),
        emptyText: 'No equipment entries were recorded.',
      },
      {
        title: 'Estate',
        description: 'Estate details visible in this spy result.',
        rows: primitiveRows(result.snapshots.estate),
        emptyText: 'No estate snapshot was recorded.',
      },
      {
        title: 'Buildings',
        description: 'Building entries visible in this spy result.',
        rows: buildingRows(result.snapshots.buildings),
        emptyText: 'No building entries were recorded.',
      },
    ],
  };
}

function equipmentRows(value: Json): PvpSpyResultDisplayRow[] {
  let index = 0;
  return mapJsonArray(value, (record) => {
    const row = {
      label: itemLabel(record, index),
      value: itemValue(record),
    };
    index += 1;
    return row;
  });
}

function buildingRows(value: Json): PvpSpyResultDisplayRow[] {
  let index = 0;
  return mapJsonArray(value, (record) => {
    const row = {
      label: itemLabel(record, index),
      value: buildingValue(record),
    };
    index += 1;
    return row;
  });
}

function primitiveRows(value: Json): PvpSpyResultDisplayRow[] {
  const record = jsonRecord(value);

  if (!record) {
    return [];
  }

  return Object.entries(record).flatMap(([key, entry]) => {
    if (isBlockedKey(key)) {
      return [];
    }

    const formatted = formatScalar(entry);
    return formatted ? [{ label: humanLabel(key), value: formatted }] : [];
  });
}

function itemLabel(record: JsonRecord, index: number): string {
  const label = optionalText(read(record, 'slotLabel', 'slot_label', 'slot', 'position'));
  return label ? humanLabel(label) : `Entry ${index + 1}`;
}

function itemValue(record: JsonRecord): string {
  const name = optionalText(read(
    record,
    'itemName',
    'item_name',
    'name',
    'displayName',
    'display_name',
    'label',
  ));
  const type = optionalText(read(record, 'typeLabel', 'type_label', 'type', 'itemType'));
  const quality = optionalText(read(record, 'qualityLabel', 'quality_label', 'quality'));
  const parts = [name, quality, type].filter((value): value is string => !!value);

  return parts.length > 0 ? parts.join(' · ') : 'Equipment entry recorded.';
}

function buildingValue(record: JsonRecord): string {
  const name = optionalText(read(
    record,
    'buildingName',
    'building_name',
    'name',
    'displayName',
    'display_name',
    'label',
    'key',
  ));
  const level = optionalNumber(read(record, 'level', 'buildingLevel', 'building_level'));
  const status = optionalText(read(record, 'statusLabel', 'status_label', 'status'));
  const parts = [
    name,
    level === null ? null : `Level ${level}`,
    status,
  ].filter((value): value is string => !!value);

  return parts.length > 0 ? parts.join(' · ') : 'Building entry recorded.';
}

function formatScalar(value: Json | undefined): string | null {
  if (typeof value === 'string') {
    return value.trim() || null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return null;
}

function humanLabel(value: string): string {
  const normalized = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();

  return normalized
    ? normalized.charAt(0).toUpperCase() + normalized.slice(1)
    : value;
}

function isBlockedKey(key: string): boolean {
  const normalized = key
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();

  return BLOCKED_KEY_PARTS.some((part) =>
    normalized === part
      || normalized.endsWith(`_${part}`)
      || normalized.includes(`${part}_`),
  );
}

function dateTimeLabel(value: string): string {
  return new Date(value).toLocaleString();
}

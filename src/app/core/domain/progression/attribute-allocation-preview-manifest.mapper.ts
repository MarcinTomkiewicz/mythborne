import { Json } from '../../types/database.types';
import {
  JsonRecord,
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
} from '../../utils/json-read';
import {
  AttributeAllocationBaseStatInput,
  AttributeAllocationPreviewDescriptor,
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
  AttributeAllocationPreviewTerm,
} from './attribute-allocation-preview-manifest.model';

const CONTRACT_VERSION = 'hero_attribute_allocation_preview_manifest_v2';

export function mapAttributeAllocationPreviewManifest(
  value: Json,
): AttributeAllocationPreviewManifest {
  const record = jsonRecord(value);
  const rules = jsonRecord(read(record, 'rules'));
  const snapshot = jsonRecord(read(record, 'currentRuntimeSnapshot', 'current_runtime_snapshot'));
  const supportedEntries = read(record, 'supportedDerivedStats', 'supported_derived_stats');
  const unsupportedEntries = read(record, 'unsupportedDerivedStats', 'unsupported_derived_stats');
  const supportedRows = previewRowsFromEntries(
    supportedEntries,
    snapshot,
    true,
  );
  const unsupportedRows = previewRowsFromEntries(
    unsupportedEntries,
    snapshot,
    false,
  );

  return {
    contractVersion: optionalText(read(record, 'contractVersion')) ?? null,
    oneShotManifest: optionalBoolean(read(rules, 'oneShotManifest')) ?? false,
    perClickRpcPreviewRequired:
      optionalBoolean(read(rules, 'perClickRpcPreviewRequired')) ?? true,
    frontendMayEvaluateLocally:
      optionalBoolean(read(rules, 'frontendMayEvaluateLocally')) ?? false,
    baseStatInputs: mapBaseStatInputs(jsonRecord(read(record, 'baseStatInputs'))),
    rows: [...supportedRows, ...unsupportedRows],
  };
}

export function isUsableAttributeAllocationPreviewManifest(
  manifest: AttributeAllocationPreviewManifest | null,
): manifest is AttributeAllocationPreviewManifest {
  return !!manifest
    && manifest.contractVersion === CONTRACT_VERSION
    && manifest.oneShotManifest
    && !manifest.perClickRpcPreviewRequired
    && manifest.frontendMayEvaluateLocally;
}

export function attributeAllocationPreviewManifestError(
  manifest: AttributeAllocationPreviewManifest | null,
): string | null {
  if (!manifest) {
    return null;
  }

  if (!isUsableAttributeAllocationPreviewManifest(manifest)) {
    return 'Derived preview is not available for this hero yet.';
  }

  return manifest.rows.length === 0
    ? 'Derived preview is not available for this hero yet.'
    : null;
}

function previewRowsFromEntries(
  value: Json | undefined,
  snapshot: JsonRecord | null,
  supported: boolean,
): AttributeAllocationPreviewRow[] {
  if (Array.isArray(value)) {
    return value.flatMap((entryValue) => {
      const entry = jsonRecord(entryValue);
      const key = entryKey(entry);

      return entry && key
        ? previewRowsFromEntry(key, entry, snapshot, supported)
        : [];
    });
  }

  const record = jsonRecord(value);
  if (!record) {
    return [];
  }

  return Object.entries(record).flatMap(([key, value]) => {
    const entry = jsonRecord(value);
    return entry
      ? previewRowsFromEntry(key, entry, snapshot, supported)
      : [];
  });
}

function previewRowsFromEntry(
  key: string,
  entry: JsonRecord,
  snapshot: JsonRecord | null,
  supported: boolean,
): AttributeAllocationPreviewRow[] {
  const valueKind = optionalText(read(entry, 'valueKind', 'value_kind')) ?? 'value';

  if (valueKind === 'damage_rows' || key === 'damage_rows') {
    const rows = read(entry, 'rows') ?? read(snapshot, 'damageRows', 'damage_rows');
    return damageRows(
      entry,
      rows,
      supported,
    );
  }

  const value = currentValue(key, entry, snapshot);
  return value === null
    ? []
    : [{
        key,
        label: optionalText(read(entry, 'label')) ?? key,
        currentDisplay: `${value}`,
        draftDisplay: null,
        deltaDisplay: null,
        tone: 'neutral',
        supported,
        currentValue: value,
        currentMin: null,
        currentMax: null,
        currentStrength: null,
        strengthVariable: null,
        descriptor: mapEntryDescriptor(entry),
        draftDependencies: draftDependencies(entry),
        draftDependencyScales: draftDependencyScales(entry),
      }];
}

function damageRows(
  entry: JsonRecord,
  value: Json | undefined,
  supported: boolean,
): AttributeAllocationPreviewRow[] {
  const rows = Array.isArray(value)
    ? value.map((rowValue, index) => [`${index}`, rowValue] as const)
    : Object.entries(jsonRecord(value) ?? {});

  return rows.flatMap(([fallbackKey, rowValue]) => {
    const row = jsonRecord(rowValue);
    if (!row) {
      return [];
    }

    const key = optionalText(read(row, 'rowKey')) ?? fallbackKey;
    const min = optionalNumber(read(row, 'currentMin'));
    const max = optionalNumber(read(row, 'currentMax'));
    const currentStrength = optionalNumber(read(row, 'currentStrength'));
    const descriptor = mapEntryDescriptor(entry)
      ?? mapDescriptor(jsonRecord(read(row, 'formulaDescriptor')));

    return key && min !== null && max !== null
      ? [{
          key,
          label: optionalText(read(row, 'label')) ?? key,
          currentDisplay: `${min}-${max}`,
          draftDisplay: null,
          deltaDisplay: null,
          tone: 'neutral',
          supported,
          currentValue: null,
          currentMin: min,
          currentMax: max,
          currentStrength,
          strengthVariable: optionalText(read(row, 'strengthVariable')),
          descriptor,
          draftDependencies: draftDependencies(entry),
          draftDependencyScales: draftDependencyScales(entry),
        }]
      : [];
  });
}

function currentValue(
  key: string,
  entry: JsonRecord,
  snapshot: JsonRecord | null,
): number | null {
  const entryValue = optionalNumber(read(entry, 'currentValue'));
  if (entryValue !== null) {
    return entryValue;
  }

  return optionalNumber(read(snapshot, currentSnapshotField(key)));
}

function currentSnapshotField(key: string): string {
  switch (key) {
    case 'health':
      return 'attributePreviewMaxHealth';
    case 'critical_chance':
      return 'criticalChanceBonus';
    case 'evasion_chance':
      return 'evasionChanceBonus';
    case 'current_health':
      return 'currentHealth';
    case 'attack_count':
      return 'attackCount';
    default:
      return key;
  }
}

function mapBaseStatInputs(
  record: JsonRecord | null,
): Record<string, AttributeAllocationBaseStatInput> {
  if (!record) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(record).flatMap(([key, value]) => {
      const row = jsonRecord(value);
      return row ? [[key, {
        currentAllocatedValue: optionalNumber(read(row, 'currentAllocatedValue')),
        currentEffectiveValue: optionalNumber(read(row, 'currentEffectiveValue')),
        additiveContextDelta: optionalNumber(read(row, 'additiveContextDelta')) ?? 0,
      } satisfies AttributeAllocationBaseStatInput]] : [];
    }),
  );
}

function mapDescriptor(record: JsonRecord | null): AttributeAllocationPreviewDescriptor | null {
  const kind = optionalText(read(record, 'kind'));
  if (!kind) {
    return null;
  }

  return {
    kind,
    input: optionalText(read(record, 'input')),
    constant: optionalNumber(read(record, 'constant')) ?? 0,
    scale: optionalNumber(read(record, 'scale')) ?? 1,
    min: optionalNumber(read(record, 'min')),
    terms: Array.isArray(read(record, 'terms'))
      ? (read(record, 'terms') as Json[]).flatMap((term) => {
          const row = jsonRecord(term);
          return row ? [mapTerm(row)] : [];
        })
      : [],
  };
}

function mapEntryDescriptor(entry: JsonRecord): AttributeAllocationPreviewDescriptor | null {
  const descriptorRecord = jsonRecord(read(entry, 'descriptor'));
  const formulaDescriptorRecord = jsonRecord(read(entry, 'formulaDescriptor'));

  if (!descriptorRecord) {
    return mapDescriptor(formulaDescriptorRecord);
  }

  if (!formulaDescriptorRecord) {
    return mapDescriptor(descriptorRecord);
  }

  return mapDescriptor({
    ...definedFields(descriptorRecord),
    ...formulaDescriptorRecord,
  });
}

function mapTerm(record: JsonRecord): AttributeAllocationPreviewTerm {
  return {
    input: optionalText(read(record, 'variable', 'input')) ?? '',
    scale: optionalNumber(read(record, 'scale')) ?? 1,
    offset: optionalNumber(read(record, 'offset')) ?? 0,
  };
}

function entryKey(entry: JsonRecord | null): string | null {
  return optionalText(read(entry, 'statKey')) ?? optionalText(read(entry, 'key'));
}

function draftDependencies(entry: JsonRecord): string[] {
  const value = read(entry, 'draftDependencies', 'draft_dependencies');
  return Array.isArray(value)
    ? value.flatMap((dependency) => {
        const text = optionalText(dependency);
        return text ? [text] : [];
      })
    : [];
}

function draftDependencyScales(entry: JsonRecord): Record<string, number> {
  const currentContext = jsonRecord(read(entry, 'currentContext'));
  return Object.fromEntries(
    draftDependencies(entry).flatMap((dependency) => {
      const scale = optionalNumber(read(
        currentContext,
        `${dependency}Multiplier`,
        `${dependency}_multiplier`,
      ));
      return scale === null ? [] : [[dependency, scale]];
    }),
  );
}

function definedFields(record: JsonRecord): JsonRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined && value !== null),
  );
}

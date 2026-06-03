import { Json } from '../../types/database.types';
import {
  definedFields,
  JsonRecord,
  jsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalNonNegativeInteger,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredInteger,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from '../../utils/json-read';
import { combatAttackSourceDisplayLabel } from '../../utils/combat-attack-labels';
import {
  AttributeAllocationCostStep,
  AttributeAllocationDraftSummary,
  AttributeAllocationModel,
  AttributeAllocationModelStatRow,
  AttributeAllocationSaveEligibility,
  AttributeAllocationBaseStatInput,
  AttributeAllocationPreviewDescriptor,
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
  AttributeAllocationPreviewTerm,
} from './attribute-allocation-preview-manifest.model';

const PREVIEW_MANIFEST_CONTRACT_VERSION = 'hero_attribute_allocation_preview_manifest_v3';
const ALLOCATION_MODEL_CONTRACT_VERSION = 'hero_attribute_allocation_model_v1';
const REQUIRED_BASE_STAT_ROW_COUNT = 9;
const CURRENT_ONLY_DERIVED_STAT_KEYS = new Set([
  'luck',
  'attack_count',
  'current_health',
]);
const SHOW_CURRENT_VALUE_POLICY = 'show_current_value_without_draft_delta';

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
    frontendEvaluationPolicy: jsonRecord(read(
      record,
      'frontendEvaluationPolicy',
      'frontend_evaluation_policy',
    )),
    baseStatInputs: mapBaseStatInputs(jsonRecord(read(record, 'baseStatInputs'))),
    rows: [...supportedRows, ...unsupportedRows],
  };
}

export function mapAttributeAllocationModel(value: Json): AttributeAllocationModel {
  const record = requiredRecord(value, 'attributeManifest.allocationModel');
  const contractVersion = requiredText(
    read(record, 'contractVersion', 'contract_version'),
    'allocationModel.contractVersion',
  );

  if (contractVersion !== ALLOCATION_MODEL_CONTRACT_VERSION) {
    throw new Error(`Attribute allocation model has unsupported contractVersion: ${contractVersion}.`);
  }

  const statRows = requiredArray(
    read(record, 'statRows', 'stat_rows'),
    'allocationModel.statRows',
  ).map((row) => mapAllocationStatRow(row));

  if (statRows.length !== REQUIRED_BASE_STAT_ROW_COUNT) {
    throw new Error(`Attribute allocation model must include ${REQUIRED_BASE_STAT_ROW_COUNT} statRows.`);
  }

  const initialDraftSummary = mapDraftSummary(
    requiredRecord(
      read(record, 'initialDraftSummary', 'initial_draft_summary'),
      'allocationModel.initialDraftSummary',
    ),
    'allocationModel.initialDraftSummary',
  );
  const saveEligibility = mapSaveEligibility(
    requiredRecord(
      read(record, 'saveEligibility', 'save_eligibility'),
      'allocationModel.saveEligibility',
    ),
    'allocationModel.saveEligibility',
  );

  return {
    contractVersion,
    statRows,
    initialDraftSummary,
    saveEligibility,
    draftEvaluationPolicy: requiredRecord(
      read(record, 'draftEvaluationPolicy', 'draft_evaluation_policy'),
      'allocationModel.draftEvaluationPolicy',
    ),
  };
}

export function isUsableAttributeAllocationPreviewManifest(
  manifest: AttributeAllocationPreviewManifest | null,
): manifest is AttributeAllocationPreviewManifest {
  return !!manifest
    && manifest.contractVersion === PREVIEW_MANIFEST_CONTRACT_VERSION
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

function mapAllocationStatRow(row: JsonRecord): AttributeAllocationModelStatRow {
  const costSteps = requiredArray(
    read(row, 'costSteps', 'cost_steps'),
    'allocationModel.statRows.costSteps',
  ).map((step) => mapAllocationCostStep(step));

  if (!costSteps.length) {
    throw new Error('Attribute allocation model statRows.costSteps must not be empty.');
  }

  return {
    statKey: requiredText(read(row, 'statKey', 'stat_key', 'key'), 'allocationModel.statRows.statKey'),
    label: requiredText(read(row, 'label'), 'allocationModel.statRows.label'),
    description: optionalText(read(row, 'description')),
    currentAllocatedValue: requiredInteger(
      read(row, 'currentAllocatedValue', 'current_allocated_value'),
      'allocationModel.statRows.currentAllocatedValue',
    ),
    currentEffectiveValue: requiredInteger(
      read(row, 'currentEffectiveValue', 'current_effective_value'),
      'allocationModel.statRows.currentEffectiveValue',
    ),
    draftValue: requiredInteger(
      read(row, 'draftValue', 'draft_value'),
      'allocationModel.statRows.draftValue',
    ),
    draftEffectiveValue: requiredInteger(
      read(row, 'draftEffectiveValue', 'draft_effective_value'),
      'allocationModel.statRows.draftEffectiveValue',
    ),
    nextLevelCost: optionalNonNegativeInteger(read(row, 'nextLevelCost', 'next_level_cost')),
    maxAllocatedValue: requiredNonNegativeInteger(
      read(row, 'maxAllocatedValue', 'max_allocated_value'),
      'allocationModel.statRows.maxAllocatedValue',
    ),
    canIncrease: requiredBoolean(
      read(row, 'canIncrease', 'can_increase'),
      'allocationModel.statRows.canIncrease',
    ),
    canDecrease: requiredBoolean(
      read(row, 'canDecrease', 'can_decrease'),
      'allocationModel.statRows.canDecrease',
    ),
    increaseBlockerReasonKey: optionalText(read(row, 'increaseBlockerReasonKey', 'increase_blocker_reason_key')),
    increaseBlockerMessage: optionalText(read(row, 'increaseBlockerMessage', 'increase_blocker_message')),
    decreaseBlockerReasonKey: optionalText(read(row, 'decreaseBlockerReasonKey', 'decrease_blocker_reason_key')),
    decreaseBlockerMessage: optionalText(read(row, 'decreaseBlockerMessage', 'decrease_blocker_message')),
    costSteps,
  };
}

function mapAllocationCostStep(step: JsonRecord): AttributeAllocationCostStep {
  return {
    sourceAllocatedValue: requiredInteger(
      read(step, 'sourceAllocatedValue', 'source_allocated_value'),
      'allocationModel.statRows.costSteps.sourceAllocatedValue',
    ),
    targetAllocatedValue: requiredInteger(
      read(step, 'targetAllocatedValue', 'target_allocated_value'),
      'allocationModel.statRows.costSteps.targetAllocatedValue',
    ),
    cost: requiredNonNegativeInteger(
      read(step, 'cost'),
      'allocationModel.statRows.costSteps.cost',
    ),
    cumulativeCostFromCurrent: requiredNonNegativeInteger(
      read(step, 'cumulativeCostFromCurrent', 'cumulative_cost_from_current'),
      'allocationModel.statRows.costSteps.cumulativeCostFromCurrent',
    ),
  };
}

function mapDraftSummary(
  record: JsonRecord,
  field: string,
): AttributeAllocationDraftSummary {
  return {
    totalDraftCost: requiredNonNegativeInteger(
      read(record, 'totalDraftCost', 'total_draft_cost'),
      `${field}.totalDraftCost`,
    ),
    remainingCharacterPoints: requiredInteger(
      read(record, 'remainingCharacterPoints', 'remaining_character_points'),
      `${field}.remainingCharacterPoints`,
    ),
    canSave: requiredBoolean(read(record, 'canSave', 'can_save'), `${field}.canSave`),
    saveBlockerReasonKey: optionalText(read(record, 'saveBlockerReasonKey', 'save_blocker_reason_key')),
    saveBlockerMessage: optionalText(read(record, 'saveBlockerMessage', 'save_blocker_message')),
  };
}

function mapSaveEligibility(
  record: JsonRecord,
  field: string,
): AttributeAllocationSaveEligibility {
  return {
    canSave: requiredBoolean(read(record, 'canSave', 'can_save'), `${field}.canSave`),
    blockerReasonKey: optionalText(read(record, 'blockerReasonKey', 'blocker_reason_key')),
    blockerMessage: optionalText(read(record, 'blockerMessage', 'blocker_message')),
  };
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
  const uiPolicy = optionalText(read(entry, 'uiPolicy', 'ui_policy'));
  const canPreviewDraft = supported && !CURRENT_ONLY_DERIVED_STAT_KEYS.has(key);

  if (!supported && uiPolicy !== SHOW_CURRENT_VALUE_POLICY) {
    return [];
  }

  if (valueKind === 'damage_rows' || key === 'damage_rows') {
    const rows = read(entry, 'rows') ?? read(snapshot, 'damageRows', 'damage_rows');
    return damageRows(
      entry,
      rows,
      canPreviewDraft,
      uiPolicy,
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
        supported: canPreviewDraft,
        currentValue: value,
        currentMin: null,
        currentMax: null,
        currentStrength: null,
        strengthVariable: null,
        uiPolicy,
        descriptor: mapEntryDescriptor(entry),
        draftDependencies: draftDependencies(entry),
        draftDependencyScales: draftDependencyScales(entry),
      }];
}

function damageRows(
  entry: JsonRecord,
  value: Json | undefined,
  supported: boolean,
  uiPolicy: string | null,
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
    const label = optionalText(read(row, 'label')) ?? key;
    const min = optionalNumber(read(row, 'currentMin'));
    const max = optionalNumber(read(row, 'currentMax'));
    const currentStrength = optionalNumber(read(row, 'currentStrength'));
    const descriptor = mapEntryDescriptor(entry)
      ?? mapDescriptor(jsonRecord(read(row, 'formulaDescriptor')));

    return key && min !== null && max !== null
      ? [{
          key,
          label: combatAttackSourceDisplayLabel(label),
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
          uiPolicy,
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

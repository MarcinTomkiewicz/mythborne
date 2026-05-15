import { optionalInteger, signedNumberLabel } from '../../utils/number';
import {
  AttributeAllocationPreviewDescriptor,
  AttributeAllocationPreviewManifest,
  AttributeAllocationPreviewRow,
} from './attribute-allocation-preview-manifest.model';
import { isUsableAttributeAllocationPreviewManifest } from './attribute-allocation-preview-manifest.mapper';

const EFFECTIVE_STAT_PREFIX = 'effectiveStats.';

export function mapAttributeAllocationPreviewRows(
  manifest: AttributeAllocationPreviewManifest | null,
  currentStats: Readonly<Record<string, number>>,
  draftStats: Readonly<Record<string, number>>,
): AttributeAllocationPreviewRow[] {
  if (!isUsableAttributeAllocationPreviewManifest(manifest)) {
    return [];
  }

  const currentEffectiveStats = effectiveStats(manifest, currentStats);
  const draftEffectiveStats = effectiveStats(manifest, draftStats);
  return manifest.rows.map((row) =>
    previewRow(row, currentEffectiveStats, draftEffectiveStats),
  );
}

function previewRow(
  row: AttributeAllocationPreviewRow,
  currentEffectiveStats: Readonly<Record<string, number>>,
  draftEffectiveStats: Readonly<Record<string, number>>,
): AttributeAllocationPreviewRow {
  if (!row.supported || row.draftDependencies.length === 0) {
    return currentOnlyRow(row);
  }

  if (row.descriptor?.kind === 'damage_rows_strength_delta_v1') {
    return damagePreviewRow(row, draftEffectiveStats);
  }

  if (
    row.currentValue === null
    || row.descriptor?.kind === 'runtime_context_constant_for_stat_allocation_v1'
  ) {
    return currentOnlyRow(row);
  }

  const draftValue = draftValueForRow(row, currentEffectiveStats, draftEffectiveStats);
  if (draftValue === null || draftValue === row.currentValue) {
    return currentOnlyRow(row);
  }

  const delta = draftValue - row.currentValue;
  return {
    ...row,
    draftDisplay: `${draftValue}`,
    deltaDisplay: `(${signedNumberLabel(delta)})`,
    tone: delta > 0 ? 'positive' : 'negative',
  };
}

function currentOnlyRow(row: AttributeAllocationPreviewRow): AttributeAllocationPreviewRow {
  return {
    ...row,
    draftDisplay: null,
    deltaDisplay: null,
    tone: 'neutral',
  };
}

function draftValueForRow(
  row: AttributeAllocationPreviewRow,
  currentEffectiveStats: Readonly<Record<string, number>>,
  draftEffectiveStats: Readonly<Record<string, number>>,
): number | null {
  if (!row.descriptor) {
    return null;
  }

  switch (row.descriptor.kind) {
    case 'allocated_plus_context_delta':
    case 'linear_stat_scaled_sum_v1':
      return scalarDependencyDraftValue(row, currentEffectiveStats, draftEffectiveStats);
    case 'max_zero_scaled_sum_v1':
      return maxZeroDraftValue(row, currentEffectiveStats, draftEffectiveStats);
    default:
      return null;
  }
}

function scalarDependencyDraftValue(
  row: AttributeAllocationPreviewRow,
  currentEffectiveStats: Readonly<Record<string, number>>,
  draftEffectiveStats: Readonly<Record<string, number>>,
): number | null {
  const descriptor = row.descriptor;

  if (!descriptor || row.currentValue === null) {
    return null;
  }

  const delta = dependencyDelta(row, currentEffectiveStats, draftEffectiveStats);
  if (delta === null) {
    return null;
  }

  return optionalInteger(Math.max(
    descriptor.min ?? 0,
    row.currentValue + delta,
  ));
}

function maxZeroDraftValue(
  row: AttributeAllocationPreviewRow,
  currentEffectiveStats: Readonly<Record<string, number>>,
  draftEffectiveStats: Readonly<Record<string, number>>,
): number | null {
  if (!row.descriptor) {
    return null;
  }

  if (row.descriptor.input || row.descriptor.terms.length) {
    return maxZeroScaledSum(row.descriptor, draftEffectiveStats);
  }

  const delta = dependencyDelta(row, currentEffectiveStats, draftEffectiveStats);
  if (delta === null || row.currentValue === null) {
    return null;
  }

  return optionalInteger(Math.max(
    0,
    row.currentValue + delta,
  ));
}

function damagePreviewRow(
  row: AttributeAllocationPreviewRow,
  draftEffectiveStats: Readonly<Record<string, number>>,
): AttributeAllocationPreviewRow {
  if (
    row.currentMin === null
    || row.currentMax === null
    || row.currentStrength === null
    || !row.strengthVariable
  ) {
    return currentOnlyRow(row);
  }

  const draftStrength = inputValue(row.strengthVariable, draftEffectiveStats);
  if (draftStrength === null) {
    return currentOnlyRow(row);
  }

  const delta = draftStrength - row.currentStrength;
  const draftMin = optionalInteger(row.currentMin + delta);
  const draftMax = optionalInteger(row.currentMax + delta);
  if (delta === 0 || draftMin === null || draftMax === null) {
    return currentOnlyRow(row);
  }

  return {
    ...row,
    draftDisplay: `${draftMin}-${draftMax}`,
    deltaDisplay: `(${signedNumberLabel(delta)})`,
    tone: delta > 0 ? 'positive' : 'negative',
  };
}

function dependencyDelta(
  row: AttributeAllocationPreviewRow,
  currentEffectiveStats: Readonly<Record<string, number>>,
  draftEffectiveStats: Readonly<Record<string, number>>,
): number | null {
  let delta = 0;
  for (const dependency of row.draftDependencies) {
    const current = currentEffectiveStats[dependency];
    const draft = draftEffectiveStats[dependency];
    if (typeof current !== 'number' || typeof draft !== 'number') {
      return null;
    }
    delta += (draft - current) * dependencyScale(row, dependency);
  }
  return delta;
}

function maxZeroScaledSum(
  descriptor: AttributeAllocationPreviewDescriptor,
  effectiveStatsValue: Readonly<Record<string, number>>,
): number | null {
  if (!descriptor.terms.length) {
    const value = inputValue(descriptor.input, effectiveStatsValue);
    return value === null
      ? null
      : optionalInteger(Math.max(0, value * descriptor.scale + descriptor.constant));
  }

  let total = descriptor.constant;
  for (const term of descriptor.terms) {
    const value = inputValue(term.input, effectiveStatsValue);
    if (value === null) {
      return null;
    }
    total += value * term.scale + term.offset;
  }

  return optionalInteger(Math.max(0, total));
}

function effectiveStats(
  manifest: AttributeAllocationPreviewManifest,
  allocatedStats: Readonly<Record<string, number>>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(manifest.baseStatInputs).flatMap(([key, input]) => {
      const allocated = allocatedStats[key] ?? input.currentAllocatedValue;
      return typeof allocated === 'number'
        ? [[key, allocated + input.additiveContextDelta]]
        : input.currentEffectiveValue === null
          ? []
          : [[key, input.currentEffectiveValue]];
    }),
  );
}

function inputValue(
  input: string | null,
  effectiveStatsValue: Readonly<Record<string, number>>,
): number | null {
  if (!input?.startsWith(EFFECTIVE_STAT_PREFIX)) {
    return null;
  }

  const key = input.slice(EFFECTIVE_STAT_PREFIX.length);
  const value = effectiveStatsValue[key];
  return typeof value === 'number' ? value : null;
}

function dependencyScale(row: AttributeAllocationPreviewRow, dependency: string): number {
  const contextScale = row.draftDependencyScales[dependency];
  if (typeof contextScale === 'number') {
    return contextScale;
  }

  const effectiveInput = `${EFFECTIVE_STAT_PREFIX}${dependency}`;
  const term = row.descriptor?.terms.find((entry) => entry.input === effectiveInput);
  if (term) {
    return term.scale;
  }

  return row.descriptor?.input === effectiveInput || !row.descriptor?.input
    ? row.descriptor?.scale ?? 1
    : 1;
}

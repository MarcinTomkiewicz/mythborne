import {
  HeroLuckBreakdownEntry,
  LuckFormulaReference,
  LuckRngSurface,
  LuckSurfaceStatus,
  TrialPowerRead,
} from '../domain/luck/luck.model';
import { Json } from '../types/database.types';
import {
  CalculateTrialPowerRpcRow,
  GetHeroLuckBreakdownRpcRow,
  GetHeroTrialPowerRpcRow,
  GetLuckLabPreviewContractsRpcRow,
  PreviewLuckInfluenceAndTrialPowerRpcRow,
} from '../types/luck-rpc.types';
import {
  booleanValue,
  jsonRecord,
  read,
  text,
} from './json-read';

type TrialPowerRow =
  | CalculateTrialPowerRpcRow
  | GetHeroTrialPowerRpcRow
  | PreviewLuckInfluenceAndTrialPowerRpcRow;

export function mapLuckRngSurface(
  row: GetLuckLabPreviewContractsRpcRow,
): LuckRngSurface {
  return {
    contractKey: row.contract_key,
    categoryKey: row.panel_key,
    label: row.label,
    description: row.description,
    helperText: row.helper_text,
    rpcName: row.rpc_name,
    rpcSignature: row.rpc_signature,
    resultType: row.result_type,
    sortOrder: row.sort_order,
    status: mapLuckSurfaceStatus(row),
    metadataJson: row.metadata_json,
  };
}

export function mapHeroLuckBreakdownEntry(
  row: GetHeroLuckBreakdownRpcRow,
): HeroLuckBreakdownEntry {
  return {
    sourceKey: row.source_key,
    sourceLabel: row.source_label,
    flatValue: row.flat_value,
    multiplier: row.multiplier,
    percentDelta: row.percent_delta,
    effectiveValue: row.effective_value,
    detailsJson: row.details_json,
  };
}

export function mapTrialPowerRead(row: TrialPowerRow): TrialPowerRead {
  const testedStatKey = 'tested_stat_key' in row ? row.tested_stat_key : null;

  return {
    heroId: 'hero_id' in row ? row.hero_id : null,
    testedStatKey,
    testedStatLabel: null,
    testedStatValue: row.tested_stat_value,
    luckValue: row.luck_value,
    luckInfluence: row.luck_influence,
    trialPower: row.trial_power,
    luckInfluenceFormula:
      'luck_influence_formula_key' in row
        ? mapFormula(row.luck_influence_formula_key, row.luck_influence_expression)
        : null,
    trialPowerFormula:
      'trial_power_formula_key' in row
        ? mapFormula(row.trial_power_formula_key, row.trial_power_expression)
        : null,
    explanation: 'explanation' in row ? row.explanation : '',
  };
}

export function withTrialPowerStatLabel(
  trialPower: TrialPowerRead,
  statLabels: Readonly<Record<string, string>>,
  fallbackStatKey: string | null = null,
): TrialPowerRead {
  const testedStatKey = trialPower.testedStatKey ?? fallbackStatKey;

  return {
    ...trialPower,
    testedStatKey,
    testedStatLabel: testedStatKey ? statLabels[testedStatKey] ?? testedStatKey : null,
  };
}

function mapLuckSurfaceStatus(
  row: GetLuckLabPreviewContractsRpcRow,
): LuckSurfaceStatus {
  const metadata = jsonRecord(row.metadata_json);

  return {
    isAvailable: row.is_available,
    isLuckAware: optionalBooleanMetadata(metadata, 'isLuckAware', 'luckAware'),
    isLuckExcluded: optionalBooleanMetadata(
      metadata,
      'isLuckExcluded',
      'luckExcluded',
    ),
    isFormulaOwned: optionalBooleanMetadata(
      metadata,
      'isFormulaOwned',
      'formulaOwned',
    ),
    isConfigOwned: optionalBooleanMetadata(metadata, 'isConfigOwned', 'configOwned'),
    isFallback: optionalBooleanMetadata(metadata, 'isFallback', 'fallback'),
    missingConfigKeys: stringArray(read(metadata, 'missingConfigKeys')),
  };
}

function mapFormula(
  formulaKey: string | null,
  formulaExpression: string | null,
): LuckFormulaReference | null {
  return formulaKey && formulaExpression
    ? { formulaKey, formulaExpression }
    : null;
}

function optionalBooleanMetadata(
  metadata: ReturnType<typeof jsonRecord>,
  ...keys: string[]
): boolean | null {
  for (const key of keys) {
    const value = read(metadata, key);

    if (typeof value === 'boolean') {
      return booleanValue(value);
    }

    if (typeof value === 'string') {
      const normalized = text(value).toLowerCase();

      if (normalized === 'true') {
        return true;
      }

      if (normalized === 'false') {
        return false;
      }
    }
  }

  return null;
}

function stringArray(value: Json | undefined): string[] {
  return Array.isArray(value)
    ? value.flatMap((entry) => (typeof entry === 'string' ? [entry] : []))
    : [];
}

import { LuckChancePreview, LuckRngSurface } from '../domain/luck/luck.model';
import { PreviewLuckInfluenceAndTrialPowerRpcRow } from '../types/luck-rpc.types';
import {
  createUnsupportedDropDistributionSummary,
  DEFAULT_LUCK_LAB_INPUT,
  mapLuckInfluencePreview,
  mapLuckLabPreviewResult,
} from './luck-lab-mappers';
import { mapTrialPowerRead } from './luck-mappers';

describe('luck-lab-mappers', () => {
  it('keeps Luck Lab input defaults explicit', () => {
    const result = mapLuckLabPreviewResult({
      input: {
        luckValue: 18,
        testedStatValue: 40,
        testedStatKey: 'wisdom',
      },
    });

    expect(result.input).toEqual({
      ...DEFAULT_LUCK_LAB_INPUT,
      luckValue: 18,
      testedStatValue: 40,
      testedStatKey: 'wisdom',
    });
  });

  it('maps raw Luck influence separately from Trial Power', () => {
    const row: PreviewLuckInfluenceAndTrialPowerRpcRow = {
      explanation: 'DB-owned Luck influence.',
      luck_influence: 6,
      luck_influence_expression: 'floor(luckValue / 3)',
      luck_influence_formula_key: 'luck_influence',
      luck_value: 18,
      tested_stat_value: 44,
      trial_power: 50,
      trial_power_expression: 'testedStatValue + luckInfluence',
      trial_power_formula_key: 'trial_power',
    };

    const luckInfluence = mapLuckInfluencePreview(row);
    const trialPower = mapTrialPowerRead(row);
    const result = mapLuckLabPreviewResult({
      luckInfluence,
      trialPower,
    });

    expect(result.luckInfluence?.luckValue).toBe(18);
    expect(result.luckInfluence?.luckInfluence).toBe(6);
    expect(result.trialPower?.testedStatValue).toBe(44);
    expect(result.trialPower?.trialPower).toBe(50);
    expect(result.comparisonRows.find((entry) => entry.key === 'luck_influence')).toEqual({
      key: 'luck_influence',
      label: 'Luck influence',
      baselineValue: 18,
      previewValue: 6,
      delta: -12,
      unit: 'points',
    });
    expect(result.comparisonRows.find((entry) => entry.key === 'trial_power')).toEqual({
      key: 'trial_power',
      label: 'Trial Power',
      baselineValue: 44,
      previewValue: 50,
      delta: 6,
      unit: 'points',
    });
  });

  it('preserves DB labels and helper text in explanation rows', () => {
    const surface: LuckRngSurface = {
      contractKey: 'preview_trial_manifestation_chance',
      categoryKey: 'trial',
      label: 'Trial manifestation',
      description: 'Chance preview from DB.',
      helperText: 'Uses DB formula metadata.',
      rpcName: 'preview_trial_manifestation_chance_rpc',
      rpcSignature: 'preview_trial_manifestation_chance(...)',
      resultType: 'rows',
      sortOrder: 10,
      status: {
        isAvailable: true,
        isLuckAware: true,
        isLuckExcluded: false,
        isFormulaOwned: true,
        isConfigOwned: true,
        isFallback: false,
        missingConfigKeys: [],
      },
      metadataJson: {
        surfaceKey: 'trial_manifestation_surface',
        aliases: ['preview_trial_manifestation_chance'],
      },
    };

    const result = mapLuckLabPreviewResult({
      surfaces: [surface],
    });

    expect(result.explanationRows[0]).toEqual({
      surfaceKey: 'preview_trial_manifestation_chance',
      lookupKeys: [
        'preview_trial_manifestation_chance',
        'preview_trial_manifestation_chance_rpc',
        'trial_manifestation_surface',
      ],
      label: 'Trial manifestation',
      description: 'Chance preview from DB.',
      helperText: 'Uses DB formula metadata.',
      status: 'available',
      reason: 'Uses DB formula metadata.',
    });
  });

  it('marks unsupported sections without inventing fallback formulas', () => {
    const chancePreview: LuckChancePreview = {
      surfaceKey: 'trial_manifestation',
      categoryKey: 'trial',
      testedStatKey: 'wisdom',
      testedStatValue: 40,
      luckValue: 12,
      luckInfluence: 4,
      trialPower: 44,
      chancePercent: 61,
      roll: null,
      resultKey: null,
      formula: {
        formulaKey: 'trial_manifestation_chance',
        formulaExpression: 'DB expression',
      },
      explanation: 'DB chance.',
      contextJson: {},
    };

    const result = mapLuckLabPreviewResult({
      chancePreviews: [chancePreview],
      dropDistribution: createUnsupportedDropDistributionSummary('Missing RPC.'),
    });

    expect(result.dropDistribution.status).toBe('unsupported');
    expect(result.dropDistribution.bucketRows).toEqual([]);
    expect(result.explanationRows).toEqual([]);
    expect(result.comparisonRows.find((entry) => entry.key === 'trial_manifestation')).toEqual({
      key: 'trial_manifestation',
      label: 'trial_manifestation',
      baselineValue: null,
      previewValue: 61,
      delta: null,
      unit: 'percent',
    });
  });
});

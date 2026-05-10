import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LuckLabDropDistributionSummary } from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabDropDistributionComparisonState } from './luck-lab-drop-distribution-comparison.state';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';

describe('LuckLabDropDistributionSectionState', () => {
  let state: LuckLabDropDistributionSectionState;
  let previews: jasmine.SpyObj<LuckLabPreviews>;

  beforeEach(() => {
    const lab = jasmine.createSpyObj<LuckLabState>('LuckLabState', ['reloadNow']);
    Object.assign(lab, {
      input: signal({
        ...DEFAULT_LUCK_LAB_INPUT,
        bucketProfileId: 'bucket-1',
        maxQualityKey: 'rare',
      }),
      result: signal({
        dropDistribution: dropDistributionSummary(),
      }),
      loadingBySection: signal({ dropDistribution: false }),
      errorsBySection: signal({ dropDistribution: null }),
    });
    previews = jasmine.createSpyObj<LuckLabPreviews>('LuckLabPreviews', [
      'previewDropDistribution',
    ]);
    previews.previewDropDistribution.and.callFake((input) =>
      of(dropDistributionSummary(input.luckValue)),
    );
    const definitions = {
      itemBucketProfiles: signal([
        {
          id: 'bucket-1',
          key: 'default-drops',
          name: 'Default drops',
        },
      ]),
      itemQualities: signal([
        {
          key: 'rare',
          label: 'Rare',
        },
      ]),
    } as unknown as Partial<ExplorationDefinitionsState>;

    TestBed.configureTestingModule({
      providers: [
        LuckLabDropDistributionComparisonState,
        LuckLabDropDistributionSectionState,
        { provide: LuckLabState, useValue: lab },
        { provide: LuckLabPreviews, useValue: previews },
        { provide: ExplorationDefinitionsState, useValue: definitions },
      ],
    });
    state = TestBed.inject(LuckLabDropDistributionSectionState);
  });

  it('exposes DB-owned drop distribution metrics and comparison rows', () => {
    expect(state.selectedBucketLabel()).toBe('Default drops (default-drops)');
    expect(state.selectedMaxQualityLabel()).toBe('Rare (rare)');
    expect(state.summary().status).toBe('available');
    expect(state.summary().sampleSize).toBe(100);
    expect(state.metricRows()[0]).toEqual({
      label: 'Average value',
      currentValue: 42,
      compareValue: 30,
      delta: 12,
      unit: 'drachma',
    });
    expect(state.metricRows()[4]).toEqual({
      label: 'Prefix hit rate',
      currentValue: 45,
      compareValue: 20,
      delta: 25,
      unit: 'percent',
    });
    expect(state.valueText(42, 'drachma')).toBe('42 drachma');
    expect(state.valueText(45, 'percent')).toBe('45%');
    expect(state.distributionLabel(state.summary().bucketRows[0])).toBe(
      'Weapon (weapon)',
    );
  });

  it('loads DB-owned drop distribution rows for Luck presets', () => {
    state.load();

    expect(previews.previewDropDistribution).toHaveBeenCalledTimes(5);
    expect(state.comparisonRows().map((row) => row.label)).toEqual([
      'Luck 0',
      'Low Luck 10',
      'Medium Luck 25',
      'High Luck 50',
      'Current Luck',
    ]);
    expect(state.comparisonRows()[3]).toEqual({
      label: 'High Luck 50',
      luckValue: 50,
      luckInfluence: 6,
      averageItemValue: 80,
      medianItemValue: 78,
      highValueRate: 60,
      prefixHitRate: 45,
      suffixHitRate: 25,
      averageDeltaFromLuckZero: 50,
    });
  });
});

function dropDistributionSummary(luckValue = 12): LuckLabDropDistributionSummary {
  const averageItemValue = luckValue === 0 ? 30 : luckValue >= 50 ? 80 : 42;

  return {
    status: 'available',
    sampleSize: 100,
    highValueThreshold: 40,
    current: {
      luckValue,
      luckInfluence: luckValue === 0 ? 0 : 6,
      averageItemValue,
      medianItemValue: averageItemValue - 2,
      minItemValue: 20,
      maxItemValue: 60,
      prefixHitRate: 45,
      suffixHitRate: 25,
      highValueRate: luckValue >= 50 ? 60 : 35,
      outstandingRate: 8,
    },
    comparison: {
      luckValue: 0,
      luckInfluence: 0,
      averageItemValue: 30,
      medianItemValue: 30,
      minItemValue: 10,
      maxItemValue: 44,
      prefixHitRate: 20,
      suffixHitRate: 10,
      highValueRate: 15,
      outstandingRate: 5,
    },
    averageDelta: averageItemValue - 30,
    averageDeltaPercent: 40,
    bucketRows: [{ key: 'weapon', label: 'Weapon', count: 60, percent: 60 }],
    qualityRows: [{ key: 'rare', label: 'Rare', count: 40, percent: 40 }],
    compareBucketRows: [{ key: 'weapon', label: 'Weapon', count: 100, percent: 100 }],
    compareQualityRows: [{ key: 'common', label: 'Common', count: 100, percent: 100 }],
    reason: 'DB distribution preview.',
    explanation: 'DB distribution preview.',
    formulaContextJson: {},
    summaryJson: {},
  };
}

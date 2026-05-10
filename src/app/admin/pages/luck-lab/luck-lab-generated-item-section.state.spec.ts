import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LuckGeneratedItemPreview } from '../../../core/domain/luck/luck.model';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabGeneratedItemSectionState } from './luck-lab-generated-item-section.state';

describe('LuckLabGeneratedItemSectionState', () => {
  let state: LuckLabGeneratedItemSectionState;

  beforeEach(() => {
    const lab = jasmine.createSpyObj<LuckLabState>('LuckLabState', ['reloadNow']);
    Object.assign(lab, {
      input: signal({
        ...DEFAULT_LUCK_LAB_INPUT,
        bucketProfileId: 'bucket-1',
        maxQualityKey: 'rare',
      }),
      result: signal({
        generatedItemPreviews: [generatedItemPreview()],
      }),
      loadingBySection: signal({ generatedItem: false }),
      errorsBySection: signal({ generatedItem: null }),
    });
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
        LuckLabGeneratedItemSectionState,
        { provide: LuckLabState, useValue: lab },
        { provide: ExplorationDefinitionsState, useValue: definitions },
      ],
    });
    state = TestBed.inject(LuckLabGeneratedItemSectionState);
  });

  it('exposes the first DB generated item preview as a single roll', () => {
    expect(state.selectedBucketLabel()).toBe('Default drops (default-drops)');
    expect(state.selectedMaxQualityLabel()).toBe('Rare (rare)');
    expect(state.preview()?.generatedName).toBe('Sharp Blade');
    expect(state.preview()?.prefixAffix?.key).toBe('sharp');
    expect(state.preview()?.suffixAffix).toBeNull();
    expect(state.budgetRows()).toEqual([
      { label: 'Rolled bucket budget', value: 100 },
      { label: 'Budget before quality multiplier', value: 80 },
      { label: 'Remaining after base', value: 60 },
      { label: 'Remaining after prefix', value: 55 },
      { label: 'Remaining after suffix', value: 50 },
    ]);
  });
});

function generatedItemPreview(): LuckGeneratedItemPreview {
  return {
    previewIndex: 1,
    bucketProfileId: 'bucket-1',
    bucketProfileKey: 'default-drops',
    bucketProfileName: 'Default drops',
    bucketIndex: 1,
    rolledBudget: 100,
    luckValue: 12,
    luckInfluence: 4,
    baseId: 'base-1',
    baseKey: 'blade',
    baseName: 'Blade',
    baseTypeKey: 'weapon',
    baseValue: 20,
    qualityKey: 'rare',
    qualityLabel: 'Rare',
    qualityMultiplier: 1.2,
    qualityBaseWeight: 10,
    qualityAdjustedWeight: 18,
    qualityRollScore: 12,
    prefixAffix: {
      affixId: 'prefix-1',
      key: 'sharp',
      name: 'Sharp',
      goldValue: 5,
      chance: 25,
      roll: 10,
    },
    suffixAffix: null,
    generatedName: 'Sharp Blade',
    drachmaValue: 30,
    budgetBeforeQualityMultiplier: 80,
    remainingBudgetAfterBase: 60,
    remainingBudgetAfterPrefix: 55,
    remainingBudgetAfterSuffix: 50,
    formulaContextJson: {},
    explanation: 'DB item generation preview.',
  };
}

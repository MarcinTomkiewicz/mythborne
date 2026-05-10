import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuckLabCombatSection } from './luck-lab-combat-section';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';
import { LuckLabDropDistributionSection } from './luck-lab-drop-distribution-section';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';
import { LuckLabGeneratedItemSection } from './luck-lab-generated-item-section';
import { LuckLabGeneratedItemSectionState } from './luck-lab-generated-item-section.state';
import { LuckLabPage } from './luck-lab-page';
import { LuckLabPageState } from './luck-lab-page.state';

describe('LuckLabPage', () => {
  let fixture: ComponentFixture<LuckLabPage>;
  let pageState: Pick<
    LuckLabPageState,
    | 'form'
    | 'load'
    | 'isLoading'
    | 'error'
    | 'difficultyOptions'
    | 'districtOptions'
    | 'statOptions'
    | 'trialOptions'
    | 'itemBucketOptions'
    | 'itemQualityOptions'
    | 'isTrialPowerLoading'
    | 'trialPowerError'
    | 'trialPower'
    | 'trialPowerEquation'
    | 'trialPowerComparisonRows'
    | 'isTrialPowerComparisonLoading'
    | 'trialPowerComparisonError'
    | 'trialOpportunityPreview'
    | 'trialManifestationPreview'
    | 'autoResolvePreview'
    | 'autoResolveContext'
    | 'encounterPreview'
    | 'encounterContext'
    | 'isTrialChanceLoading'
    | 'trialChanceError'
    | 'trialChanceComparisonRows'
    | 'isTrialChanceComparisonLoading'
    | 'trialChanceComparisonError'
    | 'autoResolveComparisonRows'
    | 'isAutoResolveComparisonLoading'
    | 'autoResolveComparisonError'
    | 'encounterComparisonRows'
    | 'isEncounterComparisonLoading'
    | 'encounterComparisonError'
    | 'selectedTrialContextLabel'
    | 'selectedTrialContextId'
    | 'lab'
  >;
  let combatSectionState: Pick<
    LuckLabCombatSectionState,
    | 'load'
    | 'preview'
    | 'rows'
    | 'valueText'
    | 'isLoading'
    | 'error'
    | 'comparisonRows'
    | 'isComparisonLoading'
    | 'comparisonError'
  >;
  let generatedItemSectionState: Pick<
    LuckLabGeneratedItemSectionState,
    | 'preview'
    | 'isLoading'
    | 'error'
    | 'selectedBucketLabel'
    | 'selectedMaxQualityLabel'
    | 'budgetRows'
  >;
  let dropDistributionSectionState: Pick<
    LuckLabDropDistributionSectionState,
    | 'summary'
    | 'isLoading'
    | 'error'
    | 'selectedBucketLabel'
    | 'selectedMaxQualityLabel'
    | 'metricRows'
    | 'valueText'
    | 'percentText'
    | 'distributionLabel'
  >;

  beforeEach(async () => {
    pageState = {
      form: new FormGroup({
        luckValue: new FormControl<number>(12, { nonNullable: true }),
        testedStatValue: new FormControl<number>(30, { nonNullable: true }),
        spiritualityValue: new FormControl<number>(4, { nonNullable: true }),
        difficultyKey: new FormControl<string | null>('easy'),
        districtCode: new FormControl<string | null>('district-a'),
        testedStatKey: new FormControl<string | null>('wisdom'),
        trialDefinitionId: new FormControl<string | null>('trial-1'),
        bucketProfileId: new FormControl<string | null>('bucket-1'),
        maxQualityKey: new FormControl<string | null>('rare'),
      }),
      load: jasmine.createSpy('load'),
      isLoading: signal(false),
      error: signal(null),
      difficultyOptions: signal([{ label: 'Easy (easy)', value: 'easy' }]),
      districtOptions: signal([{ label: 'District A (district-a)', value: 'district-a' }]),
      statOptions: signal([{ label: 'Wisdom (wisdom)', value: 'wisdom' }]),
      trialOptions: signal([{ label: 'Maze (maze)', value: 'trial-1' }]),
      itemBucketOptions: signal([
        { label: 'Default drops (default-drops)', value: 'bucket-1' },
      ]),
      itemQualityOptions: signal([{ label: 'Rare (rare)', value: 'rare' }]),
      isTrialPowerLoading: signal(false),
      trialPowerError: signal(null),
      trialPower: signal({
        heroId: null,
        testedStatKey: 'wisdom',
        testedStatLabel: 'Wisdom',
        testedStatValue: 30,
        luckValue: 12,
        luckInfluence: 4,
        trialPower: 34,
        luckInfluenceFormula: {
          formulaKey: 'luck_influence',
          formulaExpression: 'DB luck expression',
        },
        trialPowerFormula: {
          formulaKey: 'trial_power',
          formulaExpression: 'DB trial expression',
        },
        explanation: 'DB Trial Power preview.',
      }),
      trialPowerEquation: signal('30 + 4 = 34'),
      trialPowerComparisonRows: signal([
        {
          label: 'Current sliders',
          testedStatValue: 30,
          luckValue: 12,
          luckInfluence: 4,
          trialPower: 34,
        },
      ]),
      isTrialPowerComparisonLoading: signal(false),
      trialPowerComparisonError: signal(null),
      trialOpportunityPreview: signal({
        chancePercent: 18,
        luckValue: 12,
        luckInfluence: 4,
        formula: { formulaKey: 'trial_opportunity_chance' },
        explanation: 'DB opportunity preview.',
      } as never),
      trialManifestationPreview: signal({
        chancePercent: 42,
        luckValue: 12,
        luckInfluence: 4,
        trialPower: 34,
        formula: { formulaKey: 'trial_manifestation_chance' },
        explanation: 'DB manifestation preview.',
      } as never),
      autoResolvePreview: signal({
        testedStatValue: 30,
        luckValue: 12,
        luckInfluence: 4,
        trialPower: 34,
        chancePercent: 24,
        formula: { formulaKey: 'challenge_auto_resolve_success_chance' },
        explanation: 'DB auto-resolve preview.',
      } as never),
      autoResolveContext: signal({
        capPercent: 80,
        difficultyMultiplier: 1,
        manualChanceReference: 42,
        rawChance: 34,
      }),
      encounterPreview: signal({
        chancePercent: 16,
        luckValue: 12,
        luckInfluence: 4,
        formula: { formulaKey: 'non_trial_encounter_chance' },
        explanation: 'DB encounter fallback preview.',
      } as never),
      encounterContext: signal({
        baseChance: 8,
        capPercent: 80,
        rawChance: 16,
        spiritualityValue: 4,
      }),
      isTrialChanceLoading: signal(false),
      trialChanceError: signal(null),
      trialChanceComparisonRows: signal([
        {
          label: 'Current Luck',
          luckValue: 12,
          luckInfluence: 4,
          opportunityChance: 18,
          opportunityStep: 1,
          opportunityStepCap: 8,
          manifestationChance: 42,
          trialPower: 34,
        },
      ]),
      isTrialChanceComparisonLoading: signal(false),
      trialChanceComparisonError: signal(null),
      autoResolveComparisonRows: signal([
        {
          label: 'Current Luck',
          testedStatValue: 30,
          luckValue: 12,
          luckInfluence: 4,
          trialPower: 34,
          finalChance: 24,
          capPercent: 80,
          rawChance: 34,
          manualChanceReference: 42,
        },
      ]),
      isAutoResolveComparisonLoading: signal(false),
      autoResolveComparisonError: signal(null),
      encounterComparisonRows: signal([
        {
          label: 'Current Luck',
          luckValue: 12,
          luckInfluence: 4,
          baseChance: 8,
          rawChance: 16,
          finalChance: 16,
          capPercent: 80,
        },
      ]),
      isEncounterComparisonLoading: signal(false),
      encounterComparisonError: signal(null),
      selectedTrialContextLabel: signal('Maze (maze)'),
      selectedTrialContextId: signal('trial-1'),
      lab: {
        input: signal({
          luckValue: 12,
          difficultyKey: 'easy',
          districtCode: 'district-a',
          trialDefinitionId: 'trial-1',
        }),
        result: signal({
          luckInfluence: { luckInfluence: 4 },
          trialPower: { trialPower: 34 },
        }),
      } as never,
    };
    combatSectionState = {
      load: jasmine.createSpy('load'),
      preview: signal({
        attackCount: 1,
        attackIndex: 1,
        attackerCunning: 11,
        attackerDexterity: 22,
        attackerLuck: 12,
        attackerLuckInfluence: 4,
        combatantAgility: 9,
        combatantIntelligence: 8,
        critBonusFromItems: 1,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        defenderAgility: 13,
        defenderDefense: 3,
        evasionBonusFromItems: 2,
        hitGreenZone: 62,
        hitBonusFromItems: 5,
        evasionChance: 14,
        criticalChance: 11,
        criticalMultiplier: 1.5,
        initiativeScore: 20,
        rolledDamage: 18,
        finalDamage: 27,
        formulasJson: {},
        explanation: 'DB combat Luck preview.',
      }),
      rows: signal([
        {
          surfaceKey: 'hit',
          label: 'Hit chance',
          formulaTargetKey: 'combat_hit_green_zone',
          value: 62,
          unit: 'percent',
          helperText: 'Damager hit window after DB-owned combat formula context.',
        },
        {
          surfaceKey: 'critical_damage',
          label: 'Critical damage multiplier',
          formulaTargetKey: null,
          value: 1.5,
          unit: 'multiplier',
          helperText: 'DB-returned critical multiplier context.',
        },
      ]),
      valueText: (row) => row.unit === 'multiplier' ? `x${row.value}` : `${row.value}%`,
      isLoading: signal(false),
      error: signal(null),
      comparisonRows: signal([
        {
          label: 'Current Luck',
          attackerLuck: 12,
          attackerLuckInfluence: 4,
          defenderLuck: 6,
          defenderLuckInfluence: 2,
          hitGreenZone: 62,
          evasionChance: 14,
          criticalChance: 11,
          criticalMultiplier: 1.5,
          finalDamage: 27,
          initiativeScore: 20,
        },
      ]),
      isComparisonLoading: signal(false),
      comparisonError: signal(null),
    };
    generatedItemSectionState = {
      preview: signal({
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
      }),
      isLoading: signal(false),
      error: signal(null),
      selectedBucketLabel: signal('Default drops (default-drops)'),
      selectedMaxQualityLabel: signal('Rare (rare)'),
      budgetRows: signal([
        { label: 'Rolled bucket budget', value: 100 },
        { label: 'Remaining after suffix', value: 50 },
      ]),
    };
    dropDistributionSectionState = {
      summary: signal({
        status: 'available',
        sampleSize: 100,
        highValueThreshold: 40,
        current: {
          luckValue: 12,
          luckInfluence: 4,
          averageItemValue: 42,
          medianItemValue: 40,
          minItemValue: 20,
          maxItemValue: 60,
          prefixHitRate: 45,
          suffixHitRate: 25,
          highValueRate: 35,
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
        averageDelta: 12,
        averageDeltaPercent: 40,
        bucketRows: [{ key: 'weapon', label: 'Weapon', count: 60, percent: 60 }],
        qualityRows: [{ key: 'rare', label: 'Rare', count: 40, percent: 40 }],
        compareBucketRows: [
          { key: 'weapon', label: 'Weapon', count: 100, percent: 100 },
        ],
        compareQualityRows: [
          { key: 'common', label: 'Common', count: 100, percent: 100 },
        ],
        reason: 'DB distribution preview.',
        explanation: 'DB distribution preview.',
        formulaContextJson: {},
        summaryJson: {},
      }),
      isLoading: signal(false),
      error: signal(null),
      selectedBucketLabel: signal('Default drops (default-drops)'),
      selectedMaxQualityLabel: signal('Rare (rare)'),
      metricRows: signal([
        {
          label: 'Average value',
          currentValue: 42,
          compareValue: 30,
          delta: 12,
          unit: 'drachma',
        },
        {
          label: 'Prefix hit rate',
          currentValue: 45,
          compareValue: 20,
          delta: 25,
          unit: 'percent',
        },
      ]),
      valueText: (value, unit) => {
        if (value === null) {
          return 'N/A';
        }

        return unit === 'percent'
          ? `${value}%`
          : unit === 'drachma'
            ? `${value} drachma`
            : `${value}`;
      },
      percentText: (value) => value === null ? 'N/A' : `${value}%`,
      distributionLabel: (row) => `${row.label} (${row.key})`,
    };

    await TestBed.configureTestingModule({
      imports: [LuckLabPage],
    })
      .overrideComponent(LuckLabPage, {
        set: {
          providers: [{ provide: LuckLabPageState, useValue: pageState }],
        },
      })
      .overrideComponent(LuckLabCombatSection, {
        set: {
          providers: [
            { provide: LuckLabCombatSectionState, useValue: combatSectionState },
          ],
        },
      })
      .overrideComponent(LuckLabGeneratedItemSection, {
        set: {
          providers: [
            {
              provide: LuckLabGeneratedItemSectionState,
              useValue: generatedItemSectionState,
            },
          ],
        },
      })
      .overrideComponent(LuckLabDropDistributionSection, {
        set: {
          providers: [
            {
              provide: LuckLabDropDistributionSectionState,
              useValue: dropDistributionSectionState,
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LuckLabPage);
    fixture.detectChanges();
  });

  it('loads the page state on init', () => {
    expect(pageState.load).toHaveBeenCalled();
  });

  it('renders the Luck Lab shell and shared preview controls', () => {
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Luck balancing previews');
    expect(text).toContain('does not change configuration directly');
    expect(text).toContain('Luck value: 12');
    expect(text).toContain('Tested stat value: 30');
    expect(text).toContain('Spirituality value');
    expect(text).toContain('Difficulty');
    expect(text).toContain('District');
    expect(text).toContain('Trial definition');
    expect(text).toContain('Bucket profile');
    expect(text).toContain('Maximum quality');
    expect(text).toContain('Raw Luck to Trial Power');
    expect(text).toContain('30 + 4 = 34');
    expect(text).toContain('DB Trial Power preview.');
    expect(text).toContain('Current sliders');
    expect(text).toContain('Opportunity and manifestation');
    expect(text).toContain('Difficulty context');
    expect(text).toContain('district-a');
    expect(text).toContain('Maze (maze)');
    expect(text).toContain('18%');
    expect(text).toContain('42%');
    expect(text).toContain('DB opportunity preview.');
    expect(text).toContain('DB manifestation preview.');
    expect(text).toContain('Current Luck');
    expect(text).toContain('Challenge auto-resolve');
    expect(text).toContain('Success or failure');
    expect(text).toContain('DB auto-resolve preview.');
    expect(text).toContain('Manual chance reference');
    expect(text).toContain('24%');
    expect(text).toContain('Encounter fallback');
    expect(text).toContain('Non-trial encounter chance');
    expect(text).toContain('DB encounter fallback preview.');
    expect(text).toContain('nothing is the deterministic fallback outcome');
    expect(text).toContain('Encounter subtype');
    expect(text).toContain('Combat RNG');
    expect(text).toContain('Damager vs target preview');
    expect(text).toContain('DB combat Luck preview.');
    expect(text).toContain('Dexterity 22');
    expect(text).toContain('combat_hit_green_zone');
    expect(text).toContain('not exposed by current DB metadata');
    expect(text).toContain('62%');
    expect(text).toContain('x1.5');
    expect(text).toContain('Drop single roll');
    expect(text).toContain('Generated item preview');
    expect(text).toContain('does not prove that higher Luck is assured to improve one item');
    expect(text).toContain('Default drops (default-drops)');
    expect(text).toContain('Rare (rare)');
    expect(text).toContain('Sharp Blade');
    expect(text).toContain('Final value 30 drachma');
    expect(text).toContain('No suffix');
    expect(text).toContain('Remaining after suffix');
    expect(text).toContain('Drop distribution');
    expect(text).toContain('Generated item distribution preview');
    expect(text).toContain('DB-owned distribution simulation RPC');
    expect(text).toContain('Simulation workload is owned by the DB preview RPC');
    expect(text).toContain('Average value');
    expect(text).toContain('42 drachma');
    expect(text).toContain('30 drachma');
    expect(text).toContain('Prefix hit rate');
    expect(text).toContain('Weapon (weapon)');
    expect(text).toContain('Rare (rare)');
    expect(text).toContain('DB distribution preview.');
    expect(fixture.debugElement.queryAll(By.css('p-slider')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(6);
  });
});

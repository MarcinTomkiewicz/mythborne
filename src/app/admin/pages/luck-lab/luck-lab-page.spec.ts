import { WritableSignal, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { LuckLabCombatSection } from './luck-lab-combat-section';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';
import { LuckLabDropDistributionSection } from './luck-lab-drop-distribution-section';
import { LuckLabDropDistributionSectionState } from './luck-lab-drop-distribution-section.state';
import { LuckLabGeneratedItemSection } from './luck-lab-generated-item-section';
import { LuckLabGeneratedItemSectionState } from './luck-lab-generated-item-section.state';
import { LuckLabPage } from './luck-lab-page';
import { LuckLabPageState } from './luck-lab-page.state';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';

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
    | 'load'
    | 'summary'
    | 'isLoading'
    | 'error'
    | 'selectedBucketLabel'
    | 'selectedMaxQualityLabel'
    | 'metricRows'
    | 'comparisonRows'
    | 'isComparisonLoading'
    | 'comparisonError'
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
          explanationRows: [
            {
              surfaceKey: 'preview_luck_influence_and_trial_power',
              lookupKeys: ['preview_luck_influence_and_trial_power'],
              label: 'DB Trial Power surface',
              description: 'DB Trial Power surface description.',
              helperText: 'DB Trial Power helper.',
              status: 'available',
              reason: 'DB Trial Power helper.',
            },
            {
              surfaceKey: 'preview_trial_opportunity_curve',
              lookupKeys: ['preview_trial_opportunity_curve'],
              label: 'DB Opportunity surface',
              description: 'DB opportunity surface description.',
              helperText: 'DB opportunity helper.',
              status: 'available',
              reason: 'DB opportunity helper.',
            },
            {
              surfaceKey: 'preview_trial_manifestation_chance',
              lookupKeys: ['preview_trial_manifestation_chance'],
              label: 'DB Manifestation surface',
              description: 'DB manifestation surface description.',
              helperText: 'DB manifestation helper.',
              status: 'available',
              reason: 'DB manifestation helper.',
            },
            {
              surfaceKey: 'preview_challenge_auto_resolve_success_chance',
              lookupKeys: ['preview_challenge_auto_resolve_success_chance'],
              label: 'DB Auto-resolve surface',
              description: 'DB auto-resolve surface description.',
              helperText: 'DB auto-resolve helper.',
              status: 'available',
              reason: 'DB auto-resolve helper.',
            },
            {
              surfaceKey: 'preview_non_trial_encounter_chance',
              lookupKeys: ['preview_non_trial_encounter_chance'],
              label: 'DB Encounter surface',
              description: 'DB encounter surface description.',
              helperText: 'DB encounter helper.',
              status: 'available',
              reason: 'DB encounter helper.',
            },
            {
              surfaceKey: 'preview_combat_luck_formula_context',
              lookupKeys: ['preview_combat_luck_formula_context'],
              label: 'DB Combat surface',
              description: 'DB combat surface description.',
              helperText: 'DB combat helper.',
              status: 'available',
              reason: 'DB combat helper.',
            },
            {
              surfaceKey: 'preview_reward_generated_item_luck',
              lookupKeys: ['preview_reward_generated_item_luck'],
              label: 'DB Generated Item surface',
              description: 'DB generated item surface description.',
              helperText: 'DB generated item helper.',
              status: 'available',
              reason: 'DB generated item helper.',
            },
            {
              surfaceKey: 'luck_lab_drop_distribution_contract',
              lookupKeys: [
                'luck_lab_drop_distribution_contract',
                'preview_reward_generated_item_distribution_luck',
              ],
              label: 'DB Drop Distribution surface',
              description: 'DB drop distribution surface description.',
              helperText: 'DB drop distribution helper.',
              status: 'available',
              reason: 'DB drop distribution helper.',
            },
          ],
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
      load: jasmine.createSpy('load'),
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
      comparisonRows: signal([
        {
          label: 'Low Luck 10',
          luckValue: 10,
          luckInfluence: 3,
          averageItemValue: 36,
          medianItemValue: 34,
          highValueRate: 24,
          prefixHitRate: 30,
          suffixHitRate: 15,
          averageDeltaFromLuckZero: 6,
        },
      ]),
      isComparisonLoading: signal(false),
      comparisonError: signal(null),
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
      providers: [provideRouter([])],
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
            { provide: LuckLabState, useValue: pageState.lab },
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
            { provide: LuckLabState, useValue: pageState.lab },
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
            { provide: LuckLabState, useValue: pageState.lab },
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
    expect(text).toContain('Tested stat: 30');
    expect(text).toContain('Raw Luck: 12');
    expect(text).toContain('Luck influence: 4');
    expect(text).toContain('Trial Power: 34');
    expect(text).toContain('DB Trial Power surface');
    expect(text).toContain('DB Trial Power helper.');
    expect(text).toContain('luck_influence');
    expect(text).toContain('DB luck expression');
    expect(text).toContain('trial_power');
    expect(text).toContain('Formula target keys: luck_influence, trial_power');
    expect(text).toContain('DB trial expression');
    expect(text).toContain('30 + 4 = 34');
    expect(text).toContain('DB Trial Power preview.');
    expect(text).toContain('Current sliders');
    expect(text).toContain('Opportunity and manifestation');
    expect(text).toContain('DB Opportunity surface');
    expect(text).toContain('DB opportunity helper.');
    expect(text).toContain('Formula: trial_opportunity_chance');
    expect(text).toContain('Formula target keys: trial_opportunity_chance');
    expect(text).toContain('DB Manifestation surface');
    expect(text).toContain('DB manifestation helper.');
    expect(text).toContain('Formula target keys: trial_manifestation_chance');
    expect(text).toContain('Difficulty context');
    expect(text).toContain('Difficulty override: easy');
    expect(text).toContain('District override: district-a');
    expect(text).toContain('Trial definition override: Maze (maze)');
    expect(text).toContain('Trial opportunity chance: 18%');
    expect(text).toContain('Trial manifestation chance: 42%');
    expect(text).toContain('DB opportunity preview.');
    expect(text).toContain('DB manifestation preview.');
    expect(text).toContain('Current Luck');
    expect(text).toContain('Challenge auto-resolve');
    expect(text).toContain('Success or failure');
    expect(text).toContain('DB Auto-resolve surface');
    expect(text).toContain('DB auto-resolve helper.');
    expect(text).toContain('Formula: challenge_auto_resolve_success_chance');
    expect(text).toContain(
      'Formula target keys: challenge_auto_resolve_success_chance',
    );
    expect(text).toContain('DB auto-resolve preview.');
    expect(text).toContain('Manual chance reference');
    expect(text).toContain('Auto-resolve chance: 24%');
    expect(text).toContain('Encounter fallback');
    expect(text).toContain('Non-trial encounter chance');
    expect(text).toContain('DB Encounter surface');
    expect(text).toContain('DB encounter helper.');
    expect(text).toContain('Formula: non_trial_encounter_chance');
    expect(text).toContain('Formula target keys: non_trial_encounter_chance');
    expect(text).toContain('DB encounter fallback preview.');
    expect(text).toContain('Encounter chance: 16%');
    expect(text).toContain('nothing is the deterministic fallback outcome');
    expect(text).toContain('Encounter subtype');
    expect(text).toContain('Combat RNG');
    expect(text).toContain('Damager vs target preview');
    expect(text).toContain('DB Combat surface');
    expect(text).toContain('DB combat helper.');
    expect(text).toContain('Formula target keys: combat_hit_green_zone');
    expect(text).toContain('DB combat Luck preview.');
    expect(text).toContain('Dexterity: 22');
    expect(text).toContain('combat_hit_green_zone');
    expect(text).toContain('not exposed by current DB metadata');
    expect(text).toContain('Hit chance: 62%');
    expect(text).toContain('Critical damage multiplier: x1.5');
    expect(text).toContain('Drop single roll');
    expect(text).toContain('Generated item preview');
    expect(text).toContain('DB Generated Item surface');
    expect(text).toContain('DB generated item helper.');
    expect(text).toContain('does not prove that higher Luck is assured to improve one item');
    expect(text).toContain('Bucket profile override: Default drops (default-drops)');
    expect(text).toContain('Maximum quality override: Rare (rare)');
    expect(text).toContain('Generated item: Sharp Blade');
    expect(text).toContain('Final value: 30 drachma');
    expect(text).toContain('No suffix');
    expect(text).toContain('Remaining after suffix: 50');
    expect(text).toContain('Drop distribution');
    expect(text).toContain('Generated item distribution preview');
    expect(text).toContain('DB Drop Distribution surface');
    expect(text).toContain('DB drop distribution helper.');
    expect(text).toContain('DB-owned distribution simulation RPC');
    expect(text).toContain('Simulation workload is owned by the DB preview RPC');
    expect(text).toContain('Average value');
    expect(text).toContain('42 drachma');
    expect(text).toContain('30 drachma');
    expect(text).toContain('Roll count: 100');
    expect(text).toContain('Current Luck: 12');
    expect(text).toContain('Compare Luck: 0');
    expect(text).toContain('Prefix hit rate');
    expect(text).toContain('Low Luck 10');
    expect(text).toContain('36 drachma');
    expect(text).toContain('Weapon (weapon)');
    expect(text).toContain('Rare (rare)');
    expect(text).toContain('DB distribution preview.');
    expect(text).not.toContain(['Local', 'fallback'].join(' '));
    expect(text).not.toContain(['DB', 'metadata', 'gap'].join(' '));
    expect(text).not.toContain(
      ['Missing required', 'Luck Lab DB explanation metadata'].join(' '),
    );
    expect(text).toContain('Open formula governance');
    const formulaLinks = Array.from<HTMLAnchorElement>(
      fixture.nativeElement.querySelectorAll('a[href="/admin/formulas"]'),
    );

    expect(formulaLinks.length).toBeGreaterThan(0);
    expect(
      formulaLinks.every((link) => link.getAttribute('href') === '/admin/formulas'),
    ).toBeTrue();

    const bareSummaryValues = cardSummaryValues(fixture);

    expect(bareSummaryValues).not.toContain('DB default');
    expect(bareSummaryValues).not.toContain('N/A');
    expect(fixture.debugElement.queryAll(By.css('p-slider')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(6);
  });

  it('renders default and null summary values with visible field labels', () => {
    setWritableSignal(pageState.lab.input, {
      ...asRecord(pageState.lab.input()),
      difficultyKey: null,
      districtCode: null,
      trialDefinitionId: null,
      bucketProfileId: null,
      maxQualityKey: null,
    });
    setWritableSignal(pageState.selectedTrialContextLabel, 'DB default');
    setWritableSignal(pageState.selectedTrialContextId, null);
    setWritableSignal(generatedItemSectionState.selectedBucketLabel, 'DB default');
    setWritableSignal(generatedItemSectionState.selectedMaxQualityLabel, 'DB default');
    setWritableSignal(dropDistributionSectionState.selectedBucketLabel, 'DB default');
    setWritableSignal(dropDistributionSectionState.selectedMaxQualityLabel, 'DB default');
    setWritableSignal(pageState.trialOpportunityPreview, {
      ...asRecord(pageState.trialOpportunityPreview()),
      chancePercent: null,
    });
    setWritableSignal(pageState.trialManifestationPreview, {
      ...asRecord(pageState.trialManifestationPreview()),
      chancePercent: null,
    });
    setWritableSignal(pageState.autoResolvePreview, {
      ...asRecord(pageState.autoResolvePreview()),
      chancePercent: null,
    });
    setWritableSignal(pageState.encounterPreview, {
      ...asRecord(pageState.encounterPreview()),
      chancePercent: null,
    });

    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Difficulty override: DB default');
    expect(text).toContain('District override: DB default');
    expect(text).toContain('Trial definition override: DB default');
    expect(text).toContain('Bucket profile override: DB default');
    expect(text).toContain('Maximum quality override: DB default');
    expect(text).toContain('Trial opportunity chance: N/A');
    expect(text).toContain('Trial manifestation chance: N/A');
    expect(text).toContain('Auto-resolve chance: N/A');
    expect(text).toContain('Encounter chance: N/A');
    expect(cardSummaryValues(fixture)).not.toContain('DB default');
    expect(cardSummaryValues(fixture)).not.toContain('N/A');
  });
});

function cardSummaryValues(
  fixture: ComponentFixture<LuckLabPage>,
): (string | undefined)[] {
  return Array.from<Element>(
    fixture.nativeElement.querySelectorAll(
      '.mg-card strong, .mg-card span',
    ),
  ).map((element) => element.textContent?.trim());
}

function setWritableSignal<T>(target: unknown, value: T): void {
  (target as WritableSignal<T>).set(value);
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

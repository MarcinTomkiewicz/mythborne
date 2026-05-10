import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { LuckLabCombatSection } from './luck-lab-combat-section';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';
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
      }),
      load: jasmine.createSpy('load'),
      isLoading: signal(false),
      error: signal(null),
      difficultyOptions: signal([{ label: 'Easy (easy)', value: 'easy' }]),
      districtOptions: signal([{ label: 'District A (district-a)', value: 'district-a' }]),
      statOptions: signal([{ label: 'Wisdom (wisdom)', value: 'wisdom' }]),
      trialOptions: signal([{ label: 'Maze (maze)', value: 'trial-1' }]),
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
    expect(fixture.debugElement.queryAll(By.css('p-slider')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(4);
  });
});

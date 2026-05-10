import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
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
    | 'isTrialChanceLoading'
    | 'trialChanceError'
    | 'trialChanceComparisonRows'
    | 'isTrialChanceComparisonLoading'
    | 'trialChanceComparisonError'
    | 'selectedTrialContextLabel'
    | 'selectedTrialContextId'
    | 'lab'
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

    await TestBed.configureTestingModule({
      imports: [LuckLabPage],
    })
      .overrideComponent(LuckLabPage, {
        set: {
          providers: [{ provide: LuckLabPageState, useValue: pageState }],
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
    expect(fixture.debugElement.queryAll(By.css('p-slider')).length).toBe(2);
    expect(fixture.debugElement.queryAll(By.css('p-select')).length).toBe(4);
  });
});

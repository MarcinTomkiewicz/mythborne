import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabPageState } from './luck-lab-page.state';

describe('LuckLabPageState', () => {
  let lab: jasmine.SpyObj<LuckLabState>;
  let previews: jasmine.SpyObj<LuckLabPreviews>;
  let definitions: Partial<ExplorationDefinitionsState>;
  let state: LuckLabPageState;

  beforeEach(() => {
    lab = jasmine.createSpyObj<LuckLabState>('LuckLabState', [
      'reloadNow',
      'setLuckValue',
      'setTestedStatValue',
      'setSpiritualityValue',
      'setDifficultyKey',
      'setDistrictCode',
      'setTestedStatKey',
      'setTrialDefinitionId',
    ]);
    Object.assign(lab, {
      isLoading: signal(false),
      error: signal(null),
      loadingBySection: signal({ trialPower: false }),
      errorsBySection: signal({ trialPower: null }),
      input: signal(DEFAULT_LUCK_LAB_INPUT),
      result: signal({
        trialPower: {
          heroId: null,
          testedStatKey: 'wisdom',
          testedStatLabel: 'Wisdom',
          testedStatValue: 42,
          luckValue: 18,
          luckInfluence: 6,
          trialPower: 48,
          luckInfluenceFormula: {
            formulaKey: 'luck_influence',
            formulaExpression: 'DB luck expression',
          },
          trialPowerFormula: {
            formulaKey: 'trial_power',
            formulaExpression: 'DB trial expression',
          },
          explanation: 'DB Trial Power preview.',
        },
        luckInfluence: {
          luckInfluence: 6,
        },
      }),
    });
    previews = jasmine.createSpyObj<LuckLabPreviews>('LuckLabPreviews', [
      'previewTrialPower',
    ]);
    previews.previewTrialPower.and.callFake((input) =>
      of([
        {
          heroId: null,
          testedStatKey: input.testedStatKey,
          testedStatLabel: input.testedStatKey,
          testedStatValue: input.testedStatValue,
          luckValue: input.luckValue,
          luckInfluence: input.luckValue === 0 ? 0 : 6,
          trialPower: input.testedStatValue + (input.luckValue === 0 ? 0 : 6),
          luckInfluenceFormula: {
            formulaKey: 'luck_influence',
            formulaExpression: 'DB luck expression',
          },
          trialPowerFormula: {
            formulaKey: 'trial_power',
            formulaExpression: 'DB trial expression',
          },
          explanation: 'DB Trial Power preview.',
        },
      ]),
    );
    definitions = {
      loadDefinitions: jasmine.createSpy('loadDefinitions'),
      isLoadingDefinitions: signal(false),
      error: signal(null),
      difficultyOptions: signal([{ label: 'Easy (easy)', value: 'easy' }]),
      districtOptions: signal([{ label: 'District A (district-a)', value: 'district-a' }]),
      statOptions: signal([{ label: 'Wisdom (wisdom)', value: 'wisdom' }]),
      trialDefinitions: signal([
        {
          id: 'trial-1',
          key: 'maze',
          label: 'Maze',
        },
      ]),
    } as unknown as Partial<ExplorationDefinitionsState>;

    TestBed.configureTestingModule({
      providers: [
        LuckLabPageState,
        { provide: LuckLabState, useValue: lab },
        { provide: LuckLabPreviews, useValue: previews },
        { provide: ExplorationDefinitionsState, useValue: definitions },
      ],
    });
    state = TestBed.inject(LuckLabPageState);
  });

  it('loads definitions and starts the initial DB-owned preview', () => {
    state.load();

    expect(definitions.loadDefinitions).toHaveBeenCalled();
    expect(lab.reloadNow).toHaveBeenCalled();
  });

  it('initializes shared controls from the Luck Lab default input contract', () => {
    expect(state.form.controls.luckValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.luckValue,
    );
    expect(state.form.controls.testedStatValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.testedStatValue,
    );
    expect(state.form.controls.spiritualityValue.value).toBe(
      DEFAULT_LUCK_LAB_INPUT.spiritualityValue,
    );
  });

  it('wires shared controls to Luck Lab state inputs', () => {
    state.load();

    state.form.controls.luckValue.setValue(18);
    state.form.controls.testedStatValue.setValue(42);
    state.form.controls.spiritualityValue.setValue(7);
    state.form.controls.difficultyKey.setValue('easy');
    state.form.controls.districtCode.setValue('district-a');
    state.form.controls.testedStatKey.setValue('wisdom');
    state.form.controls.trialDefinitionId.setValue('trial-1');

    expect(lab.setLuckValue).toHaveBeenCalledWith(18);
    expect(lab.setTestedStatValue).toHaveBeenCalledWith(42);
    expect(lab.setSpiritualityValue).toHaveBeenCalledWith(7);
    expect(lab.setDifficultyKey).toHaveBeenCalledWith('easy');
    expect(lab.setDistrictCode).toHaveBeenCalledWith('district-a');
    expect(lab.setTestedStatKey).toHaveBeenCalledWith('wisdom');
    expect(lab.setTrialDefinitionId).toHaveBeenCalledWith('trial-1');
  });

  it('exposes DB Trial Power values for the panel without difficulty or district ingredients', () => {
    state.load();

    expect(state.trialPowerEquation()).toBe('42 + 6 = 48');
    expect(state.trialPowerComparisonRows()).toEqual([
      {
        label: 'Current sliders',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
      },
      {
        label: 'Luck 0, same stat',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
      },
      {
        label: 'Same Luck, stat +10',
        testedStatValue: 10,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 10,
      },
      {
        label: 'Same Luck, stat -10',
        testedStatValue: 0,
        luckValue: 0,
        luckInfluence: 0,
        trialPower: 0,
      },
    ]);
  });
});

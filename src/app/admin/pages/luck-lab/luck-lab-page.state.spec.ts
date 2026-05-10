import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { ExplorationDefinitionsState } from '../exploration-shared/exploration-definitions.state';
import { LuckLabPageState } from './luck-lab-page.state';

describe('LuckLabPageState', () => {
  let lab: jasmine.SpyObj<LuckLabState>;
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
    });
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
});

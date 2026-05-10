import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CombatLuckPreview } from '../../../core/domain/luck/luck.model';
import { LuckLabPreviews } from '../../../core/services/luck/luck-lab-previews';
import { LuckLabState } from '../../../core/services/luck/luck-lab.state';
import { DEFAULT_LUCK_LAB_INPUT } from '../../../core/utils/luck-lab-mappers';
import { LuckLabCombatComparisonState } from './luck-lab-combat-comparison.state';
import { LuckLabCombatSectionState } from './luck-lab-combat-section.state';

describe('LuckLabCombatSectionState', () => {
  let lab: jasmine.SpyObj<LuckLabState>;
  let previews: jasmine.SpyObj<LuckLabPreviews>;
  let state: LuckLabCombatSectionState;

  beforeEach(() => {
    lab = jasmine.createSpyObj<LuckLabState>('LuckLabState', ['reloadNow']);
    Object.assign(lab, {
      input: signal(DEFAULT_LUCK_LAB_INPUT),
      result: signal({
        combatPreview: combatPreview(),
      }),
      loadingBySection: signal({ combat: false }),
      errorsBySection: signal({ combat: null }),
    });
    previews = jasmine.createSpyObj<LuckLabPreviews>('LuckLabPreviews', [
      'previewCombat',
    ]);
    previews.previewCombat.and.callFake((input) =>
      of([combatPreview({
        attackerLuck: input.luckValue,
        attackerLuckInfluence: input.luckValue === 0 ? 0 : 6,
        hitGreenZone: input.luckValue === 0 ? 52 : input.luckValue >= 50 ? 70 : 62,
        criticalChance: input.luckValue === 0 ? 7 : input.luckValue >= 50 ? 18 : 11,
        finalDamage: input.luckValue === 0 ? 20 : input.luckValue >= 50 ? 32 : 27,
      })]),
    );

    TestBed.configureTestingModule({
      providers: [
        LuckLabCombatComparisonState,
        LuckLabCombatSectionState,
        { provide: LuckLabState, useValue: lab },
        { provide: LuckLabPreviews, useValue: previews },
      ],
    });
    state = TestBed.inject(LuckLabCombatSectionState);
  });

  it('maps combat preview rows without parsing compatibility formula metadata', () => {
    expect(state.rows().map((row) => row.surfaceKey)).toEqual([
      'hit',
      'evasion',
      'critical',
      'critical_damage',
      'final_damage',
      'initiative',
    ]);
    expect(state.rows()[0].formulaTargetKey).toBe('combat_hit_green_zone');
    expect(state.rows()[3].formulaTargetKey).toBeNull();
    expect(state.rows()[3].label).toBe('Critical damage multiplier');
    expect(state.valueText(state.rows()[0])).toBe('62%');
    expect(state.valueText(state.rows()[3])).toBe('x1.5');
  });

  it('loads DB combat comparison rows for Luck presets', () => {
    state.load();

    expect(previews.previewCombat).toHaveBeenCalledTimes(5);
    expect(state.comparisonRows()).toEqual([
      {
        label: 'Luck 0',
        attackerLuck: 0,
        attackerLuckInfluence: 0,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        hitGreenZone: 52,
        evasionChance: 14,
        criticalChance: 7,
        criticalMultiplier: 1.5,
        finalDamage: 20,
        initiativeScore: 20,
      },
      {
        label: 'Low Luck 10',
        attackerLuck: 10,
        attackerLuckInfluence: 6,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        hitGreenZone: 62,
        evasionChance: 14,
        criticalChance: 11,
        criticalMultiplier: 1.5,
        finalDamage: 27,
        initiativeScore: 20,
      },
      {
        label: 'Medium Luck 25',
        attackerLuck: 25,
        attackerLuckInfluence: 6,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        hitGreenZone: 62,
        evasionChance: 14,
        criticalChance: 11,
        criticalMultiplier: 1.5,
        finalDamage: 27,
        initiativeScore: 20,
      },
      {
        label: 'High Luck 50',
        attackerLuck: 50,
        attackerLuckInfluence: 6,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        hitGreenZone: 70,
        evasionChance: 14,
        criticalChance: 18,
        criticalMultiplier: 1.5,
        finalDamage: 32,
        initiativeScore: 20,
      },
      {
        label: 'Current Luck',
        attackerLuck: 0,
        attackerLuckInfluence: 0,
        defenderLuck: 6,
        defenderLuckInfluence: 2,
        hitGreenZone: 52,
        evasionChance: 14,
        criticalChance: 7,
        criticalMultiplier: 1.5,
        finalDamage: 20,
        initiativeScore: 20,
      },
    ]);
  });
});

function combatPreview(overrides: Partial<CombatLuckPreview> = {}): CombatLuckPreview {
  return {
    attackCount: 1,
    attackIndex: 1,
    attackerCunning: 11,
    attackerDexterity: 22,
    attackerLuck: 18,
    attackerLuckInfluence: 6,
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
    formulasJson: {
      combat_hit_green_zone: {
        targetKey: 'combat_hit_green_zone',
        targetLabel: 'Ignored local compatibility metadata',
      },
    },
    explanation: 'DB combat Luck preview.',
    ...overrides,
  };
}

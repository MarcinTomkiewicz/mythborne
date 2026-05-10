import {
  CombatLiveEventReadModel,
  CombatLiveParticipantReadModel,
  CombatTimingManifestReadModel,
} from '../../../core/domain/combat/combat-live.model';
import {
  combatEventMetaLabel,
  combatTimingManifestLabel,
  explorationCombatRequestId,
  participantHpLabel,
} from './exploration-live-combat-labels';

describe('exploration live combat labels', () => {
  it('formats participant HP and event metadata without state dependencies', () => {
    expect(participantHpLabel({
      currentHp: 12,
      maxHp: 20,
    } as CombatLiveParticipantReadModel)).toBe('12 / 20');
    expect(participantHpLabel({
      currentHp: null,
      maxHp: null,
    } as CombatLiveParticipantReadModel)).toBe('N/D / N/D');
    expect(combatEventMetaLabel({
      eventIndex: 3,
      roundNumber: 2,
      actionIndex: 1,
    } as CombatLiveEventReadModel)).toBe('#3 - runda 2 - akcja 1');
  });

  it('formats DB timing manifest detail without player-facing Luck explanation', () => {
    const label = combatTimingManifestLabel({
      label: null,
      zoneStartPercent: 35,
      zoneEndPercent: 65,
      hitChancePercent: 30,
      streakBefore: 1,
      luckRng: {
        evasionChance: 8,
        criticalChance: 12,
        explanation: 'DB timing context.',
      },
    } as CombatTimingManifestReadModel);

    expect(label).toContain('Strefa 35-65%');
    expect(label).not.toContain(`Luck${':'}`);
    expect(label).not.toContain('DB timing context.');
  });

  it('builds scoped combat request ids for DB idempotency', () => {
    expect(explorationCombatRequestId('challenge-1', 'ensure'))
      .toMatch(/^exploration-combat:ensure:challenge-1:/);
  });
});

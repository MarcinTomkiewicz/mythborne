import {
  CombatDisplayParticipant,
  CombatDisplayBadgeTone,
} from '../domain/combat/combat-display.model';
import { CombatLiveParticipantReadModel } from '../domain/combat/combat-live.model';
import {
  mapCombatParticipantBaseStatCardRows,
  mapCombatParticipantStatCardRows,
} from './combat-participant-stat-card.mapper';
import { combatParticipantPortraitFromReadModel } from './combat-participant-portrait.mapper';

export function combatLiveParticipantPair(
  participants: readonly CombatLiveParticipantReadModel[],
  activeHeroId: string | null = null,
): {
  left: CombatLiveParticipantReadModel | null;
  right: CombatLiveParticipantReadModel | null;
} {
  const left = participants.find((participant) =>
    activeHeroId ? participant.heroId === activeHeroId : false,
  ) ??
    participants.find((participant) => participant.isPlayerControlled) ??
    participants[0] ??
    null;
  const right = participants.find((participant) => participant !== left) ?? null;

  return { left, right };
}

export function combatLiveParticipantCard(input: {
  participant: CombatLiveParticipantReadModel;
  badgeLabel: string | null;
  badgeTone: Extract<CombatDisplayBadgeTone, 'success' | 'danger'>;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
}): CombatDisplayParticipant {
  return {
    id: participantUiKey(input.participant) ?? input.participant.displayName,
    displayName: input.participant.displayName,
    kindLabel: null,
    metaLabel: participantMeta(input.participant),
    badgeLabel: input.badgeLabel,
    badgeTone: input.badgeTone,
    avatarTone: input.badgeTone === 'danger' ? 'danger' : 'heading',
    portrait: combatParticipantPortraitFromReadModel(input.participant, {
      activeHeroId: input.activeHeroId ?? null,
      activeHeroPortraitSrc: input.activeHeroPortraitSrc ?? null,
    }),
    hpCurrent: input.participant.currentHp,
    hpMax: input.participant.maxHp,
    baseStatRows: mapCombatParticipantBaseStatCardRows(input.participant.baseStatRows ?? []),
    combatStatRows: mapCombatParticipantStatCardRows(input.participant.combatStatRows ?? []),
    emptyStatsMessage: null,
    side: input.participant.side,
  };
}

function participantMeta(participant: CombatLiveParticipantReadModel): string {
  return participant.statusLabel ?? '';
}

function participantUiKey(participant: CombatLiveParticipantReadModel): string | null {
  return participant.previewParticipantKey ??
    participant.participantKey ??
    participant.side ??
    participant.participantId;
}

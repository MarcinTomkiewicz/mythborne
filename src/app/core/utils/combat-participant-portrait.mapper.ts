import { CombatDisplayParticipant } from '../domain/combat/combat-display.model';
import { CombatLiveParticipantReadModel } from '../domain/combat/combat-live.model';
import { JsonRecord, jsonRecord, optionalText, read } from './json-read';

const PVE_OPPONENT_PORTRAIT_SRC = '/images/warrior.png';

export function combatParticipantPortraitFromReadModel(
  participant: CombatLiveParticipantReadModel,
  context: {
    activeHeroId?: string | null;
    activeHeroPortraitSrc?: string | null;
  } = {},
): CombatDisplayParticipant['portrait'] {
  return combatParticipantPortraitFromJson({
    record: jsonRecord(participant.rawJson),
    displayName: participant.displayName,
    participantKind: participant.participantKind ?? null,
    heroId: participant.heroId,
    opponentDefinitionId: participant.opponentDefinitionId,
    activeHeroId: context.activeHeroId ?? null,
    activeHeroPortraitSrc: context.activeHeroPortraitSrc ?? null,
  });
}

export function combatParticipantPortraitFromJson(input: {
  record: JsonRecord | null;
  displayName: string;
  participantKind: string | null;
  heroId?: string | null;
  opponentDefinitionId: string | null;
  activeHeroId?: string | null;
  activeHeroPortraitSrc?: string | null;
}): CombatDisplayParticipant['portrait'] {
  const src = participantPortraitSrc(input.record);

  if (src) {
    return {
      src,
      alt: input.displayName,
    };
  }

  if (
    input.activeHeroPortraitSrc &&
    isActiveHeroParticipant(input.heroId ?? null, input.activeHeroId ?? null)
  ) {
    return {
      src: input.activeHeroPortraitSrc,
      alt: input.displayName,
    };
  }

  return isPveOpponent(input.participantKind, input.opponentDefinitionId)
    ? {
        src: PVE_OPPONENT_PORTRAIT_SRC,
        alt: input.displayName,
      }
    : null;
}

function participantPortraitSrc(record: JsonRecord | null): string | null {
  const explicitSrc = optionalText(read(
    record,
    'portraitSrc',
    'portrait_src',
    'imageUrl',
    'image_url',
    'profilePicture',
    'profile_picture',
  ));

  if (explicitSrc) {
    return explicitSrc;
  }

  return null;
}

function isPveOpponent(
  participantKind: string | null,
  opponentDefinitionId: string | null,
): boolean {
  const kind = participantKind?.trim().toLowerCase();

  return Boolean(opponentDefinitionId) ||
    kind === 'opponent' ||
    kind === 'enemy' ||
    kind === 'npc';
}

function isActiveHeroParticipant(
  heroId: string | null,
  activeHeroId: string | null,
): boolean {
  return Boolean(activeHeroId) && heroId === activeHeroId;
}

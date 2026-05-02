import type { Database } from '../../types/database.types';

type CombatEnums = Database['public']['Enums'];

export const COMBAT_SIDE = {
  initiator: 'initiator',
  defender: 'defender',
} as const satisfies Record<string, CombatEnums['combat_side']>;

export const COMBAT_OUTCOME = {
  initiatorVictory: 'initiator_victory',
  defenderVictory: 'defender_victory',
  draw: 'draw',
} as const satisfies Record<string, CombatEnums['combat_outcome']>;

export const COMBAT_PARTICIPANT_KIND = {
  hero: 'hero',
  opponent: 'opponent',
} as const satisfies Record<string, CombatEnums['combat_participant_kind']>;

export const COMBAT_SOURCE_TYPE = {
  encounter: 'encounter',
  trial: 'trial',
  pvp: 'pvp',
  sandbox: 'sandbox',
  adminTest: 'admin_test',
} as const satisfies Record<string, CombatEnums['combat_source_type']>;

export const COMBAT_ATTACK_SOURCE_KIND = {
  natural: 'natural',
  unarmed: 'unarmed',
  playerItem: 'player_item',
  opponentManual: 'opponent_manual',
  opponentGenerated: 'opponent_generated',
} as const satisfies Record<string, CombatEnums['combat_attack_source_kind']>;

export type CombatSide = CombatEnums['combat_side'];
export type CombatOutcome = CombatEnums['combat_outcome'];
export type CombatParticipantKind = CombatEnums['combat_participant_kind'];
export type CombatSourceType = CombatEnums['combat_source_type'];
export type CombatAttackSourceKind = CombatEnums['combat_attack_source_kind'];

export interface CombatSourceRef {
  sourceType: CombatSourceType;
  sourceEntityId: string | null;
  serverId: string;
  startedAt: string | null;
  completedAt: string;
}

export interface CombatantReference {
  participantKind: CombatParticipantKind;
  heroId: string | null;
  opponentDefinitionId: string | null;
}

export interface CombatCoreStatsSnapshot {
  maxHealth: number;
  defense: number;
  minDamage: number;
  maxDamage: number;
  luck: number;
  criticalChance: number;
  criticalDamage: number;
  evasionChance: number;
}

export interface CombatParticipantInput {
  side: CombatSide;
  displayName: string;
  level: number;
  reference: CombatantReference;
  stats: CombatCoreStatsSnapshot;
  baseStats: readonly CombatParticipantStatSnapshot[];
  attackPlan: CombatAttackPlan;
}

export interface CombatParticipantSnapshot {
  side: CombatSide;
  displayName: string;
  level: number;
  reference: CombatantReference;
  stats: CombatCoreStatsSnapshot;
  healthStart: number;
  healthEnd: number;
}

export interface CombatParticipantStatSnapshot {
  side: CombatSide;
  statKey: string;
  statValue: number;
}

export interface CombatAttackSourceSnapshot {
  kind: CombatAttackSourceKind;
  label: string;
  opponentAttackSourceId: string | null;
  sourceItemId: string | null;
  sourceBaseId: string | null;
  sourceQualityKey: string | null;
  sourcePrefixAffixId: string | null;
  sourceSuffixAffixId: string | null;
}

export interface CombatAttackSlot {
  side: CombatSide;
  slotIndex: number;
  initiativeScore: number;
  source: CombatAttackSourceSnapshot;
}

export interface CombatAttackPlan {
  side: CombatSide;
  slots: readonly CombatAttackSlot[];
}

export interface CombatAttackEvent {
  turnNumber: number;
  attackOrder: number;
  attackSlotIndex: number;
  actorSide: CombatSide;
  targetSide: CombatSide;
  source: CombatAttackSourceSnapshot;
  timingHit: boolean | null;
  evaded: boolean;
  critical: boolean;
  rolledDamage: number | null;
  criticalDamage: number | null;
  finalDamage: number;
  targetHealthBefore: number;
  targetHealthAfter: number;
  displayText: string;
}

export interface CombatResolutionResult {
  source: CombatSourceRef;
  outcome: CombatOutcome;
  winnerSide: CombatSide | null;
  loserSide: CombatSide | null;
  turnsCompleted: number;
  initiatorHeroId: string | null;
  defenderHeroId: string | null;
  participants: readonly CombatParticipantSnapshot[];
  participantStats: readonly CombatParticipantStatSnapshot[];
  attacks: readonly CombatAttackEvent[];
}

export function combatOutcomeSides(
  outcome: CombatOutcome,
): Pick<CombatResolutionResult, 'winnerSide' | 'loserSide'> {
  switch (outcome) {
    case COMBAT_OUTCOME.initiatorVictory:
      return { winnerSide: COMBAT_SIDE.initiator, loserSide: COMBAT_SIDE.defender };
    case COMBAT_OUTCOME.defenderVictory:
      return { winnerSide: COMBAT_SIDE.defender, loserSide: COMBAT_SIDE.initiator };
    case COMBAT_OUTCOME.draw:
      return { winnerSide: null, loserSide: null };
  }
}

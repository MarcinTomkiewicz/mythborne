import { Json } from '../../types/database.types';

export interface CombatLiveStateReadModel {
  sessionId: string;
  serverId: string;
  sourceType: string;
  sourceEntityType: string;
  sourceEntityId: string;
  statusKey: string;
  statusLabel: string;
  currentRoundNumber: number;
  currentActionIndex: number;
  currentActorParticipantId: string | null;
  awaitingPlayerAction: boolean;
  currentTimingManifest: CombatTimingManifestReadModel | null;
  participants: CombatLiveParticipantReadModel[];
  events: CombatLiveEventReadModel[];
  finalCombatResultId: string | null;
  eventCount: number;
  updatedAt: string;
  rawJson: Json;
}

export interface CombatTimingManifestReadModel {
  manifestId: string;
  actorParticipantId: string;
  targetParticipantId: string;
  greenZonePercent: number;
  hitChancePercent: number | null;
  speedMultiplier: number;
  streakBefore: number | null;
  roundNumber: number | null;
  actionIndex: number | null;
  attackIndex: number | null;
  requiresManualInput: boolean;
  isPlayerControlled: boolean;
  zoneStartPercent: number;
  zoneEndPercent: number;
  zoneWidthPercent: number;
  speed: number;
  label: string | null;
  rawJson: Json;
}

export interface CombatLiveParticipantReadModel {
  participantId: string;
  side: string | null;
  displayName: string;
  statusKey: string | null;
  statusLabel: string | null;
  currentHp: number | null;
  maxHp: number | null;
  heroId: string | null;
  opponentDefinitionId: string | null;
  rawJson: Json;
}

export interface CombatLiveEventReadModel {
  eventIndex: number;
  eventKind: string;
  label: string;
  actorParticipantId: string | null;
  targetParticipantId: string | null;
  roundNumber: number | null;
  actionIndex: number | null;
  happenedAt: string | null;
  details: string[];
  rawJson: Json;
}

export interface CombatResultDetailReadModel {
  combatResultId: string;
  outcome: string;
  winnerSide: string | null;
  loserSide: string | null;
  turnsCompleted: number;
  startedAt: string;
  completedAt: string;
  participants: Json;
  attacks: Json;
  rawJson: Json;
}

export interface CombatTimingInput {
  positionPercent: number;
}

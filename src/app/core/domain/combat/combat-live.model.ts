import { Json } from '../../types/database.types';
import type {
  PvpCombatContextPresentation,
  PvpCombatParticipantEffect,
} from '../pvp/pvp-combat-context.model';
import type { CombatDisplayValueTone } from './combat-display.model';
import type { StatTone } from '../../utils/stat-tone-class';

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

export interface CombatResolutionPreviewReadModel {
  previewStatus: string;
  decisionRequired: boolean;
  canStartManual: boolean;
  canAutoResolve: boolean;
  combatSessionId: string | null;
  sourceType: string;
  sourceEntityType: string;
  sourceEntityId: string;
  participants: CombatLiveParticipantReadModel[];
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
  label: string | null;
  pvpCombatContext: PvpCombatContextPresentation | null;
  luckRng: CombatLuckRngReadModel | null;
  rawJson: Json;
}

export interface CombatLuckRngReadModel {
  attackerLuck: number | null;
  attackerLuckInfluence: number | null;
  defenderLuck: number | null;
  defenderLuckInfluence: number | null;
  hitGreenZone: number | null;
  hitChance: number | null;
  evasionChance: number | null;
  criticalChance: number | null;
  criticalMultiplier: number | null;
  criticalDamage: number | null;
  finalDamage: number | null;
  formulaContextJson: Json;
  explanation: string | null;
  rawJson: Json;
}

export interface CombatLiveParticipantReadModel {
  participantId: string | null;
  previewParticipantKey?: string;
  participantKey?: string | null;
  participantKind?: string | null;
  isPlayerControlled: boolean;
  side: string | null;
  displayName: string;
  statusKey: string | null;
  statusLabel: string | null;
  currentHp: number | null;
  maxHp: number | null;
  baseStatRows: CombatLiveParticipantStatRow[];
  combatStatRows: CombatLiveParticipantStatRow[];
  participantEffects: PvpCombatParticipantEffect[];
  heroId: string | null;
  opponentDefinitionId: string | null;
  rawJson: Json;
}

export interface CombatLiveParticipantStatRow {
  key: string;
  label: string;
  value: string | number;
  displayValue: string;
  sortOrder: number;
  kind: string;
  tone: StatTone;
  colorableFinalValue: boolean;
  maxValue: number | null;
  unit: string | null;
}

export interface CombatLiveEventReadModel {
  eventIndex: number;
  eventKind: string;
  label: string;
  actionText: string | null;
  actionSegments: CombatLogActionSegmentReadModel[];
  resultRows: CombatLogResultRowReadModel[];
  secondaryLogRows: CombatLogSecondaryRowReadModel[];
  eventLabel: string | null;
  detailText: string | null;
  displayText: string | null;
  damageDisplay: string | null;
  resultDisplay: string | null;
  healingDisplay: string | null;
  attackSourceLabel: string | null;
  presentationKind: string | null;
  tone: CombatDisplayValueTone | null;
  timingHit: boolean | null;
  evaded: boolean | null;
  critical: boolean | null;
  actorDisplayName: string | null;
  targetDisplayName: string | null;
  actorParticipantId: string | null;
  targetParticipantId: string | null;
  roundNumber: number | null;
  actionIndex: number | null;
  roundLabel: string | null;
  turnLabel: string | null;
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

export interface CombatLogActionSegmentReadModel {
  kind: string | null;
  text: string;
  tone: CombatDisplayValueTone | null;
}

export interface CombatLogResultRowReadModel {
  text: string;
  tone: CombatDisplayValueTone | null;
}

export interface CombatLogSecondaryRowReadModel {
  id: string | null;
  actorDisplayName: string | null;
  actionText: string | null;
  actionSegments: CombatLogActionSegmentReadModel[];
  resultRows: CombatLogResultRowReadModel[];
  eventLabel: string | null;
  detailText: string | null;
  displayText: string | null;
  damageDisplay: string | null;
  resultDisplay: string | null;
  healingDisplay: string | null;
  attackSourceLabel: string | null;
  presentationKind: string | null;
  tone: CombatDisplayValueTone | null;
  details: string[];
}

export interface CombatAutoResolveResultReadModel {
  sourceEntityId: string;
  combatResultId: string;
  sourceResultId: string | null;
  gameReportId: string;
  rewardGrantId: string | null;
}

export interface CombatTimingInput {
  positionPercent: number;
}

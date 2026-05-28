import { Json } from '../../types/database.types';
import {
  PvpActionKindKey,
  PvpActionStatusKey,
  PvpAttackOutcomeKey,
  PvpCombatOutcome,
} from '../../types/pvp-rpc.types';

export interface PvpDictionaryEntry {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  adminDescription: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface PvpActionKindEntry extends PvpDictionaryEntry {
  createsCombat: boolean;
  createsRuntimeActivity: boolean;
  createsSpyResult: boolean;
  isTravelAction: boolean;
}

export interface PvpActionStatusEntry extends PvpDictionaryEntry {
  isBlocking: boolean;
  isTerminal: boolean;
}

export type PvpAttackOutcomeEntry = PvpDictionaryEntry;

export interface PvpTargetAddressSummary {
  estateId: string;
  districtCode: string;
  address: string;
  addressNumber: number;
  estateRank: number;
}

export interface PvpTargetCandidate {
  targetHeroId: string;
  targetDisplayName: string;
  targetLevel: number;
  targetGuildId?: string | null;
  targetGuildName?: string | null;
  targetGuildTag?: string | null;
  targetGuildDisplayLabel?: string | null;
  targetAddress: PvpTargetAddressSummary;
  distanceScore: number;
  underProtection: boolean;
  protectionExpiresAt: string | null;
  attackEligibility: PvpAttackEligibility;
  spyEligibility: PvpActionEligibility;
}

export interface HeroPvpDailyAttackState {
  heroId: string;
  serverId: string;
  actionDate: string;
  actionKind: string;
  usedDailyAttacks: number;
  remainingDailyAttacks: number;
  dailyAttackLimit: number;
  extraDailyAttacks: number;
  canStartAttack: boolean;
  attackerHasBlockingActivity: boolean;
  counterExists: boolean;
  generatedAt: string;
}

export interface PvpActionEligibility {
  canStart: boolean;
  blockReason: string | null;
  travelTimeSeconds: number;
}

export interface PvpAttackEligibility extends PvpActionEligibility {
  minTargetLevel: number;
  maxTargetLevel: number;
  attackerHasBlockingActivity: boolean;
}

export interface PvpActionStartResult {
  pvpActionId: string;
  runtimeActivityId: string | null;
  serverId: string;
  actionKind: PvpActionKindKey;
  status: PvpActionStatusKey;
  attackerHeroId: string;
  attackerEstateId: string | null;
  targetHeroId: string;
  targetEstateId: string | null;
  startedAt: string;
  arrivesAt: string;
  travelTimeSeconds: number;
  attackTravelTimeSeconds: number;
  spyTravelTimeSeconds: number;
  distanceScore: number;
  manualFightWindowSeconds: number | null;
  manualDeadlineAt: string | null;
  targetProtectionId: string | null;
  targetProtectionSeconds: number | null;
}

export interface HeroActiveRuntimeActivity {
  activityId: string;
  heroId: string;
  serverId: string;
  activityKind: string;
  activityKindLabel: string;
  status: string;
  statusLabel: string;
  sourceEntityType: string | null;
  sourceEntityId: string | null;
  startedAt: string;
  availableAt: string | null;
  expiresAt: string | null;
  endedAt: string | null;
  reason: string | null;
  requestId: string | null;
  metadataJson: Json;
}

export interface PvpRuntimeActivitySummary {
  pvpActionId: string;
  runtimeActivityId: string | null;
  actionKind: PvpActionKindKey;
  status: PvpActionStatusKey;
  targetHeroId: string;
  targetLevelSnapshot: number;
  targetAddress: PvpTargetActionAddressSnapshot;
  startedAt: string;
  arrivesAt: string;
  resolvedAt: string | null;
  travelTimeSeconds: number;
  manualDeadlineAt: string | null;
}

export interface PvpTargetActionAddressSnapshot {
  estateId: string | null;
  districtCode: string | null;
  addressNumber: number | null;
}

export interface PvpSpyResult {
  spyResultId: string;
  pvpActionId: string;
  serverId: string;
  createdAt: string;
  spyHeroId: string;
  spyLevelSnapshot: number;
  targetHeroId: string;
  targetDisplayName: string;
  targetLevelSnapshot: number;
  targetAddress: string | null;
  visibilityKey: string;
  resultSummary: string | null;
  snapshots: PvpSpyResultSnapshots;
}

export interface PvpSpyResultSnapshots {
  estate: Json;
  buildings: Json;
  resources: Json;
  equipment: Json;
  baseStats: Json;
  derivedCombatStats: Json;
}

export interface PvpAttackResult {
  attackResultId: string;
  pvpActionId: string;
  serverId: string;
  createdAt: string;
  attacker: PvpCombatantSnapshot;
  defender: PvpCombatantSnapshot;
  combatResultId: string;
  combatOutcome: PvpCombatOutcome;
  outcomeKey: PvpAttackOutcomeKey;
  outcomeLabel: string;
  winnerHeroId: string | null;
  loserHeroId: string | null;
  levelDifference: number;
  resourceOutcome: PvpResourceOutcomeSummary;
  rewardContext: PvpRewardContextSummary;
  prestigeContext: Json;
  reportContext: PvpReportContext;
  notificationContext: PvpNotificationRouteContext;
}

export interface PvpCombatantSnapshot {
  heroId: string;
  levelSnapshot: number;
}

export interface PvpResourceOutcomeSummary {
  raw: Json;
}

export interface PvpRewardContextSummary {
  raw: Json;
}

export interface PvpReportContext {
  raw: Json;
}

export interface PvpNotificationRouteContext {
  raw: Json;
}

export interface AdminPvpRuntimeActivitySummary extends PvpRuntimeActivitySummary {
  serverId: string;
  attackerHeroId: string;
  attackerLevelSnapshot: number;
  attackerAddress: PvpTargetActionAddressSnapshot;
  attackTravelTimeSeconds: number;
  spyTravelTimeSeconds: number;
  targetProtectionId: string | null;
  targetProtectionSeconds: number | null;
  reason: string | null;
  requestId: string | null;
  metadataJson: Json;
}

export interface AdminPvpSpyResult extends PvpSpyResult {
  metadataJson: Json;
  targetEstateId: string | null;
}

export interface AdminPvpAttackResult extends PvpAttackResult {
  metadataJson: Json;
  attackerEstateId: string | null;
  defenderEstateId: string | null;
}

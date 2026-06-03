import {
  PvpActionKindKey,
  PvpActionStatusKey,
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

export interface PvpSpySettlementResult {
  pvpActionId: string;
  pvpSpyResultId: string | null;
  runtimeActivityId: string | null;
  status: string;
  settledAsOf: string;
}

export interface PvpSpyGameReportResult {
  gameReportId: string;
  pvpSpyResultId: string;
  createdNewReport: boolean;
  participantsCreated: number;
  accessRowsTouched: number;
}

export interface ActivePvpActionOffer {
  pvpActionId: string;
  runtimeActivityId: string | null;
  serverId: string;
  actionKind: PvpActionKindKey;
  actionKindLabel: string;
  phase: string;
  phaseLabel: string;
  statusLabel: string;
  rawStatus: string | null;
  attackerHeroId: string | null;
  attackerName: string | null;
  defenderHeroId: string | null;
  defenderName: string | null;
  targetHeroId: string | null;
  targetHeroDisplayName: string | null;
  targetAddressLabel: string | null;
  targetDistrictCode: string | null;
  targetAddressNumber: number | null;
  attackerAddressLabel: string | null;
  startedAt: string;
  arrivesAt: string | null;
  availableAt: string | null;
  expiresAt: string | null;
  resolvedAt: string | null;
  phaseStartedAt: string | null;
  phaseEndsAt: string | null;
  returnStartedAt: string | null;
  returnAvailableAt: string | null;
  manualDeadlineAt: string | null;
  remainingSeconds: number | null;
  secondsUntilArrival: number | null;
  secondsUntilExpiry: number | null;
  secondsUntilManualDeadline: number | null;
  isBlockingRuntimeActivity: boolean;
  isTravelPhase: boolean;
  isManualWindow: boolean;
  isResolved: boolean;
  viewerRole: string | null;
  viewerIsAttacker: boolean;
  viewerIsTarget: boolean;
  pvpSpyResultId: string | null;
  pvpAttackResultId: string | null;
  combatLiveSessionId: string | null;
  combatResultId: string | null;
}

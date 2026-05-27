import {
  GameReportAccessRole,
  GameReportItemSourceKind,
  GameReportSourceEntityType,
} from '../../types/game-report-rpc.types';
import { Json } from '../../types/database.types';

export interface GameReportTypeEntry {
  key: string;
  label: string;
  description: string;
  helperText: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface GameReportReadState {
  accessRole: GameReportAccessRole;
  readAt: string | null;
  isUnread: boolean;
}

export interface GameReportParticipant {
  displayName: string;
  participantRole: string;
  sideLabel: string | null;
  levelSnapshot: number | null;
  sortOrder: number;
}

export interface GameReportItemReference {
  sourceKind: GameReportItemSourceKind;
  sourceItemId: string | null;
  displayName: string;
  qualityKey: string | null;
  baseId: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  displayDetails: string[];
  sortOrder: number;
}

export interface PublicGameReportItemReference {
  sourceKind: GameReportItemSourceKind;
  displayName: string;
  qualityKey: string | null;
  displayDetails: string[];
  sortOrder: number;
}

export interface GameReportCombatParticipant {
  side: string;
  participantKind: string;
  displayName: string;
  level: number | null;
  healthStart: number | null;
  healthEnd: number | null;
  maxHealth: number | null;
  defense: number | null;
  minDamage: number | null;
  maxDamage: number | null;
  luck: number | null;
  criticalChance: number | null;
  criticalDamage: number | null;
  evasionChance: number | null;
  stats: GameReportCombatParticipantStat[];
}

export interface GameReportCombatParticipantStat {
  statKey: string;
  statValue: number;
}

export interface GameReportCombatAttack {
  turnNumber: number;
  attackOrder: number;
  actorSide: string;
  targetSide: string;
  sourceKind: string | null;
  sourceLabel: string | null;
  timingHit: boolean | null;
  evaded: boolean;
  critical: boolean;
  criticalDamage: number | null;
  rolledDamage: number | null;
  finalDamage: number;
  targetHealthBefore: number | null;
  targetHealthAfter: number | null;
  displayText: string;
}

export interface GameReportCombatSection {
  sourceType: string | null;
  outcome: string;
  winnerSide: string | null;
  loserSide: string | null;
  turnsCompleted: number | null;
  startedAt: string | null;
  completedAt: string | null;
  participants: GameReportCombatParticipant[];
  attacks: GameReportCombatAttack[];
}

export interface GameReportContextualReadiness {
  reportTypeKey: string;
  title: string;
  producerStatus: string;
  expectedSections: string[];
}

export interface GameReportSectionFact {
  label: string;
  value: string;
}

export interface GameReportSectionItem {
  label: string;
  value: string | null;
  details: string[];
}

export interface GameReportRelatedReport {
  reportId: string | null;
  publicToken: string | null;
  reportTypeKey: string | null;
  reportTypeLabel: string | null;
  title: string;
  summary: string | null;
  relationLabel: string | null;
}

export interface GameReportContextSection {
  sectionKind: 'trial' | 'encounter' | 'reward' | 'effect';
  title: string;
  summary: string | null;
  badge: string | null;
  facts: GameReportSectionFact[];
  items: GameReportSectionItem[];
}

export interface PrivateGameReportListItem {
  reportId: string;
  publicToken: string;
  reportTypeKey: string;
  reportTypeLabel: string;
  title: string;
  summary: string | null;
  sourceEntityType: GameReportSourceEntityType;
  sourceEntityId: string;
  createdAt: string;
  readState: GameReportReadState;
  participants: GameReportParticipant[];
  itemReferencesCount: number;
}

export interface GameReportServerFilters {
  reportTypeKey: string | null;
  unreadOnly: boolean;
  limit: number;
  offset: number;
}

export interface DeleteGameReportResult {
  reportId: string;
  heroId: string;
  publicToken: string;
  removedAccess: boolean;
  deletedReport: boolean;
  remainingAccessCount: number;
  auditLogId: string;
}

export interface MarkGameReportReadResult {
  reportId: string;
  heroId: string;
  accessRole: GameReportAccessRole;
  readAt: string | null;
}

export interface CreateCombatGameReportInput {
  combatResultId: string;
  ownerHeroId?: string | null;
  reason?: string | null;
  requestId?: string | null;
}

export interface CreatedCombatGameReport {
  reportId: string;
  reportTypeKey: string;
  publicToken: string;
  combatResultId: string;
  serverId: string;
  participantsCreated: number;
  accessRowsCreated: number;
  auditLogId: string | null;
}

export interface AttachRewardDropItemToReportInput {
  reportId: string;
  itemId: string;
  sortOrder?: number | null;
  reason?: string | null;
  requestId?: string | null;
}

export interface AttachedRewardDropItemReference {
  reportId: string;
  itemReferenceId: string;
  sourceItemId: string;
  displayName: string;
  qualityKey: string;
  sortOrder: number;
  auditLogId: string;
}

export interface PrivateGameReportDetail extends Omit<
  PrivateGameReportListItem,
  'itemReferencesCount'
> {
  reportTypeDescription: string;
  sourceLabel: string | null;
  itemReferences: GameReportItemReference[];
  trialSection: GameReportContextSection | null;
  encounterSection: GameReportContextSection | null;
  rewardSection: GameReportContextSection | null;
  effectSection: GameReportContextSection | null;
  combatSection: GameReportCombatSection | null;
  relatedReports: GameReportRelatedReport[];
  contextualReadiness: GameReportContextualReadiness | null;
  rawJson: Json;
}

export interface PublicGameReport {
  publicToken: string;
  reportTypeKey: string;
  reportTypeLabel: string;
  reportTypeDescription: string;
  title: string;
  summary: string | null;
  sourceLabel: string | null;
  sourceEntityType: GameReportSourceEntityType;
  createdAt: string;
  participants: GameReportParticipant[];
  itemReferences: PublicGameReportItemReference[];
  trialSection: GameReportContextSection | null;
  encounterSection: GameReportContextSection | null;
  rewardSection: GameReportContextSection | null;
  effectSection: GameReportContextSection | null;
  combatSection: GameReportCombatSection | null;
  relatedReports: GameReportRelatedReport[];
  contextualReadiness: GameReportContextualReadiness | null;
}

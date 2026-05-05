import {
  GameReportAccessRole,
  GameReportItemSourceKind,
  GameReportSourceEntityType,
} from '../../types/game-report-rpc.types';

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
  sortOrder: number;
}

export interface PublicGameReportItemReference {
  sourceKind: GameReportItemSourceKind;
  displayName: string;
  qualityKey: string | null;
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
}

export interface GameReportCombatAttack {
  turnNumber: number;
  attackOrder: number;
  actorSide: string;
  targetSide: string;
  sourceKind: string | null;
  sourceLabel: string;
  timingHit: boolean | null;
  evaded: boolean;
  critical: boolean;
  finalDamage: number;
  targetHealthBefore: number | null;
  targetHealthAfter: number | null;
  displayText: string;
}

export interface GameReportCombatSection {
  outcome: string;
  turnsCompleted: number | null;
  participants: GameReportCombatParticipant[];
  attacks: GameReportCombatAttack[];
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

export interface PrivateGameReportDetail extends Omit<
  PrivateGameReportListItem,
  'itemReferencesCount'
> {
  reportTypeDescription: string;
  itemReferences: GameReportItemReference[];
  combatSection: GameReportCombatSection | null;
}

export interface PublicGameReport {
  publicToken: string;
  reportTypeKey: string;
  reportTypeLabel: string;
  reportTypeDescription: string;
  title: string;
  summary: string | null;
  sourceEntityType: GameReportSourceEntityType;
  createdAt: string;
  participants: GameReportParticipant[];
  itemReferences: PublicGameReportItemReference[];
  combatSection: GameReportCombatSection | null;
}

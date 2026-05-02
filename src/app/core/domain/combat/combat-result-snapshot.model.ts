import {
  CombatResolutionResult,
  CombatSourceType,
} from './combat.model';

export type CombatResultPersistenceAuthority =
  | 'sandbox_or_admin_test'
  | 'backend_validated'
  | 'backend_authoritative';

export interface PersistCombatResultSnapshotInput {
  result: CombatResolutionResult;
  reason?: string | null;
  requestId?: string | null;
  authority?: CombatResultPersistenceAuthority;
}

export interface PersistedCombatResultSnapshot {
  combatResultId: string;
  serverId: string;
  sourceType: CombatSourceType;
  sourceEntityId: string | null;
  outcome: CombatResolutionResult['outcome'];
  participantsCreated: number;
  participantStatsCreated: number;
  attacksCreated: number;
  auditLogId: string;
}

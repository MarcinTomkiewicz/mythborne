import { AuditActionType, AuditEntityType } from '../domain/audit/audit-dictionary.model';
import { Row } from './supabase.types';

export type AuditLogWithDictionaryRow = Row<'audit_logs'> & {
  audit_action_types: Row<'audit_action_types'> | null;
  audit_entity_types: Row<'audit_entity_types'> | null;
};

export interface AuditLogFilters {
  actionTypeKey: string | null;
  entityTypeKey: string | null;
  serverId: string | null;
  actorUserId: string | null;
  actorHeroId: string | null;
  targetUserId: string | null;
  targetHeroId: string | null;
}

export interface AuditLogFilterOptions {
  actionTypes: AuditActionType[];
  entityTypes: AuditEntityType[];
}

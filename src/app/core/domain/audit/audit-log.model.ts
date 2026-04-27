import { AuditActionType, AuditEntityType, AuditSeverity } from './audit-dictionary.model';
import { Json } from '../../types/database.types';

export interface AuditLogEntry {
  id: string;
  actionTypeKey: string;
  actionType: AuditActionType | null;
  entityTypeKey: string;
  entityType: AuditEntityType | null;
  entityId: string | null;
  severity: AuditSeverity;
  reason: string | null;
  serverId: string | null;
  actorUserId: string | null;
  actorHeroId: string | null;
  targetUserId: string | null;
  targetHeroId: string | null;
  requestId: string | null;
  metadataJson: Json;
  oldValueJson: Json | null;
  newValueJson: Json | null;
  createdAt: string;
}

export interface AuditLogData {
  logs: AuditLogEntry[];
}

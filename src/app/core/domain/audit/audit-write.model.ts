import { Json } from '../../types/database.types';
import { AuditSeverity } from './audit-dictionary.model';

export interface AuditWriteRequest {
  // actorUserId is resolved by write_audit_log from auth.uid(); frontend may pass only optional hero context.
  actionTypeKey: string;
  entityTypeKey: string;
  entityId?: string | null;
  serverId?: string | null;
  actorHeroId?: string | null;
  targetUserId?: string | null;
  targetHeroId?: string | null;
  severity?: AuditSeverity | null;
  reason?: string | null;
  metadataJson?: Json | null;
  oldValueJson?: Json | null;
  newValueJson?: Json | null;
  requestId?: string | null;
}

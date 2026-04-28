import { AuditWriteRequest } from '../domain/audit/audit-write.model';
import { WriteAuditLogRpcArgs } from '../types/audit-write.types';
import { trimText, trimToNull } from './normalize-text';

export function toWriteAuditLogRpcArgs(
  request: AuditWriteRequest,
): WriteAuditLogRpcArgs {
  const args: WriteAuditLogRpcArgs = {
    p_action_type_key: requiredAuditKey(request.actionTypeKey, 'actionTypeKey'),
    p_entity_type_key: requiredAuditKey(request.entityTypeKey, 'entityTypeKey'),
  };

  addOptionalString(args, 'p_entity_id', request.entityId);
  addOptionalString(args, 'p_server_id', request.serverId);
  addOptionalString(args, 'p_actor_hero_id', request.actorHeroId);
  addOptionalString(args, 'p_target_user_id', request.targetUserId);
  addOptionalString(args, 'p_target_hero_id', request.targetHeroId);
  addOptionalString(args, 'p_reason', request.reason);
  addOptionalString(args, 'p_request_id', request.requestId);

  if (request.severity) {
    args.p_severity = request.severity;
  }

  if (request.metadataJson !== undefined) {
    args.p_metadata_json = request.metadataJson;
  }

  if (request.oldValueJson !== undefined) {
    args.p_old_value_json = request.oldValueJson;
  }

  if (request.newValueJson !== undefined) {
    args.p_new_value_json = request.newValueJson;
  }

  return args;
}

function requiredAuditKey(value: string, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for audit log writes.`);
  }

  return normalized;
}

function addOptionalString<K extends keyof WriteAuditLogRpcArgs>(
  target: WriteAuditLogRpcArgs,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as WriteAuditLogRpcArgs[K];
  }
}

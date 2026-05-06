import { HeroActiveRuntimeActivity } from '../domain/pvp/pvp.model';
import { GetHeroActiveRuntimeActivityRpcRow } from '../types/pvp-rpc.types';

export function mapHeroActiveRuntimeActivity(
  row: GetHeroActiveRuntimeActivityRpcRow,
): HeroActiveRuntimeActivity {
  return {
    activityId: requiredText(row.activity_id, 'activityId'),
    heroId: requiredText(row.hero_id, 'heroId'),
    serverId: requiredText(row.server_id, 'serverId'),
    activityKind: requiredText(row.activity_kind, 'activityKind'),
    activityKindLabel: requiredText(row.activity_kind_label, 'activityKindLabel'),
    status: requiredText(row.status, 'status'),
    statusLabel: requiredText(row.status_label, 'statusLabel'),
    sourceEntityType: nullableText(row.source_entity_type),
    sourceEntityId: nullableText(row.source_entity_id),
    startedAt: requiredText(row.started_at, 'startedAt'),
    availableAt: nullableText(row.available_at),
    expiresAt: nullableText(row.expires_at),
    endedAt: nullableText(row.ended_at),
    reason: nullableText(row.reason),
    requestId: nullableText(row.request_id),
    metadataJson: row.metadata_json ?? {},
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = nullableText(value);

  if (!normalized) {
    throw new Error(`${field} must be a non-empty runtime activity field.`);
  }

  return normalized;
}

function nullableText(value: string | null | undefined): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

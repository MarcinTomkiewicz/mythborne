import {
  ItemLifecycleOperationResult,
  RecoverableScrappedItem,
  RecoverableScrappedItemSearchResult,
  RecoverScrappedItemInput,
  SearchRecoverableScrappedItemsInput,
  VendorScrapHeroItemInput,
  VendorScrapHeroItemResult,
} from '../domain/item/item-lifecycle.model';
import {
  ItemLifecycleRpcRow,
  RecoverScrappedItemRpcArgs,
  SearchRecoverableScrappedItemsPageRpcArgs,
  SearchRecoverableScrappedItemsPageRpcRow,
  VendorScrapHeroItemRpcArgs,
  VendorScrapHeroItemRpcRow,
} from '../types/item-lifecycle-rpc.types';
import { trimText, trimToNull } from './normalize-text';

export function toVendorScrapHeroItemRpcArgs(
  input: VendorScrapHeroItemInput,
): VendorScrapHeroItemRpcArgs {
  const args: VendorScrapHeroItemRpcArgs = {
    p_actor_hero_id: requiredText(input.actorHeroId, 'actorHeroId'),
    p_item_id: requiredText(input.itemId, 'itemId'),
  };

  addOptionalText(args, 'p_reason', input.reason);
  addOptionalText(args, 'p_request_id', input.requestId);

  return args;
}

export function toRecoverScrappedItemRpcArgs(
  input: RecoverScrappedItemInput,
): RecoverScrappedItemRpcArgs {
  const args: RecoverScrappedItemRpcArgs = {
    p_item_id: requiredText(input.itemId, 'itemId'),
    p_target_hero_id: requiredText(input.targetHeroId, 'targetHeroId'),
    p_reason: requiredText(input.reason, 'reason'),
  };

  addOptionalText(args, 'p_request_id', input.requestId);

  return args;
}

export function toSearchRecoverableScrappedItemsPageRpcArgs(
  input: SearchRecoverableScrappedItemsInput,
): SearchRecoverableScrappedItemsPageRpcArgs {
  const args: SearchRecoverableScrappedItemsPageRpcArgs = {
    p_server_id: requiredText(input.serverId, 'serverId'),
  };
  const query = trimToNull(input.query);

  if (query) {
    args.p_query = query;
  }

  const limit = optionalNonNegativeInteger(input.limit);
  const offset = optionalNonNegativeInteger(input.offset);

  if (limit !== null) {
    args.p_limit = limit;
  }

  if (offset !== null) {
    args.p_offset = offset;
  }

  return args;
}

export function mapItemLifecycleOperationResult(
  row: ItemLifecycleRpcRow,
): ItemLifecycleOperationResult {
  return {
    itemId: row.item_id,
    status: row.status,
    scrappedAt: row.scrapped_at,
    recoverableUntil: row.recoverable_until,
    auditLogId: row.audit_log_id,
  };
}

export function mapVendorScrapHeroItemResult(
  row: VendorScrapHeroItemRpcRow,
): VendorScrapHeroItemResult {
  return {
    itemId: row.item_id,
    itemStatus: row.item_status,
    scrappedAt: row.scrapped_at,
    recoverableUntil: row.recoverable_until,
    resourceType: row.resource_type,
    drachmaAmount: row.drachma_amount,
    balanceAfter: row.balance_after,
    itemAuditLogId: row.item_audit_log_id,
    vendorAuditLogId: row.vendor_audit_log_id,
  };
}

export function mapRecoverableScrappedItem(
  row: SearchRecoverableScrappedItemsPageRpcRow,
): RecoverableScrappedItem {
  return {
    itemId: row.item_id,
    itemDisplayName: row.item_display_name,
    itemValue: row.item_value,
    generationBaseId: row.generation_base_id,
    generationQualityKey: row.generation_quality_key,
    prefixAffixId: row.prefix_affix_id,
    suffixAffixId: row.suffix_affix_id,
    ownerHeroId: row.owner_hero_id,
    ownerHeroName: row.owner_hero_name,
    ownerUserId: row.owner_user_id,
    ownerDisplayName: row.owner_display_name,
    scrappedAt: row.scrapped_at,
    recoverableUntil: row.recoverable_until,
    matchKind: row.match_kind,
    technicalLabel: row.technical_label,
  };
}

export function mapRecoverableScrappedItemSearchResult(
  rows: readonly SearchRecoverableScrappedItemsPageRpcRow[],
): RecoverableScrappedItemSearchResult {
  return {
    items: rows.map(mapRecoverableScrappedItem),
    totalCount: rows[0]?.total_count ?? 0,
  };
}

function requiredText(value: string | null | undefined, field: string): string {
  const normalized = trimText(value);

  if (!normalized) {
    throw new Error(`${field} is required for item lifecycle workflow.`);
  }

  return normalized;
}

function addOptionalText<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: string | null | undefined,
): void {
  const normalized = trimToNull(value);

  if (normalized) {
    target[key] = normalized as T[K];
  }
}

function optionalNonNegativeInteger(value: number | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const normalized = Math.floor(Number(value));

  return Number.isFinite(normalized) && normalized >= 0 ? normalized : null;
}

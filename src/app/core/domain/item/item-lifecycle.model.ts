import { ItemStatus } from './item.model';

export type SafeItemScrapBehavior =
  | 'recoverable_scrap'
  | 'recoverable_scrap_unknown_affixes'
  | 'permanent_delete_candidate';

export interface ItemSafeScrapMetadata {
  prefixAffixId?: string | null;
  suffixAffixId?: string | null;
}

export interface ScrapHeroItemInput {
  actorHeroId: string;
  itemId: string;
  reason?: string | null;
  requestId?: string | null;
}

export interface RecoverScrappedItemInput {
  itemId: string;
  targetHeroId: string;
  reason: string;
  requestId?: string | null;
}

export interface SearchRecoverableScrappedItemsInput {
  serverId: string;
  query?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface ItemLifecycleOperationResult {
  itemId: string;
  status: ItemStatus;
  scrappedAt: string;
  recoverableUntil: string;
  auditLogId: string;
}

export interface RecoverableScrappedItem {
  itemId: string;
  itemDisplayName: string;
  itemValue: number;
  generationBaseId: string | null;
  generationQualityKey: string | null;
  prefixAffixId: string | null;
  suffixAffixId: string | null;
  ownerHeroId: string;
  ownerHeroName: string;
  ownerUserId: string;
  ownerDisplayName: string;
  scrappedAt: string;
  recoverableUntil: string;
  matchKind: string;
  technicalLabel: string;
}

export interface RecoverableScrappedItemSearchResult {
  items: RecoverableScrappedItem[];
  totalCount: number;
}

export function resolveSafeItemScrapBehavior(
  metadata: ItemSafeScrapMetadata,
): SafeItemScrapBehavior {
  const hasUnknownAffixState =
    metadata.prefixAffixId === undefined || metadata.suffixAffixId === undefined;

  if (hasUnknownAffixState) {
    return 'recoverable_scrap_unknown_affixes';
  }

  if (metadata.prefixAffixId || metadata.suffixAffixId) {
    return 'recoverable_scrap';
  }

  // Classification hint only: scrap_hero_item owns the final DB decision and may
  // permanently remove no-affix items. Frontend services must not direct-delete
  // or assume the item row still exists after a successful scrap result.
  return 'permanent_delete_candidate';
}

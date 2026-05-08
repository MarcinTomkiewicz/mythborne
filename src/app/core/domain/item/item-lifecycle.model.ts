import { ItemStatus } from './item.model';

export interface VendorScrapHeroItemInput {
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
  scrappedAt: string | null;
  recoverableUntil: string | null;
  auditLogId: string;
}

export interface VendorScrapHeroItemResult {
  itemId: string;
  itemStatus: ItemStatus;
  scrappedAt: string | null;
  recoverableUntil: string | null;
  resourceType: string;
  drachmaAmount: number;
  balanceAfter: number;
  itemAuditLogId: string;
  vendorAuditLogId: string;
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

import { Database } from './database.types';

export type ScrapHeroItemRpcArgs =
  Database['public']['Functions']['scrap_hero_item']['Args'];
export type ScrapHeroItemRpcRow =
  Database['public']['Functions']['scrap_hero_item']['Returns'][number];

export type RecoverScrappedItemRpcArgs =
  Database['public']['Functions']['recover_scrapped_item']['Args'];
export type RecoverScrappedItemRpcRow =
  Database['public']['Functions']['recover_scrapped_item']['Returns'][number];

export type ItemLifecycleOperationRpcRow = {
  audit_log_id: string;
  item_id: string;
  recoverable_until: string | null;
  scrapped_at: string | null;
  status: Database['public']['Enums']['item_status'];
};

export type SearchRecoverableScrappedItemsPageRpcArgs =
  Database['public']['Functions']['search_recoverable_scrapped_items_page']['Args'];
export type SearchRecoverableScrappedItemsPageRpcRow =
  Database['public']['Functions']['search_recoverable_scrapped_items_page']['Returns'][number];

export type ItemLifecycleRpcRow = ItemLifecycleOperationRpcRow;

import {
  BulkMoveArmoryItemsToShelfJournalEntry,
  BulkMoveArmoryItemsToShelfResult,
} from '../domain/item/armory-actions.model';
import { Json } from '../types/database.types';
import { BulkMoveHeroArmoryItemsToShelfRpcRow } from '../types/item-equipment-rpc.types';
import {
  JsonRecord,
  mapJsonArray,
  optionalText,
  read,
} from './json-read';

export function mapBulkMoveArmoryItemsToShelfResult(
  row: BulkMoveHeroArmoryItemsToShelfRpcRow,
): BulkMoveArmoryItemsToShelfResult {
  return {
    heroId: row.hero_id,
    serverId: row.server_id,
    requestId: row.request_id,
    success: row.success,
    selectedCount: row.selected_count,
    movedCount: row.moved_count,
    failedCount: row.failed_count,
    skippedCount: row.skipped_count,
    targetShelfPosition: row.target_shelf_position,
    targetShelfName: row.target_shelf_name,
    resultJournal: mapBulkMoveArmoryJournal(row.result_journal_json),
  };
}

function mapBulkMoveArmoryJournal(
  value: Json,
): BulkMoveArmoryItemsToShelfJournalEntry[] {
  return mapJsonArray(value, mapBulkMoveArmoryJournalEntry);
}

function mapBulkMoveArmoryJournalEntry(
  record: JsonRecord,
): BulkMoveArmoryItemsToShelfJournalEntry {
  return {
    itemId: optionalText(read(record, 'itemId', 'item_id')),
    actionKey: optionalText(read(record, 'actionKey', 'action_key')),
    status: optionalText(read(record, 'status')),
    message: optionalText(read(record, 'message', 'reason')),
  };
}

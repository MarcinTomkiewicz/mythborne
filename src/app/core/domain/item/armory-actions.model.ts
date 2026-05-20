export interface BulkMoveArmoryItemsToShelfResult {
  heroId: string;
  serverId: string;
  requestId: string;
  success: boolean;
  selectedCount: number;
  movedCount: number;
  failedCount: number;
  skippedCount: number;
  targetShelfPosition: number;
  targetShelfName: string;
  resultJournal: BulkMoveArmoryItemsToShelfJournalEntry[];
}

export interface BulkMoveArmoryItemsToShelfJournalEntry {
  itemId: string | null;
  actionKey: string | null;
  status: string | null;
  message: string | null;
}

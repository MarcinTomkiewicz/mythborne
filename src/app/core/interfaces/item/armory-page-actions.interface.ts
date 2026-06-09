export interface ArmoryBulkMoveInventoryItemsInput {
  itemIds: readonly string[];
  targetShelfPosition: number;
}

export interface ArmoryRenameInventoryShelfInput {
  shelfPosition: number;
  name: string;
}

export interface RenameArmoryShelfInput {
  shelfPosition: number;
  newName: string;
}

export interface MoveArmoryItemToShelfInput {
  itemId: string;
  targetShelfPosition: number;
}

export interface BulkMoveArmoryItemInput {
  itemId: string;
}

export interface BulkMoveArmoryItemsToShelfInput {
  items: readonly BulkMoveArmoryItemInput[];
  targetShelfPosition: number;
  requestId?: string | null;
}

export interface RenameArmoryShelfInput {
  shelfPosition: number;
  newName: string;
}

export interface MoveArmoryItemToShelfInput {
  itemId: string;
  targetShelfPosition: number;
}

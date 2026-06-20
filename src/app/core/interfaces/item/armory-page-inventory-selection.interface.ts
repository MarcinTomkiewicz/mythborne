import type {
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../domain/item/player-armory-page-context.model';

export interface ArmoryBulkMoveSelection {
  selectedItems: PlayerArmoryItemReadModel[];
  targetShelf: PlayerArmoryStorageSlotReadModel;
}

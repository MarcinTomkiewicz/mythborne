import {
  PlayerArmoryItemReadModel,
  PlayerArmoryStorageSlotReadModel,
} from '../../domain/item/player-armory-page-context.model';

export interface ArmoryInventoryDragData {
  item: PlayerArmoryItemReadModel;
}

export interface ArmoryInventoryShelfRow extends PlayerArmoryStorageSlotReadModel {
  controlName: string;
  canRename: boolean;
  shelfCountLabel: string;
}

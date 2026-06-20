import { SelectOption } from '../../types/select-option.types';
import { PlayerArmoryPageCopyInventory } from '../../domain/item/player-armory-page-context.model';

export interface ArmoryBulkActionsToolbarState {
  selectedCount: number;
  drachmaValue: number;
  selectedCountLabel: string;
  selectedValueLabel: string;
  actionBusyLabel: string;
  equipLabel: string;
  sellLabel: string;
  moveTargetPlaceholder: string;
  moveSelectedLabel: string;
  canEquip: boolean;
  canSell: boolean;
  canMove: boolean;
  moveDestinationOptions: readonly SelectOption<number>[];
  isActionBusy: boolean;
}

export interface ArmoryBulkActionsToolbarStateInput {
  inventoryCopy: PlayerArmoryPageCopyInventory;
  selectedCount: number;
  drachmaValue: number;
  equipLabel: string;
  sellLabel: string;
  canEquip: boolean;
  canSell: boolean;
  canMove: boolean;
  moveDestinationOptions: readonly SelectOption<number>[];
  isActionBusy: boolean;
}

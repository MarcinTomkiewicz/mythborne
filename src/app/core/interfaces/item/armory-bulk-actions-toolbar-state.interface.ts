import { SelectOption } from '../../types/select-option.types';

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

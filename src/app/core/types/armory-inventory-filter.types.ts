import { ItemLifecycleStatus } from '../domain/item/item-equipment.model';

export type ArmoryInventoryAvailabilityFilterValue =
  | 'all'
  | Extract<ItemLifecycleStatus, 'active' | 'locked_trade' | 'locked_auction'>;

export interface ArmoryInventoryFilters {
  searchTerm: string;
  slotKey: string;
  availability: ArmoryInventoryAvailabilityFilterValue;
}

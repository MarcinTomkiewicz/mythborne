import { SelectOption } from '../types/select-option.types';
import { ArmoryInventoryAvailabilityFilterValue } from '../types/armory-inventory-filter.types';

export const ARMORY_RING_SLOT_FILTER_VALUE = 'slot_group:ring';

export const ARMORY_AVAILABILITY_FILTER_OPTIONS: SelectOption<ArmoryInventoryAvailabilityFilterValue>[] = [
  { label: 'All availability', value: 'all' },
  { label: 'Available', value: 'active' },
  { label: 'Offered in trade', value: 'locked_trade' },
  { label: 'Listed on auction', value: 'locked_auction' },
];

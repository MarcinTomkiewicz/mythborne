import { ItemLifecycleStatus } from '../domain/item/item-equipment.model';
import { humanizeKey } from './normalize-text';

export function itemLifecycleStatusLabel(status: ItemLifecycleStatus): string {
  switch (status) {
    case 'active':
      return 'Available';
    case 'locked_trade':
      return 'Offered in trade';
    case 'locked_auction':
      return 'Listed on auction';
    default:
      break;
  }

  return humanizeKey(status, 'Status');
}

export function itemLifecycleStatusBadgeClass(status: ItemLifecycleStatus): string {
  return status === 'active'
    ? 'tag-badge tag-badge--info'
    : 'tag-badge tag-badge--muted';
}

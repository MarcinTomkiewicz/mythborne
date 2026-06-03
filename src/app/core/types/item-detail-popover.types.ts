import {
  ItemDetailPopoverValueRow,
  ItemDetailPopoverViewModel,
} from '../domain/item/item-detail-popover.model';

export type PartialItemDetailPopoverInput = Pick<
  ItemDetailPopoverViewModel,
  | 'itemId'
  | 'name'
  | 'description'
  | 'statusLabel'
  | 'qualityLabel'
  | 'kindLabel'
  | 'slotLabel'
  | 'iconClass'
  | 'drachmaValue'
  | 'valueDisplay'
  | 'context'
  | 'isLoading'
  | 'error'
> & {
  detailRows: readonly ItemDetailPopoverValueRow[];
  preserveDisplayLabels: boolean;
};

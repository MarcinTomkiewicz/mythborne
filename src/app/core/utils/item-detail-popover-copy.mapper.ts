import { ItemDetailPopoverCopy } from '../domain/item/item-detail-popover.model';
import { Json } from '../types/database.types';
import {
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapItemDetailPopoverCopy(
  value: Json | undefined,
  fieldPath = 'get_item_detail_popover_copy',
): ItemDetailPopoverCopy {
  const itemDetail = requiredRecord(value, fieldPath);
  const contractVersion = requiredText(
    read(itemDetail, 'contractVersion'),
    `${fieldPath}.contractVersion`,
  );

  if (contractVersion !== 'item_detail_popover_copy_v1') {
    throw new Error(`${fieldPath}.contractVersion must be item_detail_popover_copy_v1.`);
  }

  const sections = requiredRecord(read(itemDetail, 'sections'), `${fieldPath}.sections`);
  const labels = requiredRecord(read(itemDetail, 'labels'), `${fieldPath}.labels`);
  const empty = requiredRecord(read(itemDetail, 'empty'), `${fieldPath}.empty`);
  const access = requiredRecord(read(itemDetail, 'access'), `${fieldPath}.access`);

  return {
    contractVersion,
    sections: {
      overview: requiredText(
        read(sections, 'overview'),
        `${fieldPath}.sections.overview`,
      ),
      itemStats: requiredText(
        read(sections, 'itemStats'),
        `${fieldPath}.sections.itemStats`,
      ),
      bonuses: requiredText(
        read(sections, 'bonuses'),
        `${fieldPath}.sections.bonuses`,
      ),
      requirements: requiredText(
        read(sections, 'requirements'),
        `${fieldPath}.sections.requirements`,
      ),
      value: requiredText(
        read(sections, 'value'),
        `${fieldPath}.sections.value`,
      ),
    },
    labels: {
      quality: requiredText(read(labels, 'quality'), `${fieldPath}.labels.quality`),
      baseType: requiredText(read(labels, 'baseType'), `${fieldPath}.labels.baseType`),
      slot: requiredText(read(labels, 'slot'), `${fieldPath}.labels.slot`),
      handUsage: requiredText(read(labels, 'handUsage'), `${fieldPath}.labels.handUsage`),
      valueInDrachmas: requiredText(
        read(labels, 'valueInDrachmas'),
        `${fieldPath}.labels.valueInDrachmas`,
      ),
      status: requiredText(read(labels, 'status'), `${fieldPath}.labels.status`),
      source: requiredText(read(labels, 'source'), `${fieldPath}.labels.source`),
    },
    empty: {
      itemStats: requiredText(
        read(empty, 'itemStats'),
        `${fieldPath}.empty.itemStats`,
      ),
      bonuses: requiredText(
        read(empty, 'bonuses'),
        `${fieldPath}.empty.bonuses`,
      ),
      requirements: requiredText(
        read(empty, 'requirements'),
        `${fieldPath}.empty.requirements`,
      ),
      value: requiredText(
        read(empty, 'value'),
        `${fieldPath}.empty.value`,
      ),
    },
    access: {
      notFound: requiredText(read(access, 'notFound'), `${fieldPath}.access.notFound`),
      notReadable: requiredText(read(access, 'notReadable'), `${fieldPath}.access.notReadable`),
    },
  };
}

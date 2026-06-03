import { ItemDetailPopoverCopy } from '../domain/item/item-detail-popover.model';
import { Json } from '../types/database.types';
import {
  read,
  requiredRecord,
  requiredText,
} from './json-read';

export function mapItemDetailPopoverCopy(
  value: Json | undefined,
  fieldPath: string,
): ItemDetailPopoverCopy {
  const itemDetail = requiredRecord(value, fieldPath);
  const sections = requiredRecord(read(itemDetail, 'sections'), `${fieldPath}.sections`);
  const empty = requiredRecord(read(itemDetail, 'empty'), `${fieldPath}.empty`);

  return {
    triggerLabel: requiredText(read(itemDetail, 'triggerLabel'), `${fieldPath}.triggerLabel`),
    triggerAriaLabelTemplate: requiredText(
      read(itemDetail, 'triggerAriaLabelTemplate'),
      `${fieldPath}.triggerAriaLabelTemplate`,
    ),
    loadingLabel: requiredText(read(itemDetail, 'loadingLabel'), `${fieldPath}.loadingLabel`),
    unavailableLabel: requiredText(
      read(itemDetail, 'unavailableLabel'),
      `${fieldPath}.unavailableLabel`,
    ),
    itemStatsSectionTitle: requiredText(
      read(itemDetail, 'itemStatsSectionTitle'),
      `${fieldPath}.itemStatsSectionTitle`,
    ),
    bonusesSectionTitle: requiredText(
      read(itemDetail, 'bonusesSectionTitle'),
      `${fieldPath}.bonusesSectionTitle`,
    ),
    noBonusesLabel: requiredText(
      read(itemDetail, 'noBonusesLabel'),
      `${fieldPath}.noBonusesLabel`,
    ),
    requirementsSectionTitle: requiredText(
      read(itemDetail, 'requirementsSectionTitle'),
      `${fieldPath}.requirementsSectionTitle`,
    ),
    currentValueLabel: requiredText(
      read(itemDetail, 'currentValueLabel'),
      `${fieldPath}.currentValueLabel`,
    ),
    noRequirementsLabel: requiredText(
      read(itemDetail, 'noRequirementsLabel'),
      `${fieldPath}.noRequirementsLabel`,
    ),
    requirementsUnavailableLabel: requiredText(
      read(itemDetail, 'requirementsUnavailableLabel'),
      `${fieldPath}.requirementsUnavailableLabel`,
    ),
    valueUnavailableLabel: requiredText(
      read(itemDetail, 'valueUnavailableLabel'),
      `${fieldPath}.valueUnavailableLabel`,
    ),
    currentItemContextLabel: requiredText(
      read(itemDetail, 'currentItemContextLabel'),
      `${fieldPath}.currentItemContextLabel`,
    ),
    currentEquippedItemContextLabel: requiredText(
      read(itemDetail, 'currentEquippedItemContextLabel'),
      `${fieldPath}.currentEquippedItemContextLabel`,
    ),
    sections: {
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
    },
    empty: {
      noStats: requiredText(
        read(empty, 'noStats'),
        `${fieldPath}.empty.noStats`,
      ),
      noBonuses: requiredText(
        read(empty, 'noBonuses'),
        `${fieldPath}.empty.noBonuses`,
      ),
      noRequirements: requiredText(
        read(empty, 'noRequirements'),
        `${fieldPath}.empty.noRequirements`,
      ),
      requirementsUnavailable: requiredText(
        read(empty, 'requirementsUnavailable'),
        `${fieldPath}.empty.requirementsUnavailable`,
      ),
    },
  };
}

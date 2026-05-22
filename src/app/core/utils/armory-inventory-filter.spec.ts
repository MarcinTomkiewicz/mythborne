import { ArmoryItemSummary } from '../domain/item/item-equipment.model';
import { matchesArmorySlotFilter } from './armory-inventory-filter';

describe('armory-inventory-filter', () => {
  it('matches shields when the off-hand slot is selected even without literal allowed slot rows', () => {
    const shield = armoryItem({
      name: 'Hoplite Shield',
      baseTypeKey: 'shield',
      equipmentArea: 'shield',
      primarySlotKey: null,
      allowedSlotKeys: [],
    });

    expect(matchesArmorySlotFilter(shield, 'off_hand')).toBeTrue();
  });

});

function armoryItem(
  overrides: Partial<ArmoryItemSummary> = {},
): ArmoryItemSummary {
  return {
    itemId: 'shield-1',
    ownerHeroId: 'hero-1',
    serverId: 'server-1',
    name: 'Bronze Shield',
    description: null,
    lifecycleStatus: 'active',
    generationBaseId: 'base-1',
    generationQualityKey: 'normal',
    prefixAffixId: null,
    suffixAffixId: null,
    armoryShelfPosition: 1,
    drachmaValue: 20,
    shelfPosition: 1,
    shelfName: 'Shelf 1',
    requirementPreview: null,
    ...overrides,
  };
}

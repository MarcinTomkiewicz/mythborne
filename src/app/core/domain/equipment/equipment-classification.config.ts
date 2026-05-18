import {
  ClassifiedItemDisplay,
  ItemClassificationKey,
} from '../../types/equipment-classification.types';
import {
  EQUIPMENT_PREVIEW_ICON_CLASSES,
  EQUIPMENT_PREVIEW_SLOT_KEYS,
} from './equipment-preview-icons.config';

export const UNKNOWN_ITEM_DISPLAY: ClassifiedItemDisplay = {
  iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.unknown,
  kindLabel: null,
  slotLabel: null,
  statProfile: 'none',
};

export const CLASSIFICATION_BY_KEY = {
  one_handed_weapon: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded,
    kindLabel: 'One Handed',
    slotLabel: 'Hands',
    statProfile: 'weapon',
  },
  two_handed_weapon: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.twoHanded,
    kindLabel: 'Two Handed',
    slotLabel: 'Main Hand',
    statProfile: 'weapon',
  },
  ranged_weapon: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.bowWeapon,
    kindLabel: 'Ranged',
    slotLabel: 'Main Hand',
    statProfile: 'weapon',
  },
  bow_weapon: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.bowWeapon,
    kindLabel: 'Ranged',
    slotLabel: 'Main Hand',
    statProfile: 'weapon',
  },
  shield: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.shield,
    kindLabel: 'Shield',
    slotLabel: 'Off Hand',
    statProfile: 'armor',
  },
  helmet: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.helmet,
    kindLabel: 'Armor',
    slotLabel: 'Helm',
    statProfile: 'armor',
  },
  armor: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.armor,
    kindLabel: 'Armor',
    slotLabel: 'Armor',
    statProfile: 'armor',
  },
  pants: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.greaves,
    kindLabel: 'Armor',
    slotLabel: 'Pants',
    statProfile: 'armor',
  },
  boots: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.boots,
    kindLabel: 'Armor',
    slotLabel: 'Boots',
    statProfile: 'armor',
  },
  ring: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.ring,
    kindLabel: 'Jewelry',
    slotLabel: 'Ring',
    statProfile: 'none',
  },
  amulet: {
    iconClass: EQUIPMENT_PREVIEW_ICON_CLASSES.amulet,
    kindLabel: 'Jewelry',
    slotLabel: 'Amulet',
    statProfile: 'none',
  },
} satisfies Record<ItemClassificationKey, ClassifiedItemDisplay>;

export const SLOT_CLASSIFICATION_KEYS: Record<string, ItemClassificationKey> = {
  [EQUIPMENT_PREVIEW_SLOT_KEYS.helmet]: 'helmet',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.armor]: 'armor',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.pants]: 'pants',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.boots]: 'boots',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring1]: 'ring',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring2]: 'ring',
  [EQUIPMENT_PREVIEW_SLOT_KEYS.amulet]: 'amulet',
};

export const HAND_USAGE_CLASSIFICATION_KEYS: Record<string, ItemClassificationKey> = {
  one_hand: 'one_handed_weapon',
  one_handed: 'one_handed_weapon',
  two_hand: 'two_handed_weapon',
  two_hands: 'two_handed_weapon',
  two_handed: 'two_handed_weapon',
  ranged: 'ranged_weapon',
};

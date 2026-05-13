export const EQUIPMENT_PREVIEW_SLOT_KEYS = {
  helmet: 'helmet',
  armor: 'armor',
  ring1: 'ring_1',
  mainHand: 'main_hand',
  boots: 'boots',
  amulet: 'amulet',
  ring2: 'ring_2',
  offHand: 'off_hand',
  pants: 'pants',
} as const;

export type EquipmentPreviewSlotKey =
  typeof EQUIPMENT_PREVIEW_SLOT_KEYS[keyof typeof EQUIPMENT_PREVIEW_SLOT_KEYS];

export const EQUIPMENT_PREVIEW_ICON_CLASSES = {
  oneHanded: 'pi pi-one-handed',
  twoHanded: 'pi pi-two-handed',
  bowWeapon: 'pi pi-bow-weapon',
  greaves: 'pi pi-greaves',
  boots: 'pi pi-boots',
  ring: 'pi pi-ring',
  amulet: 'pi pi-amulet',
  helmet: 'pi pi-armory-helmet',
  armor: 'pi pi-armor',
  shield: 'pi pi-shield-bash',
  unknown: 'pi pi-chest',
} as const;

export type EquipmentPreviewIconClass =
  typeof EQUIPMENT_PREVIEW_ICON_CLASSES[keyof typeof EQUIPMENT_PREVIEW_ICON_CLASSES];

export const EQUIPMENT_PREVIEW_SLOT_ICON_CLASSES: Record<
  EquipmentPreviewSlotKey,
  EquipmentPreviewIconClass
> = {
  [EQUIPMENT_PREVIEW_SLOT_KEYS.helmet]: EQUIPMENT_PREVIEW_ICON_CLASSES.helmet,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.armor]: EQUIPMENT_PREVIEW_ICON_CLASSES.armor,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring1]: EQUIPMENT_PREVIEW_ICON_CLASSES.ring,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.mainHand]: EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.boots]: EQUIPMENT_PREVIEW_ICON_CLASSES.boots,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.amulet]: EQUIPMENT_PREVIEW_ICON_CLASSES.amulet,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.ring2]: EQUIPMENT_PREVIEW_ICON_CLASSES.ring,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.offHand]: EQUIPMENT_PREVIEW_ICON_CLASSES.oneHanded,
  [EQUIPMENT_PREVIEW_SLOT_KEYS.pants]: EQUIPMENT_PREVIEW_ICON_CLASSES.greaves,
};

export function equipmentPreviewIconClassForSlot(
  slotKey: string,
): EquipmentPreviewIconClass {
  return isEquipmentPreviewSlotKey(slotKey)
    ? EQUIPMENT_PREVIEW_SLOT_ICON_CLASSES[slotKey]
    : EQUIPMENT_PREVIEW_ICON_CLASSES.unknown;
}

export function isEquipmentPreviewSlotKey(
  slotKey: string,
): slotKey is EquipmentPreviewSlotKey {
  return Object.values(EQUIPMENT_PREVIEW_SLOT_KEYS)
    .some((knownSlotKey) => knownSlotKey === slotKey);
}

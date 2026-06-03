export interface PlayerItemDisplayCore {
  itemId: string;
  itemName: string;
  lifecycleStatusKey: string | null;
  lifecycleStatusLabel: string | null;
  generationQualityKey: string | null;
  qualityLabel: string | null;
  baseKey: string | null;
  baseName: string | null;
  baseTypeKey: string | null;
  baseTypeLabel: string | null;
  drachmaValue: string | null;
  valueDisplay: PlayerItemDisplayCoreValueDisplay | null;
  displayIconKey: string;
  equipmentArea: string | null;
  handUsageKey: string | null;
  handUsageLabel: string | null;
  primarySlotKey: string | null;
  primarySlotLabel: string | null;
  equipmentSlotKey: string | null;
  equipmentSlotLabel: string | null;
  allowedSlotKeys: string[];
  allowedSlotLabel: string | null;
}

export interface PlayerItemDisplayCoreValueDisplay {
  displayLabel: string;
  displayValue: string;
}

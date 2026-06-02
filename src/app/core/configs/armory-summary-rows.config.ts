export const ARMORY_SUMMARY_ROW_CONFIG = [
  { key: 'capacity', labelKey: 'capacity' },
  { key: 'allItems', labelKey: 'allItems' },
  { key: 'equippedItems', labelKey: 'equippedItems' },
  { key: 'savedSets', labelKey: 'savedSets' },
] as const;

export type ArmorySummaryRowKey =
  (typeof ARMORY_SUMMARY_ROW_CONFIG)[number]['key'];

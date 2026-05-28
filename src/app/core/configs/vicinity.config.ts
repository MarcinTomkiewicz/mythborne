export const VICINITY_ADDRESS_PAGE_SIZE = 20;
export const VICINITY_TARGET_LIMIT = VICINITY_ADDRESS_PAGE_SIZE;

export const VICINITY_HEADER_SUMMARY_ROWS = [
  {
    key: 'dailyAttacks',
    label: 'Dzienna liczba ataków',
  },
  {
    key: 'currentAddress',
    label: 'Twój adres',
  },
  {
    key: 'attackProtection',
    label: 'Ochrona przed atakiem',
  },
  {
    key: 'siegeProtection',
    label: 'Ochrona przed oblężeniem',
  },
] as const;

export const VICINITY_SELECTED_TARGET_FACT_ROWS = [
  {
    key: 'target',
    label: 'Cel',
  },
  {
    key: 'address',
    label: 'Adres',
  },
  {
    key: 'attackTravel',
    label: 'Czas ataku',
  },
  {
    key: 'spyTravel',
    label: 'Czas szpiegowania',
  },
  {
    key: 'siege',
    label: 'Oblężenie',
  },
  {
    key: 'protection',
    label: 'Ochrona',
  },
] as const;

export const VICINITY_ADDRESS_LIST_METRICS = [
  {
    key: 'level',
    label: 'Poziom',
  },
  {
    key: 'attackTravel',
    label: 'Atak',
  },
  {
    key: 'spyTravel',
    label: 'Szpieguj',
  },
] as const;

export const VICINITY_ADDRESS_LIST_COLUMN_LABELS = [
  'Adres',
  'Bohater',
  ...VICINITY_ADDRESS_LIST_METRICS.map((metric) => metric.label),
  'Akcje',
] as const;

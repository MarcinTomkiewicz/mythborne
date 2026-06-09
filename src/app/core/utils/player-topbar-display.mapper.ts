import {
  PlayerTopbarDisplay,
  PlayerTopbarDisplayItem,
  PlayerTopbarHeroVitalDisplay,
  PlayerTopbarHeroVitalKey,
  PlayerTopbarResourceDisplay,
  PlayerTopbarResourceKey,
} from '../domain/game-copy/player-topbar-display.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNullableText,
  read,
  requiredArray,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';

const PLAYER_TOPBAR_DISPLAY_CONTRACT_VERSION =
  'player_topbar_display_contract_v1';
const REQUIRED_HERO_VITAL_KEYS: readonly PlayerTopbarHeroVitalKey[] = [
  'health',
  'level',
  'experience',
];
const REQUIRED_RESOURCE_KEYS: readonly PlayerTopbarResourceKey[] = [
  'drachma',
  'materials',
  'workforce',
];
const IGNORED_RESOURCE_KEYS = ['character_points'];

export function mapPlayerTopbarDisplay(value: Json): PlayerTopbarDisplay {
  const root = requiredRecord(value, 'get_player_topbar_display_contract');

  assertContractVersion(root);
  const heroVitals = requiredArray(read(root, 'heroVitals'), 'topbar heroVitals')
    .map(mapHeroVital)
    .sort(bySortOrder);
  const resources = requiredArray(read(root, 'resources'), 'topbar resources')
    .map(mapResource)
    .filter((row): row is PlayerTopbarResourceDisplay => row !== null)
    .sort(bySortOrder);

  assertRequiredKeys(heroVitals, REQUIRED_HERO_VITAL_KEYS, 'topbar heroVitals');
  assertRequiredKeys(resources, REQUIRED_RESOURCE_KEYS, 'topbar resources');

  return {
    heroVitals,
    resources,
  };
}

function assertContractVersion(root: JsonRecord): void {
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    'topbar contractVersion',
  );

  if (contractVersion !== PLAYER_TOPBAR_DISPLAY_CONTRACT_VERSION) {
    throw new Error('Unexpected topbar display contract version.');
  }
}

function mapHeroVital(row: JsonRecord): PlayerTopbarHeroVitalDisplay {
  return {
    ...mapDisplayItem(row),
    key: heroVitalKey(requiredText(read(row, 'key'), 'topbar hero vital key')),
    progressKind: optionalNullableText(
      read(row, 'progressKind'),
      'topbar hero vital progressKind',
    ),
  };
}

function mapResource(row: JsonRecord): PlayerTopbarResourceDisplay | null {
  const key = requiredText(read(row, 'resourceType'), 'topbar resource resourceType');

  if (IGNORED_RESOURCE_KEYS.includes(key)) {
    return null;
  }

  return {
    ...mapDisplayItem(row),
    key: resourceKey(key),
    ratePrefix: optionalNullableText(
      read(row, 'ratePrefix'),
      'topbar resource ratePrefix',
    ),
    rateSuffix: optionalNullableText(
      read(row, 'rateSuffix'),
      'topbar resource rateSuffix',
    ),
  };
}

function mapDisplayItem(row: JsonRecord): PlayerTopbarDisplayItem {
  return {
    label: requiredText(read(row, 'label'), 'topbar label'),
    ariaLabel: requiredText(read(row, 'ariaLabel'), 'topbar ariaLabel'),
    iconKey: requiredText(read(row, 'iconKey'), 'topbar iconKey'),
    sortOrder: requiredNonNegativeInteger(read(row, 'sortOrder'), 'topbar sortOrder'),
  };
}

function heroVitalKey(key: string): PlayerTopbarHeroVitalKey {
  switch (key) {
    case 'health':
    case 'level':
    case 'experience':
      return key;
    default:
      throw new Error('Unsupported topbar hero vital key.');
  }
}

function resourceKey(key: string): PlayerTopbarResourceKey {
  switch (key) {
    case 'drachma':
    case 'materials':
    case 'workforce':
      return key;
    default:
      throw new Error('Unsupported topbar resource key.');
  }
}

function assertRequiredKeys<T extends { key: string }>(
  rows: readonly T[],
  keys: readonly T['key'][],
  fieldName: string,
): void {
  for (const key of keys) {
    if (!rows.some((row) => row.key === key)) {
      throw new Error(`${fieldName} is missing ${key}.`);
    }
  }
}

function bySortOrder(
  first: PlayerTopbarDisplayItem,
  second: PlayerTopbarDisplayItem,
): number {
  return first.sortOrder - second.sortOrder;
}

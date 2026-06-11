import {
  PvpRankingActionKind,
  PvpRankingActionState,
  PvpRankingContext,
  PvpRankingDisabledReasonKey,
  PvpRankingDistrictKey,
  PvpRankingRow,
  PVP_RANKING_DISABLED_REASON_KEYS,
} from '../domain/pvp/pvp-ranking.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  read,
  requiredArray,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredNullableText,
  requiredRecord,
  requiredText,
} from './json-read';

const RANKING_CONTRACT_VERSION = 'pvp_ranking_context_v1';
const DISTRICT_KEYS: readonly PvpRankingDistrictKey[] = ['A', 'B', 'C', 'D', 'E'];
export function mapPvpRankingContext(value: Json): PvpRankingContext {
  const root = requiredRecord(value, 'get_pvp_ranking_context');
  const contractVersion = requiredText(read(root, 'contractVersion'), 'pvpRanking.contractVersion');
  const filters = requiredRecord(read(root, 'filters'), 'pvpRanking.filters');

  if (contractVersion !== RANKING_CONTRACT_VERSION) {
    throw new Error(`pvpRanking.contractVersion must be ${RANKING_CONTRACT_VERSION}.`);
  }

  return {
    contractVersion,
    activeHero: mapActiveHero(requiredRecord(read(root, 'activeHero'), 'pvpRanking.activeHero')),
    filters: {
      appliedDistrictKey: requiredNullableDistrictKey(
        read(filters, 'appliedDistrictKey'),
        'pvpRanking.filters.appliedDistrictKey',
      ),
      query: requiredNullableText(read(filters, 'query'), 'pvpRanking.filters.query'),
      districtOptions: requiredArray(
        read(filters, 'districtOptions'),
        'pvpRanking.filters.districtOptions',
      ).map(mapDistrictOption),
    },
    ranking: mapRanking(requiredRecord(read(root, 'ranking'), 'pvpRanking.ranking')),
    selectedTarget: mapNullableRow(read(root, 'selectedTarget'), 'pvpRanking.selectedTarget'),
    capabilities: mapCapabilities(requiredRecord(read(root, 'capabilities'), 'pvpRanking.capabilities')),
  };
}

function mapActiveHero(root: JsonRecord): PvpRankingContext['activeHero'] {
  return {
    heroId: requiredText(read(root, 'heroId'), 'pvpRanking.activeHero.heroId'),
    heroName: requiredText(read(root, 'heroName'), 'pvpRanking.activeHero.heroName'),
    addressDisplay: requiredText(read(root, 'addressDisplay'), 'pvpRanking.activeHero.addressDisplay'),
    rankingPosition: requiredNonNegativeInteger(read(root, 'rankingPosition'), 'pvpRanking.activeHero.rankingPosition'),
    dailyAttackLimitRemaining: requiredNonNegativeInteger(read(root, 'dailyAttackLimitRemaining'), 'pvpRanking.activeHero.dailyAttackLimitRemaining'),
    dailyAttackLimitMax: requiredNonNegativeInteger(read(root, 'dailyAttackLimitMax'), 'pvpRanking.activeHero.dailyAttackLimitMax'),
    attackProtectionDisplay: requiredNullableText(read(root, 'attackProtectionDisplay'), 'pvpRanking.activeHero.attackProtectionDisplay'),
    siegeProtectionDisplay: requiredNullableText(read(root, 'siegeProtectionDisplay'), 'pvpRanking.activeHero.siegeProtectionDisplay'),
    attackMinTargetLevel: requiredNonNegativeInteger(read(root, 'attackMinTargetLevel'), 'pvpRanking.activeHero.attackMinTargetLevel'),
    attackMaxTargetLevel: requiredNonNegativeInteger(read(root, 'attackMaxTargetLevel'), 'pvpRanking.activeHero.attackMaxTargetLevel'),
    attackLevelRangeDisplay: requiredNullableText(read(root, 'attackLevelRangeDisplay'), 'pvpRanking.activeHero.attackLevelRangeDisplay'),
  };
}

function mapDistrictOption(root: JsonRecord, index: number) {
  return {
    key: requiredDistrictKey(read(root, 'key'), `pvpRanking.filters.districtOptions[${index}].key`),
    enabled: requiredBoolean(read(root, 'enabled'), `pvpRanking.filters.districtOptions[${index}].enabled`),
  };
}

function mapRanking(root: JsonRecord): PvpRankingContext['ranking'] {
  const limit = requiredNonNegativeInteger(read(root, 'limit'), 'pvpRanking.ranking.limit');

  if (limit !== 20) {
    throw new Error('pvpRanking.ranking.limit must be 20.');
  }

  return {
    rows: requiredArray(read(root, 'rows'), 'pvpRanking.ranking.rows').map(mapRow),
    totalCount: requiredNonNegativeInteger(read(root, 'totalCount'), 'pvpRanking.ranking.totalCount'),
    limit,
    offset: requiredNonNegativeInteger(read(root, 'offset'), 'pvpRanking.ranking.offset'),
    hasNextPage: requiredBoolean(read(root, 'hasNextPage'), 'pvpRanking.ranking.hasNextPage'),
  };
}

function mapNullableRow(value: Json | undefined, field: string): PvpRankingRow | null {
  if (value === null) {
    return null;
  }

  return mapRow(requiredRecord(value, field), 0);
}

function mapRow(root: JsonRecord, index: number): PvpRankingRow {
  const fieldPath = `pvpRanking.ranking.rows[${index}]`;

  return {
    rankPosition: requiredNonNegativeInteger(read(root, 'rankPosition'), `${fieldPath}.rankPosition`),
    heroId: requiredText(read(root, 'heroId'), `${fieldPath}.heroId`),
    heroName: requiredText(read(root, 'heroName'), `${fieldPath}.heroName`),
    guildName: requiredNullableText(read(root, 'guildName'), `${fieldPath}.guildName`),
    level: requiredNonNegativeInteger(read(root, 'level'), `${fieldPath}.level`),
    addressDisplay: requiredText(read(root, 'addressDisplay'), `${fieldPath}.addressDisplay`),
    districtKey: requiredDistrictKey(read(root, 'districtKey'), `${fieldPath}.districtKey`),
    attackDurationDisplay: requiredNullableText(read(root, 'attackDurationDisplay'), `${fieldPath}.attackDurationDisplay`),
    spyDurationDisplay: requiredNullableText(read(root, 'spyDurationDisplay'), `${fieldPath}.spyDurationDisplay`),
    protectionDisplay: requiredNullableText(read(root, 'protectionDisplay'), `${fieldPath}.protectionDisplay`),
    isSelf: requiredBoolean(read(root, 'isSelf'), `${fieldPath}.isSelf`),
    isWithinAttackLevelRange: requiredBoolean(read(root, 'isWithinAttackLevelRange'), `${fieldPath}.isWithinAttackLevelRange`),
    actions: {
      spy: mapActionState(root, 'spy', fieldPath),
      attack: mapActionState(root, 'attack', fieldPath),
      siege: mapActionState(root, 'siege', fieldPath),
    },
  };
}

function mapActionState(
  row: JsonRecord,
  actionKind: PvpRankingActionKind,
  fieldPath: string,
): PvpRankingActionState {
  const actions = requiredRecord(read(row, 'actions'), `${fieldPath}.actions`);
  const root = requiredRecord(read(actions, actionKind), `${fieldPath}.actions.${actionKind}`);

  return {
    enabled: requiredBoolean(read(root, 'enabled'), `${fieldPath}.actions.${actionKind}.enabled`),
    disabledReasonKey: requiredNullableDisabledReasonKey(
      read(root, 'disabledReasonKey'),
      `${fieldPath}.actions.${actionKind}.disabledReasonKey`,
    ),
  };
}

function mapCapabilities(root: JsonRecord): PvpRankingContext['capabilities'] {
  const canSiege = requiredBoolean(read(root, 'canSiege'), 'pvpRanking.capabilities.canSiege');

  if (canSiege !== false) {
    throw new Error('pvpRanking.capabilities.canSiege must be false.');
  }

  return {
    canSearch: requiredBoolean(read(root, 'canSearch'), 'pvpRanking.capabilities.canSearch'),
    canFilterDistrict: requiredBoolean(read(root, 'canFilterDistrict'), 'pvpRanking.capabilities.canFilterDistrict'),
    canJumpToMyPosition: requiredBoolean(read(root, 'canJumpToMyPosition'), 'pvpRanking.capabilities.canJumpToMyPosition'),
    canSpy: requiredBoolean(read(root, 'canSpy'), 'pvpRanking.capabilities.canSpy'),
    canAttack: requiredBoolean(read(root, 'canAttack'), 'pvpRanking.capabilities.canAttack'),
    canSiege,
  };
}

function requiredDistrictKey(value: Json | undefined, field: string): PvpRankingDistrictKey {
  const key = requiredText(value, field);

  if (!DISTRICT_KEYS.includes(key as PvpRankingDistrictKey)) {
    throw new Error(`${field} must be a supported district key.`);
  }

  return key as PvpRankingDistrictKey;
}

function requiredNullableDistrictKey(value: Json | undefined, field: string): PvpRankingDistrictKey | null {
  if (value === null) {
    return null;
  }

  return requiredDistrictKey(value, field);
}

function requiredNullableDisabledReasonKey(
  value: Json | undefined,
  field: string,
): PvpRankingDisabledReasonKey | null {
  if (value === null) {
    return null;
  }

  const key = requiredText(value, field);

  if (!PVP_RANKING_DISABLED_REASON_KEYS.includes(key as PvpRankingDisabledReasonKey)) {
    throw new Error(`${field} must be a supported disabled reason key.`);
  }

  return key as PvpRankingDisabledReasonKey;
}

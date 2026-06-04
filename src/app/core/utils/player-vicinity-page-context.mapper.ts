import {
  PlayerVicinityActiveJobReadModel,
  PlayerVicinityAddressCapacityReadModel,
  PlayerVicinityCurrentEstateReadModel,
  PlayerVicinityEstateSummaryReadModel,
  PlayerVicinityHeroReadModel,
  PlayerVicinityOccupiedEstateReadModel,
  PlayerVicinityPageContextReadModel,
} from '../domain/vicinity/player-vicinity-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
  optionalNonNegativeInteger,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNonNegativeInteger,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapPlayerVicinityCopyJson } from './player-vicinity-copy.mapper';

const PLAYER_VICINITY_CONTRACT_VERSION = 'player_vicinity_page_context_v2';

export function mapPlayerVicinityPageContext(
  value: Json,
): PlayerVicinityPageContextReadModel {
  const root = requiredRecord(value, 'get_player_vicinity_page_context');
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    'get_player_vicinity_page_context.contractVersion',
  );

  if (contractVersion !== PLAYER_VICINITY_CONTRACT_VERSION) {
    throw new Error(
      `get_player_vicinity_page_context.contractVersion must be ${PLAYER_VICINITY_CONTRACT_VERSION}.`,
    );
  }

  return {
    contractVersion,
    hero: mapHero(requiredRecord(read(root, 'hero'), 'hero')),
    copyJson: mapPlayerVicinityCopyJson(read(root, 'copyJson')),
    currentEstate: mapCurrentEstate(
      requiredRecord(read(root, 'currentEstate'), 'currentEstate'),
    ),
    estateSummary: mapEstateSummary(
      requiredRecord(read(root, 'estateSummary'), 'estateSummary'),
      'estateSummary',
    ),
    estateRuntimeState: mapEstateSummary(
      requiredRecord(read(root, 'estateRuntimeState'), 'estateRuntimeState'),
      'estateRuntimeState',
    ),
    addressCapacities: requiredArray(
      read(root, 'addressCapacities'),
      'addressCapacities',
    ).map(mapAddressCapacity),
    occupiedEstates: requiredArray(
      read(root, 'occupiedEstates'),
      'occupiedEstates',
    ).map(mapOccupiedEstate),
  };
}

function mapHero(hero: JsonRecord): PlayerVicinityHeroReadModel {
  return {
    id: requiredText(read(hero, 'id'), 'hero.id'),
    name: requiredText(read(hero, 'name'), 'hero.name'),
    level: optionalNonNegativeInteger(read(hero, 'level')),
    originId: optionalText(read(hero, 'origin_id', 'originId')),
    rank: optionalNonNegativeInteger(read(hero, 'rank')),
    experience: optionalNonNegativeInteger(read(hero, 'experience')),
    profilePicture: optionalText(read(hero, 'profile_picture', 'profilePicture')),
    createdAt: optionalText(read(hero, 'created_at', 'createdAt')),
    estateId: optionalText(read(hero, 'estate_id', 'estateId')),
    userId: requiredText(read(hero, 'user_id', 'userId'), 'hero.user_id'),
    serverId: requiredText(read(hero, 'server_id', 'serverId'), 'hero.server_id'),
    characterPoints: requiredNonNegativeInteger(
      read(hero, 'character_points', 'characterPoints'),
      'hero.character_points',
    ),
    totalCharacterPointsEarned: requiredNonNegativeInteger(
      read(hero, 'total_character_points_earned', 'totalCharacterPointsEarned'),
      'hero.total_character_points_earned',
    ),
    totalExperienceEarned: requiredNonNegativeInteger(
      read(hero, 'total_experience_earned', 'totalExperienceEarned'),
      'hero.total_experience_earned',
    ),
  };
}

function mapCurrentEstate(
  estate: JsonRecord,
): PlayerVicinityCurrentEstateReadModel {
  const occupancyStatusKey = requiredText(
    read(estate, 'occupancyStatusKey'),
    'currentEstate.occupancyStatusKey',
  );

  if (occupancyStatusKey !== 'current') {
    throw new Error('currentEstate.occupancyStatusKey must be current.');
  }

  return {
    estateId: requiredText(read(estate, 'estateId'), 'currentEstate.estateId'),
    serverId: requiredText(read(estate, 'serverId'), 'currentEstate.serverId'),
    heroId: requiredText(read(estate, 'heroId'), 'currentEstate.heroId'),
    districtCode: optionalText(read(estate, 'districtCode')),
    districtLabel: optionalText(read(estate, 'districtLabel')),
    addressNumber: optionalPositiveInteger(read(estate, 'addressNumber')),
    address: optionalText(read(estate, 'address')),
    estateRank: optionalNonNegativeInteger(read(estate, 'estateRank')),
    occupancyStatusKey,
    occupancyLabel: requiredText(
      read(estate, 'occupancyLabel'),
      'currentEstate.occupancyLabel',
    ),
  };
}

function mapEstateSummary(
  estate: JsonRecord,
  fieldPath: string,
): PlayerVicinityEstateSummaryReadModel {
  return {
    heroId: requiredText(read(estate, 'heroId'), `${fieldPath}.heroId`),
    serverId: requiredText(read(estate, 'serverId'), `${fieldPath}.serverId`),
    estateId: requiredText(read(estate, 'estateId'), `${fieldPath}.estateId`),
    districtCode: optionalText(read(estate, 'districtCode')),
    districtLabel: optionalText(read(estate, 'districtLabel')),
    addressNumber: optionalPositiveInteger(read(estate, 'addressNumber')),
    address: optionalText(read(estate, 'address')),
    estateRank: optionalNonNegativeInteger(read(estate, 'estateRank')),
    settledCompletedCount: optionalNonNegativeInteger(
      read(estate, 'settledCompletedCount'),
    ),
    settledAsOf: optionalText(read(estate, 'settledAsOf')),
    activeJobJson: mapActiveJob(read(estate, 'activeJobJson'), `${fieldPath}.activeJobJson`),
    attackProtectionActive: optionalBoolean(read(estate, 'attackProtectionActive')),
    attackProtectionExpiresAt: optionalText(read(estate, 'attackProtectionExpiresAt')),
    attackProtectionSourceEntityType: optionalText(
      read(estate, 'attackProtectionSourceEntityType'),
    ),
    attackProtectionSourceEntityId: optionalText(
      read(estate, 'attackProtectionSourceEntityId'),
    ),
    siegeProtectionActive: optionalBoolean(read(estate, 'siegeProtectionActive')),
    siegeProtectionExpiresAt: optionalText(read(estate, 'siegeProtectionExpiresAt')),
    siegeProtectionSource: optionalText(read(estate, 'siegeProtectionSource')),
  };
}

function mapActiveJob(
  value: Json | undefined,
  fieldPath: string,
): PlayerVicinityActiveJobReadModel | null {
  if (value === null || value === undefined) {
    return null;
  }

  const job = requiredRecord(value, fieldPath);

  return {
    jobId: requiredText(read(job, 'jobId'), `${fieldPath}.jobId`),
    estateId: requiredText(read(job, 'estateId'), `${fieldPath}.estateId`),
    buildingId: requiredText(read(job, 'buildingId'), `${fieldPath}.buildingId`),
    buildingKey: requiredText(read(job, 'buildingKey'), `${fieldPath}.buildingKey`),
    buildingName: requiredText(read(job, 'buildingName'), `${fieldPath}.buildingName`),
    targetLevel: requiredNonNegativeInteger(
      read(job, 'targetLevel'),
      `${fieldPath}.targetLevel`,
    ),
    status: requiredText(read(job, 'status'), `${fieldPath}.status`),
    startedAt: requiredText(read(job, 'startedAt'), `${fieldPath}.startedAt`),
    completesAt: requiredText(read(job, 'completesAt'), `${fieldPath}.completesAt`),
    createdAt: requiredText(read(job, 'createdAt'), `${fieldPath}.createdAt`),
    updatedAt: requiredText(read(job, 'updatedAt'), `${fieldPath}.updatedAt`),
    secondsUntilCompletion: requiredNonNegativeInteger(
      read(job, 'secondsUntilCompletion'),
      `${fieldPath}.secondsUntilCompletion`,
    ),
    isDue: requiredBoolean(read(job, 'isDue'), `${fieldPath}.isDue`),
  };
}

function mapAddressCapacity(
  capacity: JsonRecord,
  index: number,
): PlayerVicinityAddressCapacityReadModel {
  const fieldPath = `addressCapacities[${index}]`;

  return {
    districtCode: requiredText(read(capacity, 'districtCode'), `${fieldPath}.districtCode`),
    displayLabel: requiredText(read(capacity, 'displayLabel'), `${fieldPath}.displayLabel`),
    addressCapacity: requiredPositiveInteger(
      read(capacity, 'addressCapacity'),
      `${fieldPath}.addressCapacity`,
    ),
    addressNumberStart: requiredPositiveInteger(
      read(capacity, 'addressNumberStart'),
      `${fieldPath}.addressNumberStart`,
    ),
    addressNumberEnd: requiredPositiveInteger(
      read(capacity, 'addressNumberEnd'),
      `${fieldPath}.addressNumberEnd`,
    ),
    firstAddress: requiredText(read(capacity, 'firstAddress'), `${fieldPath}.firstAddress`),
    lastAddress: requiredText(read(capacity, 'lastAddress'), `${fieldPath}.lastAddress`),
    sortOrder: requiredNonNegativeInteger(read(capacity, 'sortOrder'), `${fieldPath}.sortOrder`),
    isActive: requiredBoolean(read(capacity, 'isActive'), `${fieldPath}.isActive`),
  };
}

function mapOccupiedEstate(
  estate: JsonRecord,
  index: number,
): PlayerVicinityOccupiedEstateReadModel {
  const fieldPath = `occupiedEstates[${index}]`;

  return {
    estateId: requiredText(read(estate, 'estateId'), `${fieldPath}.estateId`),
    serverId: requiredText(read(estate, 'serverId'), `${fieldPath}.serverId`),
    heroId: requiredText(read(estate, 'heroId'), `${fieldPath}.heroId`),
    districtCode: optionalText(read(estate, 'districtCode')),
    districtLabel: optionalText(read(estate, 'districtLabel')),
    addressNumber: optionalPositiveInteger(read(estate, 'addressNumber')),
    address: optionalText(read(estate, 'address')),
    displayLabel: optionalText(read(estate, 'displayLabel')),
    estateRank: requiredNonNegativeInteger(read(estate, 'estateRank'), `${fieldPath}.estateRank`),
    isCurrentHeroEstate: requiredBoolean(
      read(estate, 'isCurrentHeroEstate'),
      `${fieldPath}.isCurrentHeroEstate`,
    ),
    occupancyStatusKey: requiredText(
      read(estate, 'occupancyStatusKey'),
      `${fieldPath}.occupancyStatusKey`,
    ),
    occupancyLabel: requiredText(
      read(estate, 'occupancyLabel'),
      `${fieldPath}.occupancyLabel`,
    ),
  };
}

function requiredPositiveInteger(value: Json | undefined, field: string): number {
  const number = optionalNumber(value);

  if (number === null || !Number.isInteger(number) || number < 1) {
    throw new Error(`${field} must be a positive integer.`);
  }

  return number;
}

function optionalPositiveInteger(value: Json | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error('optional positive integer must be a positive integer.');
  }

  return value;
}

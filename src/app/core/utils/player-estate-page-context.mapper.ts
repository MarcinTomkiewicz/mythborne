import {
  EstateBuildingBonusRow,
  EstateBuildingJob,
  EstateBuildingRow,
  EstateCopyJson,
  EstateRequirementRow,
  EstateResourceCostRow,
  EstateResourceRow,
  EstateRuntimeState,
  EstateUpgradePreview,
  PlayerEstateHeroRow,
  PlayerEstatePageContextV2,
} from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalNumber,
  optionalText,
  read,
  readPath,
  requiredArray,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';

const PLAYER_ESTATE_CONTRACT_VERSION = 'player_estate_page_context_v2';
const ESTATE_UPGRADE_PREVIEW_CONTRACT_VERSION = 'estate_building_upgrade_preview_v1';

export function mapPlayerEstatePageContext(
  value: Json,
): PlayerEstatePageContextV2 {
  const root = requiredRecord(value, 'get_player_estate_page_context');
  const contractVersion = requiredText(
    read(root, 'contractVersion'),
    'get_player_estate_page_context.contractVersion',
  );

  if (contractVersion !== PLAYER_ESTATE_CONTRACT_VERSION) {
    throw new Error(
      `get_player_estate_page_context.contractVersion must be ${PLAYER_ESTATE_CONTRACT_VERSION}.`,
    );
  }

  return {
    contractVersion,
    hero: mapHero(requiredRecord(read(root, 'hero'), 'hero')),
    copyJson: mapCopyJson(requiredRecord(read(root, 'copyJson'), 'copyJson')),
    estateRuntimeState: mapNullableRuntimeState(read(root, 'estateRuntimeState')),
  };
}

function mapHero(hero: JsonRecord): PlayerEstateHeroRow {
  return {
    id: requiredText(read(hero, 'id'), 'hero.id'),
    name: requiredText(read(hero, 'name'), 'hero.name'),
    level: optionalNumber(read(hero, 'level')),
    origin_id: optionalText(read(hero, 'origin_id')),
    rank: optionalNumber(read(hero, 'rank')),
    experience: optionalNumber(read(hero, 'experience')),
    profile_picture: optionalText(read(hero, 'profile_picture')),
    created_at: optionalText(read(hero, 'created_at')),
    estate_id: optionalText(read(hero, 'estate_id')),
    user_id: requiredText(read(hero, 'user_id'), 'hero.user_id'),
    server_id: requiredText(read(hero, 'server_id'), 'hero.server_id'),
    character_points: requiredNumber(
      read(hero, 'character_points'),
      'hero.character_points',
    ),
    total_character_points_earned: requiredNumber(
      read(hero, 'total_character_points_earned'),
      'hero.total_character_points_earned',
    ),
    total_experience_earned: requiredNumber(
      read(hero, 'total_experience_earned'),
      'hero.total_experience_earned',
    ),
  };
}

function mapCopyJson(copyJson: JsonRecord): EstateCopyJson {
  return {
    sections: {
      overview: requiredText(
        readPath(copyJson, 'sections', 'overview'),
        'copyJson.sections.overview',
      ),
      buildings: requiredText(
        readPath(copyJson, 'sections', 'buildings'),
        'copyJson.sections.buildings',
      ),
      resources: requiredText(
        readPath(copyJson, 'sections', 'resources'),
        'copyJson.sections.resources',
      ),
      requirements: requiredText(
        readPath(copyJson, 'sections', 'requirements'),
        'copyJson.sections.requirements',
      ),
      upgradePreview: requiredText(
        readPath(copyJson, 'sections', 'upgradePreview'),
        'copyJson.sections.upgradePreview',
      ),
      bonuses: requiredText(
        readPath(copyJson, 'sections', 'bonuses'),
        'copyJson.sections.bonuses',
      ),
    },
    summary: {
      address: requiredText(
        readPath(copyJson, 'summary', 'address'),
        'copyJson.summary.address',
      ),
      district: requiredText(
        readPath(copyJson, 'summary', 'district'),
        'copyJson.summary.district',
      ),
      rank: requiredText(
        readPath(copyJson, 'summary', 'rank'),
        'copyJson.summary.rank',
      ),
      buildingsReady: requiredText(
        readPath(copyJson, 'summary', 'buildingsReady'),
        'copyJson.summary.buildingsReady',
      ),
      activeJob: requiredText(
        readPath(copyJson, 'summary', 'activeJob'),
        'copyJson.summary.activeJob',
      ),
    },
    actions: {
      upgrade: requiredText(
        readPath(copyJson, 'actions', 'upgrade'),
        'copyJson.actions.upgrade',
      ),
      details: requiredText(
        readPath(copyJson, 'actions', 'details'),
        'copyJson.actions.details',
      ),
      openProgressionPreview: requiredText(
        readPath(copyJson, 'actions', 'openProgressionPreview'),
        'copyJson.actions.openProgressionPreview',
      ),
      closeProgressionPreview: requiredText(
        readPath(copyJson, 'actions', 'closeProgressionPreview'),
        'copyJson.actions.closeProgressionPreview',
      ),
    },
    empty: {
      buildings: requiredText(
        readPath(copyJson, 'empty', 'buildings'),
        'copyJson.empty.buildings',
      ),
      requirements: requiredText(
        readPath(copyJson, 'empty', 'requirements'),
        'copyJson.empty.requirements',
      ),
      bonuses: requiredText(
        readPath(copyJson, 'empty', 'bonuses'),
        'copyJson.empty.bonuses',
      ),
      activeJob: requiredText(
        readPath(copyJson, 'empty', 'activeJob'),
        'copyJson.empty.activeJob',
      ),
    },
    labels: {
      currentLevel: requiredText(
        readPath(copyJson, 'labels', 'currentLevel'),
        'copyJson.labels.currentLevel',
      ),
      nextLevel: requiredText(
        readPath(copyJson, 'labels', 'nextLevel'),
        'copyJson.labels.nextLevel',
      ),
      maxLevel: requiredText(
        readPath(copyJson, 'labels', 'maxLevel'),
        'copyJson.labels.maxLevel',
      ),
      buildTime: requiredText(
        readPath(copyJson, 'labels', 'buildTime'),
        'copyJson.labels.buildTime',
      ),
      availableInDistrict: requiredText(
        readPath(copyJson, 'labels', 'availableInDistrict'),
        'copyJson.labels.availableInDistrict',
      ),
    },
  };
}

function mapNullableRuntimeState(value: Json | undefined): EstateRuntimeState | null {
  if (value === null) {
    return null;
  }

  return mapRuntimeState(requiredRecord(value, 'estateRuntimeState'));
}

function mapRuntimeState(runtime: JsonRecord): EstateRuntimeState {
  const activeJob = mapOptionalJob(read(runtime, 'active_job_json'));
  const attackProtectionExpiresAt = optionalText(read(runtime, 'attack_protection_expires_at'));
  const attackProtectionSourceEntityType = optionalText(
    read(runtime, 'attack_protection_source_entity_type'),
  );
  const attackProtectionSourceEntityId = optionalText(
    read(runtime, 'attack_protection_source_entity_id'),
  );
  const siegeProtectionExpiresAt = optionalText(read(runtime, 'siege_protection_expires_at'));
  const siegeProtectionSource = optionalText(read(runtime, 'siege_protection_source'));

  const runtimeState: EstateRuntimeState = {
    hero_id: requiredText(read(runtime, 'hero_id'), 'estateRuntimeState.hero_id'),
    server_id: requiredText(read(runtime, 'server_id'), 'estateRuntimeState.server_id'),
    estate_id: requiredText(read(runtime, 'estate_id'), 'estateRuntimeState.estate_id'),
    district_code: requiredText(
      read(runtime, 'district_code'),
      'estateRuntimeState.district_code',
    ),
    address_number: requiredNumber(
      read(runtime, 'address_number'),
      'estateRuntimeState.address_number',
    ),
    address: requiredText(read(runtime, 'address'), 'estateRuntimeState.address'),
    estate_rank: requiredNumber(
      read(runtime, 'estate_rank'),
      'estateRuntimeState.estate_rank',
    ),
    settled_completed_count: requiredNumber(
      read(runtime, 'settled_completed_count'),
      'estateRuntimeState.settled_completed_count',
    ),
    settled_as_of: requiredText(
      read(runtime, 'settled_as_of'),
      'estateRuntimeState.settled_as_of',
    ),
    recent_jobs_json: requiredArray(
      read(runtime, 'recent_jobs_json'),
      'estateRuntimeState.recent_jobs_json',
    ).map((row, index) => mapJob(row, `estateRuntimeState.recent_jobs_json[${index}]`)),
    resources_json: requiredArray(
      read(runtime, 'resources_json'),
      'estateRuntimeState.resources_json',
    ).map((row, index) =>
      mapResource(row, `estateRuntimeState.resources_json[${index}]`),
    ),
    buildings_json: requiredArray(
      read(runtime, 'buildings_json'),
      'estateRuntimeState.buildings_json',
    ).map((row, index) =>
      mapBuilding(row, `estateRuntimeState.buildings_json[${index}]`),
    ),
    attack_protection_active: requiredBoolean(
      read(runtime, 'attack_protection_active'),
      'estateRuntimeState.attack_protection_active',
    ),
    siege_protection_active: requiredBoolean(
      read(runtime, 'siege_protection_active'),
      'estateRuntimeState.siege_protection_active',
    ),
  };

  if (activeJob !== undefined) {
    runtimeState.active_job_json = activeJob;
  }

  if (attackProtectionExpiresAt !== null) {
    runtimeState.attack_protection_expires_at = attackProtectionExpiresAt;
  }

  if (attackProtectionSourceEntityType !== null) {
    runtimeState.attack_protection_source_entity_type = attackProtectionSourceEntityType;
  }

  if (attackProtectionSourceEntityId !== null) {
    runtimeState.attack_protection_source_entity_id = attackProtectionSourceEntityId;
  }

  if (siegeProtectionExpiresAt !== null) {
    runtimeState.siege_protection_expires_at = siegeProtectionExpiresAt;
  }

  if (siegeProtectionSource !== null) {
    runtimeState.siege_protection_source = siegeProtectionSource;
  }

  return runtimeState;
}

function mapOptionalJob(value: Json | undefined): EstateBuildingJob | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  return mapJob(requiredRecord(value, 'estateRuntimeState.active_job_json'), 'estateRuntimeState.active_job_json');
}

function mapJob(job: JsonRecord, field: string): EstateBuildingJob {
  return {
    jobId: requiredText(read(job, 'jobId'), `${field}.jobId`),
    estateId: requiredText(read(job, 'estateId'), `${field}.estateId`),
    buildingId: requiredText(read(job, 'buildingId'), `${field}.buildingId`),
    buildingKey: optionalText(read(job, 'buildingKey')),
    buildingName: optionalText(read(job, 'buildingName')),
    targetLevel: requiredNumber(read(job, 'targetLevel'), `${field}.targetLevel`),
    status: requiredText(read(job, 'status'), `${field}.status`),
    startedAt: requiredText(read(job, 'startedAt'), `${field}.startedAt`),
    completesAt: requiredText(read(job, 'completesAt'), `${field}.completesAt`),
    createdAt: requiredText(read(job, 'createdAt'), `${field}.createdAt`),
    updatedAt: requiredText(read(job, 'updatedAt'), `${field}.updatedAt`),
    secondsUntilCompletion: requiredNumber(
      read(job, 'secondsUntilCompletion'),
      `${field}.secondsUntilCompletion`,
    ),
    isDue: requiredBoolean(read(job, 'isDue'), `${field}.isDue`),
  };
}

function mapResource(resource: JsonRecord, field: string): EstateResourceRow {
  return {
    resourceId: requiredText(read(resource, 'resourceId'), `${field}.resourceId`),
    heroId: requiredText(read(resource, 'heroId'), `${field}.heroId`),
    resourceType: requiredText(read(resource, 'resourceType'), `${field}.resourceType`),
    amount: requiredNumber(read(resource, 'amount'), `${field}.amount`),
    perHour: requiredNumber(read(resource, 'perHour'), `${field}.perHour`),
    updatedAt: requiredText(read(resource, 'updatedAt'), `${field}.updatedAt`),
    dbNow: requiredText(read(resource, 'dbNow'), `${field}.dbNow`),
    elapsedHours: requiredNumber(read(resource, 'elapsedHours'), `${field}.elapsedHours`),
    naiveLiveAmountIfAccrued: requiredNumber(
      read(resource, 'naiveLiveAmountIfAccrued'),
      `${field}.naiveLiveAmountIfAccrued`,
    ),
    displayLabel: requiredText(read(resource, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(resource, 'displayValue'), `${field}.displayValue`),
  };
}

function mapBuilding(building: JsonRecord, field: string): EstateBuildingRow {
  const buildingDescription = optionalText(read(building, 'buildingDescription'));
  const row: EstateBuildingRow = {
    buildingId: requiredText(read(building, 'buildingId'), `${field}.buildingId`),
    buildingKey: requiredText(read(building, 'buildingKey'), `${field}.buildingKey`),
    buildingName: requiredText(read(building, 'buildingName'), `${field}.buildingName`),
    districtCode: requiredText(read(building, 'districtCode'), `${field}.districtCode`),
    level: requiredNumber(read(building, 'level'), `${field}.level`),
    currentLevel: requiredNumber(read(building, 'currentLevel'), `${field}.currentLevel`),
    targetLevel: requiredNumber(read(building, 'targetLevel'), `${field}.targetLevel`),
    nextLevel: requiredNumber(read(building, 'nextLevel'), `${field}.nextLevel`),
    startingLevel: requiredNumber(read(building, 'startingLevel'), `${field}.startingLevel`),
    maxLevel: requiredNumber(read(building, 'maxLevel'), `${field}.maxLevel`),
    effectiveMaxLevel: requiredNumber(
      read(building, 'effectiveMaxLevel'),
      `${field}.effectiveMaxLevel`,
    ),
    isAtMaxLevel: requiredBoolean(read(building, 'isAtMaxLevel'), `${field}.isAtMaxLevel`),
    isAvailableInEstateDistrict: requiredBoolean(
      read(building, 'isAvailableInEstateDistrict'),
      `${field}.isAvailableInEstateDistrict`,
    ),
    resourceCostsJson: requiredArray(
      read(building, 'resourceCostsJson'),
      `${field}.resourceCostsJson`,
    ).map((row, index) => mapCost(row, `${field}.resourceCostsJson[${index}]`)),
    requirementsJson: requiredArray(
      read(building, 'requirementsJson'),
      `${field}.requirementsJson`,
    ).map((row, index) =>
      mapRequirement(row, `${field}.requirementsJson[${index}]`),
    ),
    bonusesJson: requiredArray(read(building, 'bonusesJson'), `${field}.bonusesJson`)
      .map((row, index) => mapBonus(row, `${field}.bonusesJson[${index}]`)),
    upgradePreviewJson: mapUpgradePreview(
      requiredRecord(read(building, 'upgradePreviewJson'), `${field}.upgradePreviewJson`),
      `${field}.upgradePreviewJson`,
    ),
  };

  if (buildingDescription !== null) {
    row.buildingDescription = buildingDescription;
  }

  return row;
}

function mapCost(cost: JsonRecord, field: string): EstateResourceCostRow {
  return {
    resourceType: requiredText(read(cost, 'resourceType'), `${field}.resourceType`),
    amount: requiredNumber(read(cost, 'amount'), `${field}.amount`),
    displayLabel: requiredText(read(cost, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(cost, 'displayValue'), `${field}.displayValue`),
    sortOrder: requiredNumber(read(cost, 'sortOrder'), `${field}.sortOrder`),
  };
}

function mapRequirement(requirement: JsonRecord, field: string): EstateRequirementRow {
  const requiredStatKey = optionalText(read(requirement, 'requiredStatKey'));
  const requiredBuildingKey = optionalText(read(requirement, 'requiredBuildingKey'));
  const requiredResourceType = optionalText(read(requirement, 'requiredResourceType'));
  const requiredDistrictCode = optionalText(read(requirement, 'requiredDistrictCode'));
  const context = optionalText(read(requirement, 'context'));
  const displayValue = optionalText(read(requirement, 'displayValue'));
  const displayUnit = optionalText(read(requirement, 'displayUnit'));

  const row: EstateRequirementRow = {
    entityRequirementId: requiredText(
      read(requirement, 'entityRequirementId'),
      `${field}.entityRequirementId`,
    ),
    requirementDefinitionKey: requiredText(
      read(requirement, 'requirementDefinitionKey'),
      `${field}.requirementDefinitionKey`,
    ),
    requiredValue: requiredNumber(read(requirement, 'requiredValue'), `${field}.requiredValue`),
    sortOrder: requiredNumber(read(requirement, 'sortOrder'), `${field}.sortOrder`),
    displayLabel: requiredText(read(requirement, 'displayLabel'), `${field}.displayLabel`),
  };

  if (requiredStatKey !== null) {
    row.requiredStatKey = requiredStatKey;
  }

  if (requiredBuildingKey !== null) {
    row.requiredBuildingKey = requiredBuildingKey;
  }

  if (requiredResourceType !== null) {
    row.requiredResourceType = requiredResourceType;
  }

  if (requiredDistrictCode !== null) {
    row.requiredDistrictCode = requiredDistrictCode;
  }

  if (context !== null) {
    row.context = context;
  }

  if (displayValue !== null) {
    row.displayValue = displayValue;
  }

  if (displayUnit !== null) {
    row.displayUnit = displayUnit;
  }

  return row;
}

function mapBonus(bonus: JsonRecord, field: string): EstateBuildingBonusRow {
  const targetDescription = optionalText(read(bonus, 'targetDescription'));
  const targetHelperText = optionalText(read(bonus, 'targetHelperText'));
  const row: EstateBuildingBonusRow = {
    entityBonusId: requiredText(read(bonus, 'entityBonusId'), `${field}.entityBonusId`),
    targetKey: requiredText(read(bonus, 'targetKey'), `${field}.targetKey`),
    typeKey: requiredText(read(bonus, 'typeKey'), `${field}.typeKey`),
    scopeKey: requiredText(read(bonus, 'scopeKey'), `${field}.scopeKey`),
    targetLabel: requiredText(read(bonus, 'targetLabel'), `${field}.targetLabel`),
    currentLevel: requiredNumber(read(bonus, 'currentLevel'), `${field}.currentLevel`),
    nextLevel: requiredNumber(read(bonus, 'nextLevel'), `${field}.nextLevel`),
    currentValue: requiredNumber(read(bonus, 'currentValue'), `${field}.currentValue`),
    nextValue: requiredNumber(read(bonus, 'nextValue'), `${field}.nextValue`),
    delta: requiredNumber(read(bonus, 'delta'), `${field}.delta`),
    displayValue: requiredText(read(bonus, 'displayValue'), `${field}.displayValue`),
    nextDisplayValue: requiredText(
      read(bonus, 'nextDisplayValue'),
      `${field}.nextDisplayValue`,
    ),
    deltaDisplayValue: requiredText(
      read(bonus, 'deltaDisplayValue'),
      `${field}.deltaDisplayValue`,
    ),
    displayText: requiredText(read(bonus, 'displayText'), `${field}.displayText`),
    nextDisplayText: requiredText(
      read(bonus, 'nextDisplayText'),
      `${field}.nextDisplayText`,
    ),
    deltaDisplayText: requiredText(
      read(bonus, 'deltaDisplayText'),
      `${field}.deltaDisplayText`,
    ),
  };

  if (targetDescription !== null) {
    row.targetDescription = targetDescription;
  }

  if (targetHelperText !== null) {
    row.targetHelperText = targetHelperText;
  }

  return row;
}

function mapUpgradePreview(preview: JsonRecord, field: string): EstateUpgradePreview {
  const contractVersion = requiredText(
    read(preview, 'contractVersion'),
    `${field}.contractVersion`,
  );

  if (contractVersion !== ESTATE_UPGRADE_PREVIEW_CONTRACT_VERSION) {
    throw new Error(
      `${field}.contractVersion must be ${ESTATE_UPGRADE_PREVIEW_CONTRACT_VERSION}.`,
    );
  }

  return {
    contractVersion,
    currentLevel: requiredNumber(read(preview, 'currentLevel'), `${field}.currentLevel`),
    targetLevel: requiredNumber(read(preview, 'targetLevel'), `${field}.targetLevel`),
    nextLevel: requiredNumber(read(preview, 'nextLevel'), `${field}.nextLevel`),
    isAtMaxLevel: requiredBoolean(read(preview, 'isAtMaxLevel'), `${field}.isAtMaxLevel`),
    effectiveMaxLevel: requiredNumber(
      read(preview, 'effectiveMaxLevel'),
      `${field}.effectiveMaxLevel`,
    ),
    buildTimeSeconds: requiredNumber(
      read(preview, 'buildTimeSeconds'),
      `${field}.buildTimeSeconds`,
    ),
    resourceCostsJson: requiredArray(
      read(preview, 'resourceCostsJson'),
      `${field}.resourceCostsJson`,
    ).map((row, index) => mapCost(row, `${field}.resourceCostsJson[${index}]`)),
    requirementsJson: requiredArray(
      read(preview, 'requirementsJson'),
      `${field}.requirementsJson`,
    ).map((row, index) =>
      mapRequirement(row, `${field}.requirementsJson[${index}]`),
    ),
    bonusesJson: requiredArray(read(preview, 'bonusesJson'), `${field}.bonusesJson`)
      .map((row, index) => mapBonus(row, `${field}.bonusesJson[${index}]`)),
  };
}

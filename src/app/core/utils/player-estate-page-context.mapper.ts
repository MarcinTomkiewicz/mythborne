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
  PlayerEstatePageContextV3,
} from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import {
  JsonRecord,
  optionalBoolean,
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

const PLAYER_ESTATE_CONTRACT_VERSION = 'player_estate_page_context_v3';
const ESTATE_UPGRADE_PREVIEW_CONTRACT_VERSION = 'estate_building_upgrade_preview_v2';

export function mapPlayerEstatePageContext(
  value: Json,
): PlayerEstatePageContextV3 {
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
  const mapped: EstateCopyJson = {
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
    },
    summary: {
      district: requiredText(
        readPath(copyJson, 'summary', 'district'),
        'copyJson.summary.district',
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
    },
    empty: {
      buildings: requiredText(
        readPath(copyJson, 'empty', 'buildings'),
        'copyJson.empty.buildings',
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
      buildTime: requiredText(
        readPath(copyJson, 'labels', 'buildTime'),
        'copyJson.labels.buildTime',
      ),
    },
  };

  assignText(mapped.sections, 'requirements', optionalText(readPath(copyJson, 'sections', 'requirements')));
  assignText(mapped.sections, 'upgradePreview', optionalText(readPath(copyJson, 'sections', 'upgradePreview')));
  assignText(mapped.sections, 'bonuses', optionalText(readPath(copyJson, 'sections', 'bonuses')));
  assignText(mapped.summary, 'address', optionalText(readPath(copyJson, 'summary', 'address')));
  assignText(mapped.summary, 'rank', optionalText(readPath(copyJson, 'summary', 'rank')));
  assignText(mapped.summary, 'buildingsReady', optionalText(readPath(copyJson, 'summary', 'buildingsReady')));
  assignText(mapped.empty, 'requirements', optionalText(readPath(copyJson, 'empty', 'requirements')));
  assignText(mapped.labels, 'maxLevel', optionalText(readPath(copyJson, 'labels', 'maxLevel')));
  assignText(
    mapped.labels,
    'availableInDistrict',
    optionalText(readPath(copyJson, 'labels', 'availableInDistrict')),
  );

  return mapped;
}

function mapNullableRuntimeState(value: Json | undefined): EstateRuntimeState | null {
  if (value === null) {
    return null;
  }

  return mapRuntimeState(requiredRecord(value, 'estateRuntimeState'));
}

function mapRuntimeState(runtime: JsonRecord): EstateRuntimeState {
  const row: EstateRuntimeState = {
    hero_id: requiredText(read(runtime, 'hero_id'), 'estateRuntimeState.hero_id'),
    server_id: requiredText(read(runtime, 'server_id'), 'estateRuntimeState.server_id'),
    estate_id: requiredText(read(runtime, 'estate_id'), 'estateRuntimeState.estate_id'),
    district_code: requiredText(
      read(runtime, 'district_code'),
      'estateRuntimeState.district_code',
    ),
    active_job_json: mapOptionalJob(read(runtime, 'active_job_json')),
    recent_jobs_json: requiredArray(
      read(runtime, 'recent_jobs_json'),
      'estateRuntimeState.recent_jobs_json',
    ).map((job, index) => mapJob(job, `estateRuntimeState.recent_jobs_json[${index}]`)),
    resources_json: requiredArray(
      read(runtime, 'resources_json'),
      'estateRuntimeState.resources_json',
    ).map((resource, index) =>
      mapResource(resource, `estateRuntimeState.resources_json[${index}]`),
    ),
    buildings_json: requiredArray(
      read(runtime, 'buildings_json'),
      'estateRuntimeState.buildings_json',
    ).map((building, index) =>
      mapBuilding(building, `estateRuntimeState.buildings_json[${index}]`),
    ),
  };

  assignNumber(row, 'address_number', optionalNumber(read(runtime, 'address_number')));
  assignText(row, 'address', optionalText(read(runtime, 'address')));
  assignNumber(row, 'estate_rank', optionalNumber(read(runtime, 'estate_rank')));
  assignNumber(
    row,
    'settled_completed_count',
    optionalNumber(read(runtime, 'settled_completed_count')),
  );
  assignText(row, 'settled_as_of', optionalText(read(runtime, 'settled_as_of')));
  assignBoolean(
    row,
    'attack_protection_active',
    optionalBoolean(read(runtime, 'attack_protection_active')),
  );
  assignText(
    row,
    'attack_protection_expires_at',
    optionalText(read(runtime, 'attack_protection_expires_at')),
  );
  assignText(
    row,
    'attack_protection_source_entity_type',
    optionalText(read(runtime, 'attack_protection_source_entity_type')),
  );
  assignText(
    row,
    'attack_protection_source_entity_id',
    optionalText(read(runtime, 'attack_protection_source_entity_id')),
  );
  assignBoolean(
    row,
    'siege_protection_active',
    optionalBoolean(read(runtime, 'siege_protection_active')),
  );
  assignText(
    row,
    'siege_protection_expires_at',
    optionalText(read(runtime, 'siege_protection_expires_at')),
  );
  assignText(row, 'siege_protection_source', optionalText(read(runtime, 'siege_protection_source')));

  return row;
}

function mapOptionalJob(value: Json | undefined): EstateBuildingJob | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapJob(
    requiredRecord(value, 'estateRuntimeState.active_job_json'),
    'estateRuntimeState.active_job_json',
  );
}

function mapJob(job: JsonRecord, field: string): EstateBuildingJob {
  const row: EstateBuildingJob = {
    jobId: requiredText(read(job, 'jobId'), `${field}.jobId`),
    estateId: requiredText(read(job, 'estateId'), `${field}.estateId`),
    buildingId: requiredText(read(job, 'buildingId'), `${field}.buildingId`),
    targetLevel: requiredNumber(read(job, 'targetLevel'), `${field}.targetLevel`),
    status: requiredText(read(job, 'status'), `${field}.status`),
  };

  assignText(row, 'buildingKey', optionalText(read(job, 'buildingKey')));
  assignText(row, 'buildingName', optionalText(read(job, 'buildingName')));
  assignText(row, 'startedAt', optionalText(read(job, 'startedAt')));
  assignText(row, 'completesAt', optionalText(read(job, 'completesAt')));
  assignText(row, 'createdAt', optionalText(read(job, 'createdAt')));
  assignText(row, 'updatedAt', optionalText(read(job, 'updatedAt')));
  assignNumber(
    row,
    'secondsUntilCompletion',
    optionalNumber(read(job, 'secondsUntilCompletion')),
  );
  assignBoolean(row, 'isDue', optionalBoolean(read(job, 'isDue')));

  return row;
}

function mapResource(resource: JsonRecord, field: string): EstateResourceRow {
  const row: EstateResourceRow = {
    resourceType: requiredText(read(resource, 'resourceType'), `${field}.resourceType`),
    displayLabel: requiredText(read(resource, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(resource, 'displayValue'), `${field}.displayValue`),
  };

  assignText(row, 'resourceId', optionalText(read(resource, 'resourceId')));
  assignText(row, 'heroId', optionalText(read(resource, 'heroId')));
  assignNumber(row, 'amount', optionalNumber(read(resource, 'amount')));
  assignNumber(row, 'perHour', optionalNumber(read(resource, 'perHour')));
  assignText(row, 'updatedAt', optionalText(read(resource, 'updatedAt')));
  assignText(row, 'dbNow', optionalText(read(resource, 'dbNow')));
  assignNumber(row, 'elapsedHours', optionalNumber(read(resource, 'elapsedHours')));
  assignNumber(
    row,
    'naiveLiveAmountIfAccrued',
    optionalNumber(read(resource, 'naiveLiveAmountIfAccrued')),
  );

  return row;
}

function mapBuilding(building: JsonRecord, field: string): EstateBuildingRow {
  const row: EstateBuildingRow = {
    buildingId: requiredText(read(building, 'buildingId'), `${field}.buildingId`),
    buildingKey: requiredText(read(building, 'buildingKey'), `${field}.buildingKey`),
    buildingName: requiredText(read(building, 'buildingName'), `${field}.buildingName`),
    level: requiredNumber(read(building, 'level'), `${field}.level`),
    currentLevel: requiredNumber(read(building, 'currentLevel'), `${field}.currentLevel`),
    targetLevel: requiredNumber(read(building, 'targetLevel'), `${field}.targetLevel`),
    nextLevel: requiredNumber(read(building, 'nextLevel'), `${field}.nextLevel`),
    resourceCostsJson: requiredArray(
      read(building, 'resourceCostsJson'),
      `${field}.resourceCostsJson`,
    ).map((cost, index) => mapCost(cost, `${field}.resourceCostsJson[${index}]`)),
    requirementsJson: requiredArray(
      read(building, 'requirementsJson'),
      `${field}.requirementsJson`,
    ).map((requirement, index) =>
      mapRequirement(requirement, `${field}.requirementsJson[${index}]`),
    ),
    bonusesJson: requiredArray(read(building, 'bonusesJson'), `${field}.bonusesJson`)
      .map((bonus, index) => mapBonus(bonus, `${field}.bonusesJson[${index}]`)),
    upgradePreviewJson: mapNullableUpgradePreview(
      read(building, 'upgradePreviewJson'),
      `${field}.upgradePreviewJson`,
    ),
    meetsRequirements: requiredBoolean(
      read(building, 'meetsRequirements'),
      `${field}.meetsRequirements`,
    ),
    requirementCount: requiredNumber(read(building, 'requirementCount'), `${field}.requirementCount`),
    unmetCount: requiredNumber(read(building, 'unmetCount'), `${field}.unmetCount`),
    requirementFailuresJson: requiredArray(
      read(building, 'requirementFailuresJson'),
      `${field}.requirementFailuresJson`,
    ).map((requirement, index) =>
      mapRequirement(requirement, `${field}.requirementFailuresJson[${index}]`),
    ),
  };

  assignText(row, 'buildingDescription', optionalText(read(building, 'buildingDescription')));
  assignText(row, 'districtCode', optionalText(read(building, 'districtCode')));
  assignNumber(row, 'startingLevel', optionalNumber(read(building, 'startingLevel')));
  assignNumber(row, 'maxLevel', optionalNumber(read(building, 'maxLevel')));
  assignNumber(row, 'effectiveMaxLevel', optionalNumber(read(building, 'effectiveMaxLevel')));
  assignBoolean(row, 'isAtMaxLevel', optionalBoolean(read(building, 'isAtMaxLevel')));
  assignBoolean(
    row,
    'isAvailableInEstateDistrict',
    optionalBoolean(read(building, 'isAvailableInEstateDistrict')),
  );

  return row;
}

function mapCost(cost: JsonRecord, field: string): EstateResourceCostRow {
  const row: EstateResourceCostRow = {
    resourceType: requiredText(read(cost, 'resourceType'), `${field}.resourceType`),
    amount: requiredNumber(read(cost, 'amount'), `${field}.amount`),
    displayLabel: requiredText(read(cost, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(cost, 'displayValue'), `${field}.displayValue`),
  };

  assignNumber(row, 'sortOrder', optionalNumber(read(cost, 'sortOrder')));

  return row;
}

function mapRequirement(requirement: JsonRecord, field: string): EstateRequirementRow {
  const row: EstateRequirementRow = {
    entityRequirementId: requiredText(
      read(requirement, 'entityRequirementId'),
      `${field}.entityRequirementId`,
    ),
    requirementDefinitionKey: requiredText(
      read(requirement, 'requirementDefinitionKey'),
      `${field}.requirementDefinitionKey`,
    ),
    displayLabel: requiredText(read(requirement, 'displayLabel'), `${field}.displayLabel`),
    displayValue: requiredText(read(requirement, 'displayValue'), `${field}.displayValue`),
    isMet: requiredBoolean(read(requirement, 'isMet'), `${field}.isMet`),
    statusKey: requiredText(read(requirement, 'statusKey'), `${field}.statusKey`),
    displayTone: requiredText(read(requirement, 'displayTone'), `${field}.displayTone`),
  };

  assignNumber(row, 'requiredValue', optionalNumber(read(requirement, 'requiredValue')));
  assignText(row, 'requiredStatKey', optionalText(read(requirement, 'requiredStatKey')));
  assignText(row, 'requiredBuildingKey', optionalText(read(requirement, 'requiredBuildingKey')));
  assignText(row, 'requiredResourceType', optionalText(read(requirement, 'requiredResourceType')));
  assignText(row, 'requiredDistrictCode', optionalText(read(requirement, 'requiredDistrictCode')));
  assignText(row, 'context', optionalText(read(requirement, 'context')));
  assignNumber(row, 'sortOrder', optionalNumber(read(requirement, 'sortOrder')));
  assignText(row, 'displayUnit', optionalText(read(requirement, 'displayUnit')));
  assignNumber(row, 'currentValue', optionalNumber(read(requirement, 'currentValue')));
  assignText(row, 'currentDisplayValue', optionalText(read(requirement, 'currentDisplayValue')));
  assignNumber(row, 'missingValue', optionalNumber(read(requirement, 'missingValue')));
  assignText(row, 'missingDisplayValue', optionalText(read(requirement, 'missingDisplayValue')));
  assignText(row, 'failureReasonKey', optionalText(read(requirement, 'failureReasonKey')));
  assignText(row, 'failureReasonLabel', optionalText(read(requirement, 'failureReasonLabel')));
  assignText(row, 'valueSource', optionalText(read(requirement, 'valueSource')));

  return row;
}

function mapBonus(bonus: JsonRecord, field: string): EstateBuildingBonusRow {
  const row: EstateBuildingBonusRow = {
    entityBonusId: requiredText(read(bonus, 'entityBonusId'), `${field}.entityBonusId`),
    targetKey: requiredText(read(bonus, 'targetKey'), `${field}.targetKey`),
    typeKey: requiredText(read(bonus, 'typeKey'), `${field}.typeKey`),
    scopeKey: requiredText(read(bonus, 'scopeKey'), `${field}.scopeKey`),
  };

  assignText(row, 'targetLabel', optionalText(read(bonus, 'targetLabel')));
  assignText(row, 'targetDescription', optionalText(read(bonus, 'targetDescription')));
  assignText(row, 'targetHelperText', optionalText(read(bonus, 'targetHelperText')));
  assignNumber(row, 'currentLevel', optionalNumber(read(bonus, 'currentLevel')));
  assignNumber(row, 'nextLevel', optionalNumber(read(bonus, 'nextLevel')));
  assignNumber(row, 'currentValue', optionalNumber(read(bonus, 'currentValue')));
  assignNumber(row, 'nextValue', optionalNumber(read(bonus, 'nextValue')));
  assignNumber(row, 'delta', optionalNumber(read(bonus, 'delta')));
  assignText(row, 'displayValue', optionalText(read(bonus, 'displayValue')));
  assignText(row, 'nextDisplayValue', optionalText(read(bonus, 'nextDisplayValue')));
  assignText(row, 'deltaDisplayValue', optionalText(read(bonus, 'deltaDisplayValue')));
  assignText(row, 'displayText', optionalText(read(bonus, 'displayText')));
  assignText(row, 'nextDisplayText', optionalText(read(bonus, 'nextDisplayText')));
  assignText(row, 'deltaDisplayText', optionalText(read(bonus, 'deltaDisplayText')));

  return row;
}

function mapNullableUpgradePreview(
  value: Json | undefined,
  field: string,
): EstateUpgradePreview | null {
  if (value === undefined || value === null) {
    return null;
  }

  return mapUpgradePreview(requiredRecord(value, field), field);
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

  const row: EstateUpgradePreview = {
    contractVersion,
    currentLevel: requiredNumber(read(preview, 'currentLevel'), `${field}.currentLevel`),
    targetLevel: requiredNumber(read(preview, 'targetLevel'), `${field}.targetLevel`),
    nextLevel: requiredNumber(read(preview, 'nextLevel'), `${field}.nextLevel`),
    resourceCostsJson: requiredArray(
      read(preview, 'resourceCostsJson'),
      `${field}.resourceCostsJson`,
    ).map((cost, index) => mapCost(cost, `${field}.resourceCostsJson[${index}]`)),
    requirementsJson: requiredArray(
      read(preview, 'requirementsJson'),
      `${field}.requirementsJson`,
    ).map((requirement, index) =>
      mapRequirement(requirement, `${field}.requirementsJson[${index}]`),
    ),
    bonusesJson: requiredArray(read(preview, 'bonusesJson'), `${field}.bonusesJson`)
      .map((bonus, index) => mapBonus(bonus, `${field}.bonusesJson[${index}]`)),
    meetsRequirements: requiredBoolean(
      read(preview, 'meetsRequirements'),
      `${field}.meetsRequirements`,
    ),
    requirementCount: requiredNumber(read(preview, 'requirementCount'), `${field}.requirementCount`),
    unmetCount: requiredNumber(read(preview, 'unmetCount'), `${field}.unmetCount`),
    failuresJson: requiredArray(
      read(preview, 'failuresJson'),
      `${field}.failuresJson`,
    ).map((requirement, index) => mapRequirement(requirement, `${field}.failuresJson[${index}]`)),
  };

  assignBoolean(row, 'isAtMaxLevel', optionalBoolean(read(preview, 'isAtMaxLevel')));
  assignNumber(row, 'effectiveMaxLevel', optionalNumber(read(preview, 'effectiveMaxLevel')));
  assignNumber(row, 'buildTimeSeconds', optionalNumber(read(preview, 'buildTimeSeconds')));

  return row;
}

function assignText<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: string | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}

function assignNumber<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: number | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}

function assignBoolean<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: boolean | null,
): void {
  if (value !== null) {
    target[key] = value as T[K];
  }
}

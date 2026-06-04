import {
  EstateBuildingGroupRow,
  EstateBuildingRow,
  EstateUpgradePreview,
} from '../domain/estate/player-estate-page-context.model';
import { Json } from '../types/database.types';
import { assignBoolean, assignNumber, assignText } from './json-assign';
import {
  JsonRecord,
  optionalBoolean,
  optionalNumber,
  optionalText,
  read,
  requiredArray,
  requiredBoolean,
  requiredNumber,
  requiredRecord,
  requiredText,
} from './json-read';
import { mapBonus } from './player-estate-bonus.mapper';
import { mapCost } from './player-estate-resource.mapper';
import { mapRequirement } from './player-estate-requirement.mapper';

const ESTATE_UPGRADE_PREVIEW_CONTRACT_VERSION = 'estate_building_upgrade_preview_v2';

export function mapBuildingGroup(group: JsonRecord, field: string): EstateBuildingGroupRow {
  const row: EstateBuildingGroupRow = {
    groupKey: requiredText(read(group, 'groupKey'), `${field}.groupKey`),
    groupTitle: requiredText(read(group, 'groupTitle'), `${field}.groupTitle`),
    displayLabel: requiredText(read(group, 'displayLabel'), `${field}.displayLabel`),
    buildingCount: requiredNumber(read(group, 'buildingCount'), `${field}.buildingCount`),
    buildingsJson: requiredArray(
      read(group, 'buildingsJson'),
      `${field}.buildingsJson`,
    ).map((building, index) => mapBuilding(building, `${field}.buildingsJson[${index}]`)),
  };

  assignText(row, 'districtCode', optionalText(read(group, 'districtCode')));
  assignText(row, 'districtLabel', optionalText(read(group, 'districtLabel')));
  assignNumber(row, 'sortOrder', optionalNumber(read(group, 'sortOrder')));
  assignBoolean(
    row,
    'isCurrentEstateDistrict',
    optionalBoolean(read(group, 'isCurrentEstateDistrict')),
  );

  return row;
}

export function mapBuilding(building: JsonRecord, field: string): EstateBuildingRow {
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
  assignResourceCostSummary(row, building, field);

  return row;
}

export function mapNullableUpgradePreview(
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
  assignResourceCostSummary(row, preview, field);

  return row;
}

function assignResourceCostSummary(
  row: EstateBuildingRow | EstateUpgradePreview,
  source: JsonRecord,
  field: string,
): void {
  assignBoolean(row, 'meetsResourceCosts', optionalBoolean(read(source, 'meetsResourceCosts')));
  assignBoolean(
    row,
    'canAffordResourceCosts',
    optionalBoolean(read(source, 'canAffordResourceCosts')),
  );
  assignNumber(row, 'resourceCostCount', optionalNumber(read(source, 'resourceCostCount')));
  assignNumber(
    row,
    'unmetResourceCostCount',
    optionalNumber(read(source, 'unmetResourceCostCount')),
  );

  const resourceCostFailures = read(source, 'resourceCostFailuresJson');

  if (resourceCostFailures !== undefined) {
    row.resourceCostFailuresJson = requiredArray(
      resourceCostFailures,
      `${field}.resourceCostFailuresJson`,
    ).map((cost, index) => mapCost(cost, `${field}.resourceCostFailuresJson[${index}]`));
  }
}

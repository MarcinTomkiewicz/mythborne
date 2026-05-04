import { EditableBuilding } from '../../domain/building/building.model';
import { BuildingResourceType } from '../../types/building.types';

const VERY_SHORT_BUILD_SECONDS = 10;
const VERY_LONG_BUILD_SECONDS = 86_400;
const HIGH_RESOURCE_COST = 100_000;

export interface BuildingAdminValueFlagHelpers {
  fieldLabel(key: string): string;
  duration(seconds: number): string;
  resource(type: BuildingResourceType): string;
}

export function buildingAdminValueFlags(
  draft: EditableBuilding,
  helpers: BuildingAdminValueFlagHelpers,
): string[] {
  const flags: string[] = [];

  if (draft.startingLevel > 1) {
    flags.push(`${helpers.fieldLabel('starting_level')}: ${draft.startingLevel}`);
  }

  if (draft.maxLevel === 0) {
    flags.push(`${helpers.fieldLabel('max_level')}: 0`);
  }

  if (
    draft.baseBuildTimeSeconds > 0 &&
    (draft.baseBuildTimeSeconds <= VERY_SHORT_BUILD_SECONDS ||
      draft.baseBuildTimeSeconds >= VERY_LONG_BUILD_SECONDS)
  ) {
    flags.push(
      `${helpers.fieldLabel('base_build_time_seconds')}: ${helpers.duration(draft.baseBuildTimeSeconds)}`,
    );
  }

  const highCost = draft.resourceCosts.find((cost) => cost.baseValue >= HIGH_RESOURCE_COST);
  if (highCost) {
    flags.push(
      `${helpers.fieldLabel('cost_base_value')}: ${highCost.baseValue} ${helpers.resource(highCost.resourceType)}`,
    );
  }

  return flags;
}

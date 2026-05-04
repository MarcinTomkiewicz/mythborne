import { toStandardBuildingTargetLevel } from '../../../core/utils/building-upgrade-formula-variables';

export function preferredBuildingSweepVariable(
  variables: readonly string[],
  targetKey: string | null,
): string | null {
  if (targetKey === 'building_upgrade_cost' || targetKey === 'building_upgrade_time') {
    return (
      variables.find((variable) => variable === 'targetLevel') ??
      variables.find((variable) => variable === 'currentLevel') ??
      null
    );
  }

  return null;
}

export function buildingTargetLevelWarning(
  currentLevel: number | null,
  targetLevel: number | null,
): string | null {
  if (currentLevel === null || targetLevel === null) {
    return null;
  }

  return targetLevel === toStandardBuildingTargetLevel(currentLevel)
    ? null
    : 'Preview targetLevel does not match the standard currentLevel + 1 upgrade flow.';
}

export function buildingUpgradeSummary(
  currentLevel: number | null,
  targetLevel: number | null,
): string | null {
  return currentLevel === null || targetLevel === null
    ? null
    : `Previewing upgrade currentLevel ${currentLevel} -> targetLevel ${targetLevel}`;
}

import { BUILDING_PROGRESSION_TARGET_KEYS } from '../domain/progression/building-progression.model';

export interface BuildingUpgradeFormulaVariablesInput {
  currentLevel: number;
  rank: number;
  baseCost?: number;
  baseTimeSeconds?: number;
}

export function isBuildingUpgradeFormulaTarget(targetKey: string | null | undefined): boolean {
  return (
    targetKey === BUILDING_PROGRESSION_TARGET_KEYS.upgradeCost ||
    targetKey === BUILDING_PROGRESSION_TARGET_KEYS.upgradeTime
  );
}

export function toStandardBuildingTargetLevel(currentLevel: number): number {
  return currentLevel + 1;
}

export function buildBuildingUpgradeFormulaVariables(
  input: BuildingUpgradeFormulaVariablesInput,
): Record<string, number> {
  const variables: Record<string, number> = {
    currentLevel: input.currentLevel,
    targetLevel: toStandardBuildingTargetLevel(input.currentLevel),
    rank: input.rank,
  };

  if (input.baseCost !== undefined) {
    variables['baseCost'] = input.baseCost;
  }

  if (input.baseTimeSeconds !== undefined) {
    variables['baseTimeSeconds'] = input.baseTimeSeconds;
  }

  return variables;
}

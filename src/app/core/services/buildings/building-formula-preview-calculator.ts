import { Injectable, inject } from '@angular/core';
import {
  BuildingProgressionPreview,
  BuildingResourceType,
  EditableBuilding,
  EditableBuildingBonus,
  EditableBuildingResourceCost,
} from '../../domain/building/building.model';
import { BuildingProgressionRules } from '../../domain/progression/building-progression.model';
import { resourceOrder, toResourceLabel } from '../../utils/building-display';
import { nonNegativeInteger } from '../../utils/number';
import { BuildingProgressionService } from '../progression/building-progression';

export interface BuildingFormulaCostPreview {
  resourceType: BuildingResourceType;
  amount: number | null;
  reason: string | null;
}

export interface BuildingFormulaLevelPreview {
  currentLevel: number;
  targetLevel: number;
  nextCosts: BuildingFormulaCostPreview[];
  costUnavailableReason: string | null;
  nextTime: number | null;
  timeUnavailableReason: string | null;
  bonuses: Array<{
    target: string;
    type: EditableBuildingBonus['type'];
    current: number;
    next: number;
  }>;
}

export type BuildingProgressionImpactRow = BuildingProgressionPreview & {
  status: 'upgradeable' | 'district blocked' | 'above cap';
  isAboveCap: boolean;
  formula: BuildingFormulaLevelPreview | null;
};

interface FormulaPreviewInput {
  building: EditableBuilding;
  rules: BuildingProgressionRules;
  costs: readonly EditableBuildingResourceCost[];
  bonuses: readonly EditableBuildingBonus[];
}

interface FormulaRangePreviewInput extends FormulaPreviewInput {
  fromLevel: number;
  toLevel: number;
  isRangeValid: boolean;
}

@Injectable()
export class BuildingFormulaPreviewCalculator {
  private readonly buildingProgression = inject(BuildingProgressionService);

  singleLevelPreview(
    levelInput: unknown,
    input: FormulaPreviewInput,
  ): BuildingFormulaLevelPreview {
    return this.previewForLevel(nonNegativeInteger(levelInput), input);
  }

  rangePreview(input: FormulaRangePreviewInput): BuildingFormulaLevelPreview[] {
    if (
      !input.isRangeValid ||
      !Number.isInteger(input.fromLevel) ||
      !Number.isInteger(input.toLevel) ||
      input.fromLevel > input.toLevel ||
      input.toLevel - input.fromLevel + 1 > 50
    ) {
      return [];
    }

    return Array.from({ length: input.toLevel - input.fromLevel + 1 }, (_, index) =>
      this.previewForLevel(input.fromLevel + index, input),
    );
  }

  progressionImpactRows(
    dbRows: readonly BuildingProgressionPreview[],
    formulaRows: readonly BuildingFormulaLevelPreview[],
  ): BuildingProgressionImpactRow[] {
    const formulaByLevel = new Map(formulaRows.map((row) => [row.currentLevel, row]));

    return dbRows.map((row) => {
      const formula = formulaByLevel.get(row.previewLevel) ?? null;
      const isAboveCap =
        !row.isUnlimited && row.effectiveMaxLevel > 0 && row.nextLevel > row.effectiveMaxLevel;
      const status = !row.isAvailableInSelectedDistrict
        ? 'district blocked'
        : isAboveCap
          ? 'above cap'
          : 'upgradeable';

      return {
        ...row,
        status,
        isAboveCap,
        formula,
      };
    });
  }

  private previewForLevel(
    currentLevel: number,
    input: FormulaPreviewInput,
  ): BuildingFormulaLevelPreview {
    const rank = 1;
    const targetLevel = currentLevel + 1;
    const costPreview = this.costPreviewForLevel(currentLevel, rank, input);
    const timePreview = this.timePreviewForLevel(currentLevel, rank, input);

    return {
      currentLevel,
      targetLevel,
      nextCosts: costPreview.costs,
      costUnavailableReason: costPreview.reason,
      nextTime: timePreview.amount,
      timeUnavailableReason: timePreview.reason,
      bonuses: input.bonuses.map((bonus) => ({
        target: bonus.target,
        type: bonus.type,
        current:
          this.buildingProgression.getBonusValue(currentLevel, Number(bonus.value), input.rules) ?? 0,
        next:
          this.buildingProgression.getBonusValue(targetLevel, Number(bonus.value), input.rules) ?? 0,
      })),
    };
  }

  private costPreviewForLevel(
    currentLevel: number,
    rank: number,
    input: FormulaPreviewInput,
  ): { costs: BuildingFormulaCostPreview[]; reason: string | null } {
    if (!input.rules.costExpression) {
      return {
        costs: [],
        reason: 'Formula cost preview unavailable because no building upgrade cost formula is assigned.',
      };
    }

    if (!input.costs.length) {
      return {
        costs: [],
        reason: 'Formula cost preview unavailable because no editable resource cost rows are configured.',
      };
    }

    const targetLevel = currentLevel + 1;
    const applicableCosts = input.costs.filter(
      (cost) => Number(cost.appliesFromLevel) <= targetLevel,
    );

    if (!applicableCosts.length) {
      const firstLevel = Math.min(...input.costs.map((cost) => Number(cost.appliesFromLevel)));
      return {
        costs: [],
        reason: `No editable resource cost row applies to targetLevel ${targetLevel}. The first configured row starts at level ${firstLevel}.`,
      };
    }

    const costs = applicableCosts.reduce((acc, cost) => {
      const baseValue = Number(cost.baseValue);
      const evaluation = Number.isFinite(baseValue)
        ? this.buildingProgression.getUpgradeCostResult(currentLevel, baseValue, rank, input.rules)
        : { value: null, error: 'Cost row base value is not a finite number.' };
      const reason = evaluation.error
        ? `${toResourceLabel(cost.resourceType)} cost formula failed: ${evaluation.error}`
        : null;
      const existing = acc.find((entry) => entry.resourceType === cost.resourceType);

      if (existing) {
        existing.amount =
          existing.amount === null || evaluation.value === null
            ? null
            : existing.amount + evaluation.value;
        existing.reason = combinePreviewReasons(existing.reason, reason);
      } else {
        acc.push({
          resourceType: cost.resourceType,
          amount: evaluation.value,
          reason,
        });
      }

      return acc;
    }, [] as BuildingFormulaCostPreview[]);

    return {
      costs: costs.sort(
        (left, right) => resourceOrder(left.resourceType) - resourceOrder(right.resourceType),
      ),
      reason: null,
    };
  }

  private timePreviewForLevel(
    currentLevel: number,
    rank: number,
    input: FormulaPreviewInput,
  ): { amount: number | null; reason: string | null } {
    if (!input.rules.timeExpression) {
      return {
        amount: null,
        reason: 'Build time preview unavailable because no building upgrade time formula is assigned.',
      };
    }

    const result = this.buildingProgression.getUpgradeTimeSecondsResult(
      currentLevel,
      Number(input.building.baseBuildTimeSeconds ?? 0),
      rank,
      input.rules,
    );

    return {
      amount: result.value,
      reason: result.error
        ? `Build time formula failed: ${result.error}`
        : null,
    };
  }
}

function combinePreviewReasons(left: string | null, right: string | null): string | null {
  return [left, right].filter(Boolean).join(' ') || null;
}

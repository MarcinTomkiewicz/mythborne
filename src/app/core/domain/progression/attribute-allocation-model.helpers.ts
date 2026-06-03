import {
  AttributePageContextFailureReason,
  AttributePageContextResult,
  AttributePageStatRow,
} from '../../interfaces/progression/attribute-allocation-page.interface';
import {
  AttributeAllocationModel,
  AttributeAllocationModelStatRow,
} from './attribute-allocation-preview-manifest.model';

interface ActiveHeroContextLike {
  heroId?: string | null;
  serverId?: string | null;
}

interface SelectedServerContextLike {
  id?: string | null;
}

export function resolveAttributePageContext(
  activeHero: ActiveHeroContextLike | null | undefined,
  selectedServer: SelectedServerContextLike | null | undefined,
): AttributePageContextResult {
  const activeHeroHeroId = activeHero?.heroId ?? null;
  const activeHeroServerId = activeHero?.serverId ?? null;
  const selectedServerId = selectedServer?.id ?? null;
  const reasons: AttributePageContextFailureReason[] = [];

  if (!activeHeroHeroId) {
    reasons.push('missing_active_hero_id');
  }

  if (!activeHeroServerId) {
    reasons.push('missing_active_hero_server_id');
  }

  if (!selectedServerId) {
    reasons.push('missing_selected_server_id');
  }

  if (
    activeHeroServerId
    && selectedServerId
    && selectedServerId !== activeHeroServerId
  ) {
    reasons.push('selected_server_mismatch');
  }

  if (reasons.length > 0 || !activeHeroHeroId || !activeHeroServerId) {
    return {
      context: null,
      activeHeroHeroId,
      activeHeroServerId,
      selectedServerId,
      reasons,
    };
  }

  return {
    context: {
      heroId: activeHeroHeroId,
      serverId: activeHeroServerId,
    },
    activeHeroHeroId,
    activeHeroServerId,
    selectedServerId,
    reasons,
  };
}

export function mapAttributePageStatRows(
  model: AttributeAllocationModel | null,
  draftValues: Record<string, number>,
  availableCharacterPoints: number,
): AttributePageStatRow[] {
  return model?.statRows.map((row) => {
    const draftValue = draftValues[row.statKey] ?? row.draftValue;
    const totalCost = costForDraftValue(row, draftValue);
    const nextDraftValue = draftValue + 1;
    const isAtCap = draftValue >= row.maxAllocatedValue;
    const costStepNextCost = costFromSourceAllocatedValue(row, draftValue);
    const nextIncreaseCost = isAtCap
      ? null
      : costForNextIncrease(row, draftValue);
    const nextTotalCost = nextIncreaseCost === null
      ? null
      : totalDraftCostForModel(model, {
          ...draftValues,
          [row.statKey]: nextDraftValue,
        });
    const hasIncreaseBlocker = !!row.increaseBlockerReasonKey || !!row.increaseBlockerMessage;

    return {
      ...row,
      draftValue,
      pendingLevels: Math.max(0, draftValue - row.currentAllocatedValue),
      totalCost,
      nextIncreaseCost,
      displayNextCost: draftValue === row.draftValue
        ? costStepNextCost ?? row.nextLevelCost
        : costStepNextCost,
      canDecrease: draftValue > row.currentAllocatedValue,
      canIncrease:
        draftValue < row.maxAllocatedValue
        && nextIncreaseCost !== null
        && nextTotalCost !== null
        && nextTotalCost <= availableCharacterPoints
        && !hasIncreaseBlocker,
    };
  }) ?? [];
}

export function commonMaxAllocatedValue(
  rows: readonly AttributePageStatRow[],
): number | null {
  const first = rows[0]?.maxAllocatedValue;

  if (typeof first !== 'number') {
    return null;
  }

  return rows.every((row) => row.maxAllocatedValue === first)
    ? first
    : null;
}

export function costForDraftValue(
  row: AttributeAllocationModelStatRow,
  draftValue: number,
): number | null {
  if (draftValue === row.currentAllocatedValue) {
    return 0;
  }

  return row.costSteps.find((step) => step.targetAllocatedValue === draftValue)
    ?.cumulativeCostFromCurrent ?? null;
}

export function costForNextIncrease(
  row: AttributeAllocationModelStatRow,
  draftValue: number,
): number | null {
  const targetValue = draftValue + 1;
  const directStep = row.costSteps.find((step) =>
    step.sourceAllocatedValue === draftValue
    && step.targetAllocatedValue === targetValue
  );

  if (directStep) {
    return directStep.cost;
  }

  const currentCost = costForDraftValue(row, draftValue);
  const targetCost = costForDraftValue(row, targetValue);

  return currentCost === null || targetCost === null
    ? null
    : targetCost - currentCost;
}

export function costFromSourceAllocatedValue(
  row: AttributeAllocationModelStatRow,
  draftValue: number,
): number | null {
  return row.costSteps.find((step) => step.sourceAllocatedValue === draftValue)
    ?.cost ?? null;
}

export function totalDraftCostForModel(
  model: AttributeAllocationModel,
  draftValues: Record<string, number>,
): number | null {
  let total = 0;

  for (const row of model.statRows) {
    const draftValue = draftValues[row.statKey] ?? row.draftValue;
    const cost = costForDraftValue(row, draftValue);

    if (cost === null) {
      return null;
    }

    total += cost;
  }

  return total;
}

export function currentBaseStatValues(
  model: AttributeAllocationModel | null,
): Record<string, number> {
  return Object.fromEntries(
    model?.statRows.map((row) => [
      row.statKey,
      row.currentAllocatedValue,
    ]) ?? [],
  );
}

export function initialDraftValues(
  model: AttributeAllocationModel,
): Record<string, number> {
  return Object.fromEntries(
    model.statRows.map((row) => [row.statKey, row.draftValue]),
  );
}

import type {
  ExplorationResultNarrativeSnapshotV1,
} from '../domain/exploration/exploration-result-copy.model';

export function isTrialResultKind(
  result: ExplorationResultNarrativeSnapshotV1,
): boolean {
  return (
    result.resultKind === 'trial_resolved_success' ||
    result.resultKind === 'trial_resolved_failure'
  );
}

export function isEncounterCombatResultKind(
  result: ExplorationResultNarrativeSnapshotV1,
): boolean {
  return (
    result.resultKind === 'encounter_combat_success' ||
    result.resultKind === 'encounter_combat_failure'
  );
}

export function canRenderExplorationRewardSupplement(
  result: ExplorationResultNarrativeSnapshotV1,
): boolean {
  return isTrialResultKind(result) || isEncounterCombatResultKind(result);
}

export function canRenderExplorationEffectSupplement(
  result: ExplorationResultNarrativeSnapshotV1,
): boolean {
  return isEncounterCombatResultKind(result);
}

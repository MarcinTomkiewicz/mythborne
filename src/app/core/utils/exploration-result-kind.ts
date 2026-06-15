import type {
  ExplorationResultNarrativeSnapshot,
} from '../domain/exploration/exploration-result-copy.model';

export function isTrialResultKind(
  result: ExplorationResultNarrativeSnapshot,
): boolean {
  return (
    result.resultKind === 'trial_resolved_success' ||
    result.resultKind === 'trial_resolved_failure'
  );
}

export function isEncounterCombatResultKind(
  result: ExplorationResultNarrativeSnapshot,
): boolean {
  return (
    result.resultKind === 'encounter_combat_success' ||
    result.resultKind === 'encounter_combat_failure'
  );
}

export function canRenderExplorationRewardSupplement(
  result: ExplorationResultNarrativeSnapshot,
): boolean {
  return isTrialResultKind(result) || isEncounterCombatResultKind(result);
}

export function canRenderExplorationEffectSupplement(
  result: ExplorationResultNarrativeSnapshot,
): boolean {
  return isEncounterCombatResultKind(result);
}

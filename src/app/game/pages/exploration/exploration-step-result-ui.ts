import {
  ExplorationResultNarrativeSnapshotV1,
} from '../../../core/domain/exploration/exploration-result-copy.model';
import { HeroExplorationStepResolutionReadModel } from '../../../core/domain/exploration/exploration-runtime.model';
import { mapOptionalExplorationResultNarrativeSnapshot } from '../../../core/utils/exploration-result-copy.mapper';
import { read, requiredRecord } from '../../../core/utils/json-read';

export function explorationStepResultNarrativeSnapshot(
  result: HeroExplorationStepResolutionReadModel | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  if (!result) {
    return null;
  }

  const metadata = requiredRecord(result.metadataJson, 'resolve_hero_exploration_step.metadataJson');

  return mapOptionalExplorationResultNarrativeSnapshot(
    read(metadata, 'resultNarrativeJson'),
    'resolve_hero_exploration_step.metadataJson.resultNarrativeJson',
  );
}

export function explorationStepTrialManifestationNarrativeSnapshot(
  result: HeroExplorationStepResolutionReadModel | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  if (!result) {
    return null;
  }

  const metadata = requiredRecord(result.metadataJson, 'resolve_hero_exploration_step.metadataJson');

  return mapOptionalExplorationResultNarrativeSnapshot(
    read(metadata, 'trialManifestationNarrativeJson'),
    'resolve_hero_exploration_step.metadataJson.trialManifestationNarrativeJson',
  );
}

export function explorationStepEncounterCombatHandoffNarrativeSnapshot(
  result: HeroExplorationStepResolutionReadModel | null,
): ExplorationResultNarrativeSnapshotV1 | null {
  if (!result) {
    return null;
  }

  const metadata = requiredRecord(result.metadataJson, 'resolve_hero_exploration_step.metadataJson');

  return mapOptionalExplorationResultNarrativeSnapshot(
    read(metadata, 'encounterCombatHandoffNarrativeJson'),
    'resolve_hero_exploration_step.metadataJson.encounterCombatHandoffNarrativeJson',
  );
}
